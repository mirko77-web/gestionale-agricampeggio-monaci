require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { fork } = require('child_process');


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
      PORT: '5000',
      DB_PATH: path.join(app.getPath('userData'), 'campeggio.db'),
      JWT_SECRET: process.env.JWT_SECRET,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS,
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM,
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