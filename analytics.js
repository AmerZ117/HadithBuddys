class HadithAnalytics {
    constructor() {
        this.stats = {
            totalRead: 0,
            totalSaved: 0,
            totalReflections: 0,
            favoriteNarrators: {},
            favoriteBooks: {}
        };
    }

    incrementRead() {
        this.stats.totalRead++;
        this.updateDisplay();
    }

    incrementSaved() {
        this.stats.totalSaved++;
        this.updateDisplay();
    }

    addReflection() {
        this.stats.totalReflections++;
        this.updateDisplay();
    }

    trackNarrator(narrator) {
        this.stats.favoriteNarrators[narrator] = (this.stats.favoriteNarrators[narrator] || 0) + 1;
    }

    trackBook(book) {
        this.stats.favoriteBooks[book] = (this.stats.favoriteBooks[book] || 0) + 1;
    }

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
                <div class="stat-card">
                    <div class="stat-number">${this.stats.totalReflections}</div>
                    <div class="stat-label">Reflections Written</div>
                </div>
            `;
        }
    }
}

const analytics = new HadithAnalytics();
export default analytics; 