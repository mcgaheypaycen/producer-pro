const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { Store } = require('./store');
const { createShowPackage, buildCloseoutCsv, sanitizeFilename } = require('./showExport');
const { getFonts } = require('font-list');
const { getMediaLengthLabel, isImageMedia } = require('./mediaDuration');

let cachedSystemFonts = null;

let mainWindow = null;
let splashWindow = null;
let store = null;

function resolveAsset(...parts) {
  return path.join(__dirname, '..', 'assets', ...parts);
}

function createSplashWindow() {
  const splashPath = resolveAsset('build', 'splash-1600x1000.png');
  const fallback = resolveAsset('build', 'splash-800x500.png');
  const imagePath = fs.existsSync(splashPath) ? splashPath : (fs.existsSync(fallback) ? fallback : null);
  if (!imagePath) return null;

  splashWindow = new BrowserWindow({
    width: 800,
    height: 500,
    frame: false,
    resizable: false,
    center: true,
    show: false,
    alwaysOnTop: true,
    backgroundColor: '#150F13',
    skipTaskbar: true,
  });

  const fileUrl = imagePath.replace(/\\/g, '/');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;height:100%;background:#150F13;display:flex;align-items:center;justify-content:center}
    img{max-width:100%;max-height:100%;object-fit:contain}
  </style></head><body><img src="file:///${fileUrl}" width="800" height="500" alt=""/></body></html>`;

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  splashWindow.once('ready-to-show', () => splashWindow?.show());
  return splashWindow;
}

function closeSplashWindow() {
  if (splashWindow) {
    splashWindow.close();
    splashWindow = null;
  }
}

function createWindow() {
  const iconPng = resolveAsset('build', 'icon-1024.png');
  const iconSvg = resolveAsset('brand', 'logo-icon-only.svg');
  const iconPath = fs.existsSync(iconPng) ? iconPng : (fs.existsSync(iconSvg) ? iconSvg : undefined);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 680,
    backgroundColor: '#0d0b14',
    autoHideMenuBar: true,
    show: false,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    closeSplashWindow();
    mainWindow.show();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

function registerIpc() {
  ipcMain.handle('db:list', (_e, collection) => store.list(collection));
  ipcMain.handle('db:save', (_e, collection, item) => store.save(collection, item));
  ipcMain.handle('db:delete', (_e, collection, id) => store.delete(collection, id));

  ipcMain.handle('dialog:pickMedia', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select media file',
      properties: ['openFile'],
      filters: [
        {
          name: 'Media (video, audio & images)',
          extensions: [
            'mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'mp3', 'wav', 'aiff', 'aac', 'm4a', 'flac', 'ogg', 'wma',
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tif', 'tiff', 'heic', 'heif', 'svg',
          ],
        },
        {
          name: 'Images',
          extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tif', 'tiff', 'heic', 'heif', 'svg'],
        },
        { name: 'All files', extensions: ['*'] },
      ],
    });
    if (result.canceled || !result.filePaths.length) return null;
    const filePath = result.filePaths[0];
    const image = isImageMedia(filePath);
    const length = image ? '' : await getMediaLengthLabel(filePath);
    return { path: filePath, name: path.basename(filePath), length, isImage: image };
  });

  // Builds the show package: prompts for destination, copies media files
  // named "[POSITION] [PERFORMER] [ACT NAME]", and writes the RTF run sheet.
  ipcMain.handle('show:createPackage', async (_e, payload) => {
    const { show, lineup, runSheet } = payload;
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Choose where to create the show folder',
      properties: ['openDirectory', 'createDirectory'],
      defaultPath: app.getPath('documents'),
    });
    if (result.canceled || !result.filePaths.length) return { canceled: true };
    try {
      const pkg = createShowPackage(result.filePaths[0], show, lineup, runSheet);
      return { canceled: false, ...pkg };
    } catch (err) {
      return { canceled: false, error: err.message };
    }
  });

  ipcMain.handle('show:exportCsv', async (_e, payload) => {
    const { show, closeout } = payload;
    const defaultName = sanitizeFilename(`${show.title || 'Show'} - Settlement`) + '.csv';
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export show settlement CSV',
      defaultPath: path.join(app.getPath('documents'), defaultName),
      filters: [{ name: 'CSV', extensions: ['csv'] }],
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    try {
      const performersById = {};
      for (const p of store.list('performers')) performersById[p.id] = p;
      fs.writeFileSync(result.filePath, buildCloseoutCsv(show, closeout, performersById), 'utf8');
      return { canceled: false, filePath: result.filePath };
    } catch (err) {
      return { canceled: false, error: err.message };
    }
  });

  ipcMain.handle('shell:openPath', (_e, target) => shell.openPath(target));

  ipcMain.handle('fonts:list', async () => {
    if (cachedSystemFonts) return cachedSystemFonts;
    try {
      const fonts = await getFonts();
      cachedSystemFonts = [...new Set(fonts)].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    } catch {
      cachedSystemFonts = ['Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana'];
    }
    return cachedSystemFonts;
  });

  ipcMain.handle('db:info', () => {
    const file = store.file;
    let lastSaved = null;
    try {
      if (fs.existsSync(file)) lastSaved = fs.statSync(file).mtime.toISOString();
    } catch (_) {}
    return { path: file, lastSaved };
  });
}

app.whenReady().then(() => {
  store = new Store(app.getPath('userData'));
  registerIpc();
  createSplashWindow();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createSplashWindow();
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
