// Spotify SVG Icon
const spotifyIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`;

// Play/Pause Icons
const playIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
const pauseIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

// Audio player instance
let currentAudio = null;
let currentPlayBtn = null;

// Play preview function
function playPreview(previewUrl, btn) {
    // If clicking the same button, toggle play/pause
    if (currentAudio && currentPlayBtn === btn) {
        if (currentAudio.paused) {
            currentAudio.play();
            btn.innerHTML = pauseIcon;
            btn.classList.add('playing');
        } else {
            currentAudio.pause();
            btn.innerHTML = playIcon;
            btn.classList.remove('playing');
        }
        return;
    }

    // Stop any currently playing audio
    if (currentAudio) {
        currentAudio.pause();
        if (currentPlayBtn) {
            currentPlayBtn.innerHTML = playIcon;
            currentPlayBtn.classList.remove('playing');
        }
    }

    // Create and play new audio
    currentAudio = new Audio(previewUrl);
    currentPlayBtn = btn;
    
    currentAudio.play();
    btn.innerHTML = pauseIcon;
    btn.classList.add('playing');

    // Reset button when audio ends
    currentAudio.addEventListener('ended', () => {
        btn.innerHTML = playIcon;
        btn.classList.remove('playing');
        currentAudio = null;
        currentPlayBtn = null;
    });
}

// Create song card HTML
function createSongCard(song, index) {
    const previewButton = song.previewUrl 
        ? `<button class="preview-btn" onclick="playPreview('${song.previewUrl}', this)" title="Play 30s preview">
               ${playIcon}
           </button>`
        : '';

    return `
        <div class="song-card">
            <div class="cover-container">
                <img src="${song.cover}" alt="${song.title}" class="song-cover" onerror="this.src='https://via.placeholder.com/300x300/1DB954/ffffff?text=🎵'">
                ${previewButton}
            </div>
            <div class="song-info">
                <h3 class="song-title" title="${song.title}">${song.title}</h3>
                <p class="song-artist">${song.artist}</p>
                <p class="song-album">${song.album}</p>
            </div>
            <a href="${song.spotifyUrl}" target="_blank" rel="noopener noreferrer" class="spotify-btn">
                ${spotifyIcon}
                Open in Spotify
            </a>
        </div>
    `;
}

// Render songs to the page
function renderSongs(songs) {
    const container = document.getElementById('songs-container');
    container.innerHTML = songs.map((song, index) => createSongCard(song, index)).join('');
    
    // Stop any playing audio when new songs are loaded
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
        currentPlayBtn = null;
    }
}

// Show loading state
function showLoading() {
    const container = document.getElementById('songs-container');
    container.innerHTML = '<div class="loading"></div>';
}

// Show error state
function showError(message) {
    const container = document.getElementById('songs-container');
    container.innerHTML = `
        <div class="error-message">
            <p>😕 ${message}</p>
            <button class="retry-btn" onclick="init()">Try Again</button>
        </div>
    `;
}

// Format current date
function formatDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
}

// Initialize the page
async function init() {
    // Set current date
    document.getElementById('current-date').textContent = formatDate();

    // Show loading while fetching
    showLoading();

    // Fetch today's songs from the API
    const songs = await fetchTodaysSongs(3);
    if (songs) {
        renderSongs(songs);
    } else {
        showError("Couldn't load songs. Check your internet connection.");
    }
}

// Refresh button handler
document.getElementById('refresh-btn').addEventListener('click', async function() {
    showLoading();

    const songs = await fetchSongs(3);
    if (songs) {
        renderSongs(songs);
    } else {
        showError("Couldn't load new songs. Please try again.");
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
