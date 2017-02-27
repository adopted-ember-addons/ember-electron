const { app, BrowserWindow } = require('electron');

let mainWindow = null;

app.on('window-all-closed', function onWindowAllClosed() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function onReady() {
  let [, , testUrl] = process.argv;

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundThrottling: false,
  });

  delete mainWindow.module;

  mainWindow.loadURL(testUrl);

  mainWindow.on('closed', function onClosed() {
    mainWindow = null;
  });
});
