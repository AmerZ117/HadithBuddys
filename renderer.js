let currentHadith = null;

const hadiths = [
    {
        text: "The best of you are those who are best to their families, and I am the best to my family.",
        source: "Sunan al-Tirmidhī",
        number: "3895",
        chapter: "The Book of Maintaining Good Relations with Relatives",
        narrator: "A'isha",
        status: "Sahih"
    },
    // Add more hadiths with complete information...
];

const hadithBooks = [
    "Sahih al-Bukhari",
    "Sahih Muslim",
    "Sunan Abu Dawood",
    "Jami at-Tirmidhi",
    "Sunan an-Nasa'i",
    "Sunan Ibn Majah",
    "Muwatta Malik",
    "Musnad Ahmad"
];

async function loadFavorites() {
    const favorites = await window.electronAPI.getFavorites();
    const favoritesList = document.getElementById('favoritesList');
    if (favoritesList) {
        favoritesList.innerHTML = favorites.map(hadith => `
            <div class="favorite-item">
                <h3>${hadith.source} #${hadith.number}</h3>
                <p class="hadith-text">${hadith.text}</p>
                <p class="hadith-info">Narrator: ${hadith.narrator} | Status: ${hadith.status}</p>
                <textarea 
                    class="reflection-input" 
                    placeholder="Add your reflection..."
                    onchange="saveReflection('${hadith.id}', this.value)"
                >${hadith.reflection || ''}</textarea>
                <button onclick="deleteFavorite('${hadith.id}')" class="delete-btn">Delete</button>
            </div>
        `).join('');
    }
}

async function fetchHadith() {
    const hadithDisplay = document.getElementById('hadithDisplay');
    hadithDisplay.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const randomIndex = Math.floor(Math.random() * hadiths.length);
        currentHadith = hadiths[randomIndex];
        
        window.electronAPI.analytics.incrementRead();
        window.electronAPI.analytics.trackNarrator(currentHadith.narrator);
        window.electronAPI.analytics.trackBook(currentHadith.source);
        
        hadithDisplay.innerHTML = `
            <div class="islamic-pattern-header"></div>
            <p class="hadith-number">Hadith #${currentHadith.number}</p>
            <p class="hadith-text">"${currentHadith.text}"</p>
            <p class="hadith-source">${currentHadith.source}</p>
            <p class="hadith-info">
                Narrator: ${currentHadith.narrator}<br>
                Chapter: ${currentHadith.chapter}<br>
                Status: ${currentHadith.status}
            </p>
        `;
        
        window.electronAPI.showFeedback('Hadith loaded successfully');
    } catch (error) {
        window.electronAPI.showFeedback('Error loading hadith', 'error');
        hadithDisplay.innerHTML = '<p class="error-message">Error loading hadith</p>';
    }
}

async function saveCurrentHadith() {
    if (!currentHadith) {
        window.electronAPI.showFeedback('Please fetch a hadith first', 'error');
        return;
    }

    try {
        await window.electronAPI.saveHadith(currentHadith);
        window.electronAPI.analytics.incrementSaved();
        window.electronAPI.showFeedback('Hadith saved successfully');
        loadFavorites();
    } catch (error) {
        window.electronAPI.showFeedback('Error saving hadith', 'error');
    }
}

async function saveReflection(hadithId, text) {
    await window.electronAPI.saveReflection(hadithId, text);
}

async function deleteFavorite(hadithId) {
    try {
        const result = await window.electronAPI.deleteFavorite(hadithId);
        if (result.success) {
            window.electronAPI.showFeedback('Hadith deleted successfully');
            await loadFavorites(); // Refresh the list
        } else {
            window.electronAPI.showFeedback('Error deleting hadith', 'error');
        }
    } catch (error) {
        window.electronAPI.showFeedback('Error deleting hadith', 'error');
        console.error('Error deleting favorite:', error);
    }
}

function searchHadith() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    
    // Show the search results section
    searchResults.classList.add('active');
    
    // Filter hadiths based on search term
    const filteredHadiths = hadiths.filter(hadith => {
        const sourceMatch = hadith.source.toLowerCase().includes(searchTerm);
        const textMatch = hadith.text.toLowerCase().includes(searchTerm);
        const bookMatch = hadithBooks.some(book => 
            book.toLowerCase().includes(searchTerm) && 
            hadith.source.toLowerCase().includes(book.toLowerCase())
        );
        return sourceMatch || textMatch || bookMatch;
    });

    const resultsContainer = searchResults.querySelector('.results-container');
    
    if (filteredHadiths.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No hadiths found matching your search.</p>';
    } else {
        resultsContainer.innerHTML = filteredHadiths.map(hadith => `
            <div class="result-item">
                <div class="result-header">
                    <h3>${hadith.source} #${hadith.number}</h3>
                    <span class="hadith-status">${hadith.status}</span>
                </div>
                <p class="result-text">${hadith.text}</p>
                <p class="result-info">
                    <span class="narrator">Narrator: ${hadith.narrator}</span>
                    <span class="chapter">Chapter: ${hadith.chapter}</span>
                </p>
                <div class="result-actions">
                    <button class="action-btn" onclick="saveSearchResult(this)">Save</button>
                    <button class="action-btn" onclick="copyToClipboard(this)">Copy</button>
                </div>
            </div>
        `).join('');
    }
}

// Add this function to show book suggestions
function showBookSuggestions() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();
    
    // Only show suggestions if the search term is at least 2 characters
    if (searchTerm.length < 2) return;
    
    const matchingBooks = hadithBooks.filter(book => 
        book.toLowerCase().includes(searchTerm)
    );
    
    const suggestionsDiv = document.getElementById('bookSuggestions');
    if (!suggestionsDiv) {
        const div = document.createElement('div');
        div.id = 'bookSuggestions';
        div.className = 'book-suggestions';
        searchInput.parentNode.appendChild(div);
    }
    
    const suggestions = document.getElementById('bookSuggestions');
    if (matchingBooks.length > 0) {
        suggestions.innerHTML = matchingBooks.map(book => `
            <div class="suggestion-item" onclick="selectBook('${book}')">
                ${book}
            </div>
        `).join('');
        suggestions.style.display = 'block';
    } else {
        suggestions.style.display = 'none';
    }
}

function selectBook(book) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = book;
    document.getElementById('bookSuggestions').style.display = 'none';
    searchHadith();
}

// Add event listeners when the document loads
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', showBookSuggestions);
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        const suggestions = document.getElementById('bookSuggestions');
        if (suggestions && !suggestions.contains(e.target) && e.target !== searchInput) {
            suggestions.style.display = 'none';
        }
    });
    
    loadFavorites();
});

// Make functions available to the window object
window.fetchHadith = fetchHadith;
window.saveCurrentHadith = saveCurrentHadith;
window.saveReflection = saveReflection;
window.deleteFavorite = deleteFavorite;
window.searchHadith = searchHadith;
