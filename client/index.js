var url = require('url');
var path = require('path');
var electron = require('electron');
var mainWindow;

const template = [
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'selectall'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload'},
      {role: 'toggledevtools'},
      {type: 'separator'},
      {role: 'resetzoom'},
      {role: 'zoomin'},
      {role: 'zoomout'},
      {type: 'separator'},
      {role: 'togglefullscreen'}
    ]
  }
];


const menu = electron.Menu.buildFromTemplate(template);
electron.Menu.setApplicationMenu(menu);

var createWindow = function () {
  mainWindow = new electron.BrowserWindow({
    width: 1000, 
    height: 670, 
    webPreferences: { 
      webSecurity: false
    }
  });
  mainWindow.loadFile( path.join(__dirname, 'debug.html') );
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
};

var serveStatic = function () {
  electron.protocol.interceptFileProtocol('file', function (request, callback) {
    console.log(request.url.substr(8) )
    callback({ path:  request.url.substr(8) });   /* 'file:///' */
  }, function (err) {
    if (err) console.error('Failed to register protocol');
  });
};

electron.app.on('ready', function () {
  createWindow();
  serveStatic();
});

electron.app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    electron.app.quit();
  }
})

electron.app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
