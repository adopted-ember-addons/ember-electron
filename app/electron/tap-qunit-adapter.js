;(function (window) {
  'use strict'

  // Exit immediately if we're not running in Electron
  if (!window.ELECTRON) {
    return
  }

  // Log QUnit results to the console so they show up
  // in the `Electron` process output.
  function log (content) {
    console.log(`[qunit-logger] ${content}`)
    window.process.stdout.write(`[qunit-logger] ${content}`)
  }

  function setQUnitAdapter () {
    let testCount = 0

    window.QUnit.begin((details) => {
      if (details.totalTests >= 1) {
        log(`1..${details.totalTests}`)
      }
    })

    window.QUnit.testDone((details) => {
      testCount++
      if (details.failed === 0) {
        log(`ok ${testCount} - ${details.module} # ${details.name}`)
      }
    })

    window.QUnit.log((details) => {
      if (details.result !== true) {
        const actualTestCount = testCount + 1
        log(`# ${JSON.stringify(details)}`)
        log(`not ok ${actualTestCount} - ${details.module} - ${details.name}`)
      }
    })

    window.QUnit.done((details) => {
      log('# done' + (details.failed === 0 ? '' : ' with errors'))
    })
  }

  window.addEventListener('load', setQUnitAdapter)
}(this))
