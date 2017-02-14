// todo: extract helper file into the class
const debugServer = require('../helpers/debug-server')

class InspectorServer {
  constructor ({ port, host }) {
    this.port = port
    this.host = host
  }

  getUrl () {
    return `http://${this.host}:${this.port}`
  }

  run () {
    let host = this.host === 'localhost' ? '0.0.0.0' : this.host

    debugServer.setRemoteDebugSocketScript(this.inspectorScriptInjections())
    debugServer.start(this.port, host)
  }

  inspectorScriptInjections ({ includeDebugJs } = { includeDebugJs: false }) {
    let url = this.getUrl()
    let injection = `<script src="${url}/socket.io/socket.io.js" type="text/javascript"></script>
      <script type="text/javascript">
          window.EMBER_INSPECTOR_CONFIG = window.EMBER_INSPECTOR_CONFIG || {}
          window.EMBER_INSPECTOR_CONFIG.remoteDebugSocket = io('${url}')
      </script>`

    if (includeDebugJs) {
      injection = injection + `<script src='${url}/ember_debug.js'></script>`
    }

    return injection
  }
}

module.exports = InspectorServer
