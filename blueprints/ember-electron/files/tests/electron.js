/* jshint undef: false */

const BrowserWindow = require('electron').BrowserWindow;
const app = require('electron').app;

let mainWindow = null;

app.on('window-all-closed', function onWindowAllClosed() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('ready', function onReady() {
    let testUrl = process.argv[2];

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundThrottling: false
    });

    delete mainWindow.module;

    mainWindow.loadURL(testUrl);

    mainWindow.on('closed', function onClosed() {
        mainWindow = null;
    });
});

/* jshint undef: true */
