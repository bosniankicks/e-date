const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startReservation: (formData) => ipcRenderer.invoke('start-reservation', formData),
  generateDateActivities: () => ipcRenderer.invoke('generate-date-activities')
});
