const Project = require('ember-cli/lib/models/project');
const BaseReporter = require('ember-cli-dependency-checker/lib/reporter');
const DependencyChecker = require('ember-cli-dependency-checker/lib/dependency-checker');
const { electronProjectPath } = require('./build-paths');
const { structureUrl } = require('./documentation-urls');
const path = require('path');
const chalk = require('chalk');

// Extend the reporter to add a little extra info telling the user that it's the
// Electron project, not the Ember project
class Reporter extends BaseReporter {
  report() {
    if (this.messages.length) {
      let message = this.chalk.red(`This should be done in ${electronProjectPath}/ -- see ${structureUrl} for more info.`);
      this.messages.push(`${message}${this.EOL}`);
    }
    return super.report(...arguments);
  }
}

//
// A function to run ember-cli-dependency-checker's logic inside the Electron
// app to ensure its dependencies are also up-to-date.
//
module.exports = async function checkDependencies(project) {
  // Absolute path to Electron project
  let electronProjectRoot = path.join(project.root, electronProjectPath);
  // Electron project's package.json contents
  let packageJson = require(path.join(electronProjectRoot, 'package.json'));

  let electronProject = new Project(electronProjectRoot, packageJson, project.ui, project.cli);
  let dependencyChecker = new DependencyChecker(electronProject, new Reporter());

  // The dependency checker is set up to only run once, and it has already been
  // run in the Ember project by ember-cli, so we need to clear the
  // alreadyChecked status so it will run for us here.
  DependencyChecker.setAlreadyChecked(false);
  project.ui.writeLine(chalk.green(`Checking dependencies in ${electronProjectPath}...`));
  dependencyChecker.checkDependencies();
}
