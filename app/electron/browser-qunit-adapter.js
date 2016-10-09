;(function (window) {
  'use strict'

  // Exit immediately if we're not running in Electron
  if (!window.ELECTRON) {
    return
  }

  // Adapted from Testem's default qunit-adapter.
  function qunitAdapter (socket) {
    let currentTest, currentModule
    let id = 1
    let results = {
      failed: 0,
      passed: 0,
      total: 0,
      skipped: 0,
      tests: []
    }

    window.QUnit.log((details) => {
      const item = {
        passed: details.result,
        message: details.message
      }

      if (!details.result) {
        item.actual = details.actual
        item.expected = details.expected
      }

      currentTest.items.push(item)
    })

    window.QUnit.testStart((details) => {
      currentTest = {
        id: id++,
        name: (currentModule ? currentModule + ': ' : '') + details.name,
        items: []
      }
      socket.emit('tests-start')
    })

    window.QUnit.testDone((details) => {
      currentTest.failed = details.failed
      currentTest.passed = details.passed
      currentTest.total = details.total

      results.total++

      if (currentTest.failed > 0) {
        results.failed++
      } else {
        results.passed++
      }

      results.tests.push(currentTest)
      socket.emit('test-result', currentTest)
    })

    window.QUnit.moduleStart((details) => {
      currentModule = details.name
    })

    window.QUnit.done((details) => {
      results.runDuration = details.runtime
      socket.emit('all-test-results', results)
    })
  }

  function setQUnitAdapter (serverURL) {
    const socket = window.io(serverURL)

    socket.on('connect', () => socket.emit('browser-login', 'Electron', 1))
    socket.on('start-tests', () => {
      socket.disconnect()
      window.location.reload()
    })

    qunitAdapter(socket)
  }

  window.addEventListener('load', function () {
    setQUnitAdapter(process.env.ELECTRON_TESTEM_SERVER_URL)
  })
}(this))
