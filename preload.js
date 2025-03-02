const { contextBridge, ipcRenderer } = require('electron');

// Analytics functionality
const analytics = {
    stats: {
        totalRead: 0,
        totalSaved: 0,
        totalReflections: 0,
        favoriteNarrators: {},
        favoriteBooks: {}
    },
    
    incrementRead() {
        this.stats.totalRead++;
        this.updateDisplay();
    },

    incrementSaved() {
        this.stats.totalSaved++;
        this.updateDisplay();
    },

    trackNarrator(narrator) {
        this.stats.favoriteNarrators[narrator] = (this.stats.favoriteNarrators[narrator] || 0) + 1;
    },

    trackBook(book) {
        this.stats.favoriteBooks[book] = (this.stats.favoriteBooks[book] || 0) + 1;
    },

    updateDisplay() {
        const statsSection = document.getElementById('statsSection');
        if (statsSection) {
            statsSection.innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${this.stats.totalRead}</div>
                    <div class="stat-label">Hadiths Read</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${this.stats.totalSaved}</div>
                    <div class="stat-label">Hadiths Saved</div>
                </div>
            `;
        }
    }
};

// Feedback functionality
function showFeedback(message, type = 'success') {
    const feedback = document.createElement('div');
    feedback.className = `feedback-message ${type}`;
    feedback.textContent = message;
    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.remove();
    }, 3000);
}

contextBridge.exposeInMainWorld('electronAPI', {
    saveHadith: (hadith) => ipcRenderer.send('save-hadith', hadith),
    getFavorites: () => ipcRenderer.invoke('get-favorites'),
    saveReflection: (hadithId, reflection) => ipcRenderer.send('save-reflection', hadithId, reflection),
    deleteFavorite: (hadithId) => ipcRenderer.invoke('delete-favorite', hadithId),
    analytics: analytics,
    showFeedback: showFeedback
}); 