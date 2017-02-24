'use strict';

/**
 * This code is mostly taken from Joost de Vries's amazing ember-cli-remote-inspector
 * https://github.com/joostdevries/ember-cli-remote-inspector
 */
const chalk = require('chalk');
const express = require('express');
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');
const { Server } = require('http');
const findEmberInspector = require('./find-ember-inspector');

const remoteDebugger = express();
const inspectorPath = findEmberInspector();
const remoteDebugServer = Server(remoteDebugger); // eslint-disable-line new-cap
const remoteDebugSocket = socketIo(remoteDebugServer);
let inspectorSocket = null;

// Server static files for the inspector
if (!inspectorPath) {
  console.log(chalk.bold.red('Ember Inspector not found!'));
  console.log(chalk.red('You can fix this issue by running "npm i ember-inspector --save-dev".'));
  process.exit(1);
}

remoteDebugger.use('/', express.static(inspectorPath, {
  index: false,
}));

// Serve the inspector itself
let inspectorHtml = fs.readFileSync(path.join(inspectorPath, 'index.html')).toString();
remoteDebugger.get('/', (req, res) => {
  res.end(inspectorHtml);
});

module.exports = {
  /*
   Injects the script used to connect socket.io to the inspector into the inspector HTML
   */
  setRemoteDebugSocketScript(scriptHtml) {
    inspectorHtml = inspectorHtml.replace('{{ remote-port }}', scriptHtml);
  },

  /*
   Start the server for the inspector + socket.io
   */
  start(port, host, ui) {
    try {
      remoteDebugServer.listen(port, host);
    } catch(e) {
      ui.writeLine(chalk.bold.red('Ember Inspector Server could not start. Is it already running?'));
      console.log(e);
    }

    process.on('SIGTERM', () => {
      remoteDebugServer.close();
    });

    remoteDebugSocket.on('connect', (socket) => {
      socket.on('emberInspectorMessage', (msg) => {
        if (msg.from === 'devtools') {
          // If this message comes from the inspector, emit to all clients
          // and set inspectorSocket
          inspectorSocket = socket;
          remoteDebugSocket.emit('emberInspectorMessage', msg);
        } else if (inspectorSocket) {
          // If the messge comes from a client, send only to inspector
          inspectorSocket.emit('emberInspectorMessage', msg);
        }
      });
    });
  },
};
