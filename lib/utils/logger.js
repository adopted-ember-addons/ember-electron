const chalkLib = require('chalk')

class Logger {
  constructor ({ ui }) {
    this.ui = ui
    this.chalk = chalkLib
  }

  error (msg, chalk = chalkLib.red) {
    this.message(msg, chalk)
  }

  message (msg, chalk = chalkLib.green) {
    this.ui.writeLine(chalk(msg))
  }

  section (msgs = [], chalk = chalkLib.green) {
    this.message(msgs.shift(), chalk.bold)
    msgs.forEach((msg) => this.message(msg, chalk))
  }

  line () {
    this.ui.writeLine('--------------------------------------------------------------------')
  }

  startProgress (msg, chalk = chalkLib.green) {
    this.ui.startProgress(chalk(msg), chalk('.'))
  }
};

module.exports = Logger
