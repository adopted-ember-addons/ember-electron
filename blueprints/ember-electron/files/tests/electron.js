const { app, BrowserWindow } = require('electron');

let mainWindow = null;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  let [, , testUrl] = process.argv;

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundThrottling: false,
  });

  mainWindow.loadURL(testUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
