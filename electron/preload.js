/* KINETIC-CORE · Electron preload.
 *
 * Exposes a minimal, typed API surface to the renderer. Never pass
 * `ipcRenderer` directly — we only forward whitelisted commands.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kineticBridge', {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  },
  quit: () => ipcRenderer.send('kinetic:quit'),
  toggleFullscreen: () => ipcRenderer.send('kinetic:toggle-fullscreen')
});
