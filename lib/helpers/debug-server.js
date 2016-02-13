/**
 * This code is mostly taken from Joost de Vries's amazing ember-cli-remote-inspector
 * https://github.com/joostdevries/ember-cli-remote-inspector
 */
var path           = require('path');
var chalk          = require('chalk');
var fs             = require('fs');
var express        = require('express');
var remoteDebugger = express();

var inspectorPath      = require('./find-ember-inspector')();
var remoteDebugServer  = require('http').Server(remoteDebugger);
var remoteDebugSocket  = require('socket.io')(remoteDebugServer);
var inspectorSocket    = null;

// Server static files for the inspector
remoteDebugger.use('/', express.static(inspectorPath, {
    index: false
}));

// Serve the inspector itself
var inspectorHtml = fs.readFileSync(path.join(inspectorPath, 'index.html')).toString();
remoteDebugger.get('/', function (req, res) {
    res.end(inspectorHtml);
});

module.exports = {
    /*
     Injects the script used to connect socket.io to the inspector into the inspector HTML
     */
    setRemoteDebugSocketScript: function (scriptHtml) {
        inspectorHtml = inspectorHtml.replace('{{ remote-port }}', scriptHtml);
    },

    /*
     Start the server for the inspector + socket.io
     */
    start: function (port, host, ui) {
        try {
            remoteDebugServer.listen(port, host);
        } catch (e) {
            ui.writeLine(chalk.bold.red('Ember Inspector Server could not start. Is it already running?'));
            console.log(e);
        }

        process.on('SIGTERM', function () {
            remoteDebugServer.close();
        });

        remoteDebugSocket.on('connect', function (socket) {
            socket.on('emberInspectorMessage', function (msg) {
                // If this message comes from the inspector, emit to all clients
                // and set inspectorSocket
                if (msg.from === 'devtools') {
                    inspectorSocket = socket;
                    remoteDebugSocket.emit('emberInspectorMessage', msg);
                }
                // If the messge comes from a client, send only to inspector
                else if (inspectorSocket) {
                    inspectorSocket.emit('emberInspectorMessage', msg);
                }
            });
        });
    }
};
