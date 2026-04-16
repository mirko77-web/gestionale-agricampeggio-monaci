const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, dialog } = require('electron');
const { fork } = require('child_process');

// Leggi il .env manualmente
const envPath = path.join(__dirname, '..', '.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach(line => {
      const [key, ...rest] = line.split('=');
      if (key && rest.length) {
        envVars[key.trim()] = rest.join('=').trim();
      }
    });
}
console.log('[Electron] JWT_SECRET caricato:', !!envVars.JWT_SECRET);

let mainWindow;
let backendProcess;

function startBackend() {
  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'server.js')
    : path.join(__dirname, '..', 'backend', 'server.js');

  console.log('[Electron] Backend path:', backendPath);
backendProcess = fork(backendPath, [], {
  env: {
    ...process.env,
    ...envVars,  // ← variabili lette direttamente dal file
    PORT: '5000',
    DB_PATH: path.join(app.getPath('userData'), 'campeggio.db'),
  },
  stdio: 'pipe',
});

  backendProcess.stdout?.on('data', (data) => {
    console.log('[Backend]', data.toString());
  });

  backendProcess.stderr?.on('data', (data) => {
    console.error('[Backend Error]', data.toString());
  });

  backendProcess.on('error', (err) => {
    dialog.showErrorBox('Errore Backend', `Impossibile avviare il server: ${err.message}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Gestionale Agricampeggio Monaci',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  // Percorso corretto: resources/frontend/build/index.html
  const startUrl = app.isPackaged
    ? `file://${path.join(process.resourcesPath, 'frontend', 'build', 'index.html')}`
    : 'http://localhost:3000';

  console.log('[Electron] Loading URL:', startUrl);

  setTimeout(() => {
    mainWindow.loadURL(startUrl);
    mainWindow.show();
  }, 2500);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});