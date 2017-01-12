'use strict'

const MockUI = require('ember-cli/tests/helpers/mock-ui')
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics')
const MockProject = require('../../helpers/mocks/project')
const expect = require('../../helpers/expect')
const ElectronTestTask = require('../../../lib/tasks/electron-test')

describe('electron test task', () => {
  let task

  beforeEach(() => {
    task = new ElectronTestTask({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject('project-with-test-config')
    })
  })

  it('creates a testem instance', () => {
    expect(task.testem).to.be.ok
  })

  it('sets the file in the testem options', () => {
    expect(task.testemOptions({}).file).to.equal('testem-electron.js')
  })
})
