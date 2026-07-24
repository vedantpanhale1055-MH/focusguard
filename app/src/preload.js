const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('focusguard', {
  startSession: (goal, mode) => ipcRenderer.invoke('session:start', { goal, mode }),
  endSession: () => ipcRenderer.invoke('session:end'),
  onClassification: (callback) => {
    ipcRenderer.on('classification:result', (event, data) => callback(data));
  },
  exitCheckQuestion: (payload) => ipcRenderer.invoke('session:exitCheckQuestion', payload),
  exitCheckGrade: (payload) => ipcRenderer.invoke('session:exitCheckGrade', payload),
  analyzeSession: (payload) => ipcRenderer.invoke('session:analyze', payload),
  getSessionHistory: (limit) => ipcRenderer.invoke('session:history', { limit }),
});