/* KINETIC-CORE · Electron main process.
 *
 * Responsibilities:
 *   1. Spawn the Next.js standalone server on a free loopback port.
 *   2. Create a fullscreen, menu-less BrowserWindow that loads the server.
 *   3. Tear everything down cleanly on quit.
 */

const { app, BrowserWindow, Menu, shell, session, ipcMain } = require('electron');
const path = require('node:path');
const http = require('node:http');
const net = require('node:net');
const { fork } = require('node:child_process');

const isDev = !app.isPackaged;
const DEV_URL = process.env.ELECTRON_START_URL || 'http://localhost:3000';

let serverProcess = null;
let mainWindow = null;
let serverUrl = null;

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function waitForServer(url, timeoutMs = 20_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        // Any response — even a 404 or a redirect — means the server is up.
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timed out waiting for Next.js server at ${url}`));
        } else {
          setTimeout(attempt, 250);
        }
      });
    };
    attempt();
  });
}

async function startNextServer() {
  if (isDev) {
    // Developer flow: assume the user is running `npm run dev` on port 3000.
    serverUrl = DEV_URL;
    return;
  }

  const port = await getFreePort();
  // In a packaged app the standalone bundle lives under `resources/app/.next`
  // thanks to the electron-builder config.
  const resourcesRoot = process.resourcesPath;
  const serverEntry = path.join(resourcesRoot, 'app', '.next', 'standalone', 'server.js');

  serverProcess = fork(serverEntry, {
    env: {
      ...process.env,
      PORT: String(port),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1'
    },
    cwd: path.join(resourcesRoot, 'app', '.next', 'standalone'),
    stdio: ['ignore', 'inherit', 'inherit', 'ipc']
  });

  serverProcess.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[kinetic-core] Next.js server exited with code ${code}`);
      app.quit();
    }
  });

  serverUrl = `http://127.0.0.1:${port}`;
  await waitForServer(serverUrl);
}

function hardenSession() {
  // Strict CSP for the packaged app. The game stays fully offline, so we
  // never need to reach the wider internet from the renderer.
  session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
    cb({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' http://127.0.0.1:*;" +
            " script-src 'self' 'unsafe-inline' 'unsafe-eval' http://127.0.0.1:*;" +
            " style-src 'self' 'unsafe-inline' http://127.0.0.1:*;" +
            " img-src 'self' data: blob: http://127.0.0.1:*;" +
            " connect-src 'self' http://127.0.0.1:*;" +
            " worker-src 'self' blob:;"
        ]
      }
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 960,
    minHeight: 540,
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: '#05070C',
    title: 'KINETIC·CORE',
    show: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webgl: true,
      // Non-essential features stripped to harden the surface.
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open external links in the default browser instead of hijacking the window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(serverUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  hardenSession();
  try {
    await startNextServer();
  } catch (err) {
    console.error('[kinetic-core] Failed to start Next.js server:', err);
    app.quit();
    return;
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
    serverProcess = null;
  }
});

// Prevent multiple instances.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Block all new navigation away from our loopback server.
app.on('web-contents-created', (_e, contents) => {
  contents.on('will-navigate', (event, navUrl) => {
    if (!serverUrl || !navUrl.startsWith(serverUrl)) event.preventDefault();
  });
});

// Whitelisted IPC handlers exposed via preload.
ipcMain.on('kinetic:quit', () => app.quit());
ipcMain.on('kinetic:toggle-fullscreen', () => {
  if (!mainWindow) return;
  mainWindow.setFullScreen(!mainWindow.isFullScreen());
});
