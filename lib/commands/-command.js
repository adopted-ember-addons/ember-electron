'use strict'

const Command = require('ember-cli/lib/models/command')

module.exports = Command.extend({
  init () {
    process.env.EMBER_CLI_ELECTRON = true

    if (this._super && this._super.init) {
      this._super.init.apply(this, arguments)
    }
  }
})
