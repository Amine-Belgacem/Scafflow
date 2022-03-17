
const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    'minWidth':900,
    'width':900,
    'height':800,
    'minHeight': 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  mainWindow.loadFile('app.html')
  // mainWindow.setMenuBarVisibility(false)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
