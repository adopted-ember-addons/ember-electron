'use strict'

const fs = require('fs')
const path = require('path')
const RSVP = require('rsvp')
const sinon = require('sinon')
const Command = require('ember-cli/lib/models/command')
const Task = require('ember-cli/lib/models/task')
const TestTask = require('ember-cli/lib/tasks/test')
const MockUI = require('ember-cli/tests/helpers/mock-ui')
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics')
const MockProject = require('../../../helpers/mocks/project')
const expect = require('../../../helpers/expect')

describe('ember electron:test command', () => {
  let CommandUnderTest, commandOptions, tasks, outputPath

  beforeEach(() => {
    let cmd = require('../../../../lib/commands/electron-test')
    CommandUnderTest = Command.extend(cmd)

    commandOptions = {
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject('project-with-test-config'),
      tasks: {
        Build: Task.extend({
          run: (options) => {
            outputPath = options.outputPath

            let fixturePath = path.join(__dirname, '../../../fixtures')
            let baseIndex = path.join(fixturePath, 'project-with-test-config', 'tests', 'index.html')

            let testsDir = path.join(outputPath, 'tests')
            let testsIndex = path.join(testsDir, 'index.html')

            fs.mkdirSync(testsDir, 0x1ff)

            let indexContent = fs.readFileSync(baseIndex, { encoding: 'utf8' })
            fs.writeFileSync(testsIndex, indexContent)

            tasks.push('build')
            return RSVP.resolve()
          }
        }),

        Test: Task.extend({
          run: (options) => {
            tasks.push('test')
            return RSVP.resolve()
          }
        })
      }
    }

    tasks = []
  })

  it('should build the project before running tests', () => {
    let command = new CommandUnderTest(commandOptions).validateAndRun()

    return expect(command).to.be.fulfilled.then(() => {
      expect(tasks).to.deep.equal(['build', 'test'])
    })
  })

  it('should call the Test task with the correct options', () => {
    let testem, testOptions

    commandOptions.tasks.Test = TestTask.extend({
      init: function (options) {
        const Testem = require('testem')
        testem = this.testem = new Testem()

        this.project = commandOptions.project

        sinon.stub(this.testem, 'startCI', function (options, callback) {
          this.app = {
            reporter: { total: 10 }
          }
          testOptions = options
          callback()
        })
      }
    })

    let command = new CommandUnderTest(commandOptions).validateAndRun()

    return expect(command).to.be.fulfilled.then(() => {
      const ciLauncherName = 'Electron (CI)'
      const devLauncherName = 'Electron'

      expect(testOptions.cwd).to.equal(outputPath)
      expect(testOptions['launch_in_ci']).to.deep.equal([ciLauncherName])
      expect(testOptions['launch_in_dev']).to.deep.equal([devLauncherName])

      let ciLauncher = testOptions.launchers[ciLauncherName] || {}
      expect(ciLauncher.protocol).to.equal('tap')

      let runnerCiPath = require.resolve('../../../../lib/commands/electron-test/runner-ci')
      expect(ciLauncher.command).to.equal('node "' + runnerCiPath + '" --electron-path "Electron" --tests-path "' + path.join(outputPath, 'tests') + '"')

      let devLauncher = testOptions.launchers[devLauncherName] || {}
      expect(devLauncher.protocol).to.equal('browser')
      let runnerDevPath = require.resolve('../../../../lib/commands/electron-test/runner-ci')
      expect(ciLauncher.command).to.equal('node "' + runnerDevPath + '" --electron-path "Electron" --tests-path "' + path.join(outputPath, 'tests') + '"')

      testem.startCI.restore()
    })
  })
})
