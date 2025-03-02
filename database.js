const fs = require('fs');
const path = require('path');

function initializeDB() {
    const dbPath = path.join(__dirname, 'db.json');
    if (!fs.existsSync(dbPath)) {
        const initialData = {
            favorites: [],
            reflections: {}
        };
        fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    }
    return dbPath;
}

function readDB() {
    const dbPath = initializeDB();
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDB(data) {
    const dbPath = initializeDB();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function saveHadith(hadith) {
    try {
        const data = readDB();
        data.favorites.push({
            ...hadith,
            savedAt: new Date().toISOString(),
            id: Date.now().toString()
        });
        writeDB(data);
        return true;
    } catch (err) {
        console.error('Error saving hadith:', err);
        return false;
    }
}

function getFavorites() {
    try {
        const data = readDB();
        return data.favorites;
    } catch (err) {
        console.error('Error getting favorites:', err);
        return [];
    }
}

function saveReflection(hadithId, reflection) {
    try {
        const data = readDB();
        data.reflections[hadithId] = {
            text: reflection,
            updatedAt: new Date().toISOString()
        };
        writeDB(data);
        return true;
    } catch (err) {
        console.error('Error saving reflection:', err);
        return false;
    }
}

function deleteFavorite(hadithId) {
    try {
        const dbPath = path.join(__dirname, 'db.json');
        if (!fs.existsSync(dbPath)) {
            throw new Error('Database file not found');
        }

        let data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        
        // Check if the hadith exists before trying to delete
        const hadithExists = data.favorites.some(h => h.id === hadithId);
        if (!hadithExists) {
            throw new Error('Hadith not found');
        }

        data.favorites = data.favorites.filter(h => h.id !== hadithId);
        if (data.reflections && data.reflections[hadithId]) {
            delete data.reflections[hadithId];
        }

        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error('Error deleting hadith:', err);
        throw err; // Re-throw the error to be handled by the caller
    }
}

module.exports = {
    saveHadith,
    getFavorites,
    saveReflection,
    deleteFavorite
}; 