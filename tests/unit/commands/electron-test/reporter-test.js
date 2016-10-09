'use strict'

const sinon = require('sinon')
const expect = require('../../../helpers/expect')

describe('CustomTapReporter', () => {
  let tapReporter, logs

  before(() => {
    tapReporter = require('../../../../lib/commands/electron-test/reporter')
  })

  beforeEach(() => {
    logs = []

    sinon.stub(process.stdout, 'write', (data) => {
      logs.push(data)
    })
  })

  describe('when a test passes', () => {
    it('should not include error details', () => {
      let data = {
        passed: 1,
        failed: 0,
        total: 1,
        id: 48,
        name: 'Unit - Reporter - successful test',
        items: []
      }

      tapReporter.report('Electron', data)
      process.stdout.write.restore()

      expect(logs).to.deep.equal([
        'ok 1 Electron - Unit - Reporter - successful test\n'
      ])
    })
  })

  describe('when a test fails', () => {
    it('should include error details', () => {
      let stack = {
        module: 'Unit - Reporter',
        name: 'failed test',
        result: false,
        message: 'foo is true',
        actual: false,
        expected: true,
        testId: '593a7efd',
        runtime: 222,
        source: '    at file:///Users/user/project/foo/bar.js:45737:33)'
      }

      let data = {
        passed: 0,
        failed: 1,
        total: 1,
        id: 23,
        name: 'Unit - Reporter - failed test',
        items: [{
          id: 1,
          ok: false,
          name: 'Unit - Reporter - failed test',
          stack: JSON.stringify(stack),
          passed: false
        }]
      }

      tapReporter.report('Electron', data)
      process.stdout.write.restore()

      expect(logs[0]).to.contain('not ok 2 Electron - Unit - Reporter - failed test\n')
    })
  })
})
