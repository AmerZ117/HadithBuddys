const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { saveHadith, getFavorites, saveReflection, deleteFavorite } = require('./database');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    ipcMain.on('save-hadith', (event, hadith) => {
        saveHadith(hadith);
    });

    ipcMain.handle('get-favorites', () => {
        return getFavorites();
    });

    ipcMain.handle('delete-favorite', async (event, hadithId) => {
        try {
            await deleteFavorite(hadithId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting favorite:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.on('save-reflection', (event, hadithId, reflection) => {
        saveReflection(hadithId, reflection);
    });

    ipcMain.on('navigate', (event, url) => {
        mainWindow.loadFile(path.join(__dirname, url));
    });
});

// Handle window-all-closed event
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle activate event
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
