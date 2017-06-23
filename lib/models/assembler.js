/* eslint-disable ember-suave/prefer-destructuring, newline-before-return, arrow-parens */
'use strict';
const exit = require('capture-exit');
exit.captureExit();

const fs = require('fs-extra');
const path = require('path');
const Promise = require('rsvp').Promise;
const CoreObject = require('core-object');
const SilentError = require('silent-error');
const chalk = require('chalk');

const rimraf = require('rimraf').sync;
const Sync = require('tree-sync');

/**
 * Wrapper for the Broccoli [Builder](https://github.com/broccolijs/broccoli/blob/master/lib/builder.js) class.
 * Used to assemble an ember-electron app after the Ember build is complete.
 *
 * This file is copied from ember-cli/lib/models/builder.js, and adapted to meet
 * our needs. This mainly meant modifying/simplifying how we build the tree
 * that we pass to the broccoli builder, removing some build instrumentation
 * and updating some UI strings.
 *
 * @private
 * @module ember-electron
 * @class Assembler
 * @constructor
 * @extends Task
 */
class Assembler extends CoreObject {

  constructor(options) {
    super(options);

    this.setupBroccoliBuilder();
    this.trapSignals();
    this._instantiationStack = (new Error()).stack.replace(/[^\n]*\n/, '');
  }

  /**
   * @private
   * @method setupBroccoliBuilder
   */
  setupBroccoliBuilder() {
    this.platform = this.platform || process.platform;

    const broccoli = require('broccoli-builder');

    this.tree = this.makeTree();

    this.builder = new broccoli.Builder(this.tree);
  }

  makeTree() {
    const assembleTree = require('../utils/assemble-tree');

    return assembleTree({
      ui: this.ui,
      project: this.project,
      platform: this.platform,
      inputNode: this.emberBuildPath,
    });
  }

  /**
   * @private
   * @method trapSignals
   */
  trapSignals() {
    this._boundOnSIGINT = this.onSIGINT.bind(this);
    this._boundOnSIGTERM = this.onSIGTERM.bind(this);
    this._boundOnMessage = this.onMessage.bind(this);
    this._boundCleanup = this.cleanup.bind(this);

    process.on('SIGINT', this._boundOnSIGINT);
    process.on('SIGTERM', this._boundOnSIGTERM);
    process.on('message', this._boundOnMessage);
    exit.onExit(this._boundCleanup);

    if (/^win/.test(process.platform)) {
      this.trapWindowsSignals();
    }
  }

  _cleanupSignals() {
    process.removeListener('SIGINT', this._boundOnSIGINT);
    process.removeListener('SIGTERM', this._boundOnSIGTERM);
    process.removeListener('message', this._boundOnMessage);
    exit.offExit(this._boundCleanup);

    if (/^win/.test(process.platform)) {
      this._cleanupWindowsSignals();
    }
  }

  /**
   * @private
   * @method trapWindowsSignals
   */
  trapWindowsSignals() {
    // This is required to capture Ctrl + C on Windows
    if (process.stdin && process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      this._windowsCtrlCTrap = function(data) {
        if (data.length === 1 && data[0] === 0x03) {
          process.emit('SIGINT');
        }
      };
      process.stdin.on('data', this._windowsCtrlCTrap);
    }
  }

  _cleanupWindowsSignals() {
    if (this._windowsCtrlCTrap && process.stdin.removeListener) {
      process.stdin.removeListener('data', this._windowsCtrlCTrap);
    }
  }

  /**
    Determine whether the output path is safe to delete. If the outputPath
    appears anywhere in the parents of the project root, the build would
    delete the project directory. In this case return `false`, otherwise
    return `true`.

    @private
    @method canDeleteOutputPath
    @param {String} outputPath
    @return {Boolean}
  */
  canDeleteOutputPath(outputPath) {
    let rootPathParents = [this.project.root];
    let dir = path.dirname(this.project.root);
    rootPathParents.push(dir);
    while (dir !== path.dirname(dir)) {
      dir = path.dirname(dir);
      rootPathParents.push(dir);
    }
    return rootPathParents.indexOf(outputPath) === -1;
  }

  /**
   * @private
   * @method copyToOutputPath
   * @param {String} inputPath
   */
  copyToOutputPath(inputPath) {
    let outputPath = this.outputPath;

    fs.mkdirsSync(outputPath);

    if (!this.canDeleteOutputPath(outputPath)) {
      throw new SilentError(`Using an assembly destination path of \`${outputPath}\` is not supported.`);
    }

    let sync = this._sync;
    if (sync === undefined) {
      this._sync = sync = new Sync(inputPath, path.resolve(this.outputPath));
    }

    // Make sure there's isn't a symlinked node_modules from an ember electron
    // command, or sync'ing will traverse into it and delete folders out of our
    // project's node_modules.
    const modules = path.join(outputPath, 'node_modules');
    if (outputPath && fs.existsSync(modules)) {
      // Will unlink if it's a symlink or recursively delete if not
      rimraf(modules);
    }

    let changes = sync.sync();

    return changes.map(op => op[1]);
  }

  /**
   * @private
   * @method processBuildResult
   * @param results
   * @return {Promise}
   */
  processBuildResult(results) {
    let self = this;

    return Promise.resolve()
      .then(() => self.copyToOutputPath(results.directory))
      .then(syncResult => {
        results.outputChanges = syncResult;
        return results;
      });
  }

  /**
   * @private
   * @method assemble
   * @return {Promise}
   */
  assemble(willReadStringDir) {
    return this.builder.build(willReadStringDir)
      .then(this.processBuildResult.bind(this));
  }

  /**
   * Delegates to the `cleanup` method of the wrapped Broccoli builder.
   *
   * @private
   * @method cleanup
   * @return {Promise}
   */
  cleanup() {
    let ui = this.project.ui;
    ui.startProgress('cleaning up');
    ui.writeLine('cleaning up...');

    this._cleanupSignals();

    return this.builder.cleanup().finally(() => {
      ui.stopProgress();
    }).catch(err => {
      ui.writeLine(chalk.red('Cleanup error.'));
      ui.writeError(err);
    });
  }

  /**
   * Handles the `SIGINT` signal.
   *
   * Calls {{#crossLink "Builder/cleanupAndExit:method"}}{{/crossLink}} by default.
   *
   * @private
   * @method onSIGINT
   */
  onSIGINT() {
    process.exit(1);
  }

  /**
   * Handles the `SIGTERM` signal.
   *
   * Calls {{#crossLink "Builder/cleanupAndExit:method"}}{{/crossLink}} by default.
   *
   * @private
   * @method onSIGTERM
   */
  onSIGTERM() {
    process.exit(1);
  }

  /**
   * Handles the `message` event on the `process`.
   *
   * Calls `process.exit` if the `kill` property on the `message` is set.
   *
   * @private
   * @method onMessage
   */
  onMessage(message) {
    if (message.kill) {
      process.exit(1);
    }
  }
}

module.exports = Assembler;
