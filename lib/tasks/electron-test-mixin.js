'use strict'

module.exports = {
  init: function () {
    // Make sure to use our version of testem, rather than ember-cli's
    this.testem = this.testem || new (require('testem'))()
    this._super.apply(this, arguments)
  },

  testemOptions: function (options) {
    let testemOptions = this._super.apply(this, arguments)
    testemOptions.file = 'testem-electron.js'
    return testemOptions
  }
}
