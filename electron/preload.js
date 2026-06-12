const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  list: (collection) => ipcRenderer.invoke('db:list', collection),
  save: (collection, item) => ipcRenderer.invoke('db:save', collection, item),
  remove: (collection, id) => ipcRenderer.invoke('db:delete', collection, id),
  pickMedia: () => ipcRenderer.invoke('dialog:pickMedia'),
  createShowPackage: (payload) => ipcRenderer.invoke('show:createPackage', payload),
  exportCsv: (payload) => ipcRenderer.invoke('show:exportCsv', payload),
  openPath: (target) => ipcRenderer.invoke('shell:openPath', target),
  getDataInfo: () => ipcRenderer.invoke('db:info'),
  listFonts: () => ipcRenderer.invoke('fonts:list'),
});
