'use strict'

var glob = require('globby')
var Mocha = require('mocha')

var mocha = new Mocha({
  reporter: 'spec'
})

var root = 'node-tests/'

function addFiles (mocha, files) {
  glob.sync(root + files).forEach(mocha.addFile.bind(mocha))
}

addFiles(mocha, 'mocha-standard.js')
addFiles(mocha, '/unit/**/*-test.js')

mocha.run(function (failures) {
  process.on('exit', function () {
    process.exit(failures)
  })
})
