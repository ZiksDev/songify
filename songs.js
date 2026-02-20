// Search terms to get a diverse mix of songs
const searchTerms = [
    "pop hits", "rock classics", "hip hop", "r&b soul", "indie",
    "electronic dance", "latin reggaeton", "country music", "jazz",
    "alternative rock", "k-pop", "afrobeats", "funk disco",
    "punk rock", "trap", "lo-fi", "blues guitar", "metal",
    "reggae", "folk acoustic", "house music", "drill rap",
    "soul motown", "grunge", "synthwave", "bossa nova",
    "new wave", "psychedelic", "gospel", "ambient chill"
];

// Fetch songs from the iTunes Search API
async function fetchSongs(count = 5) {
    // Pick random search terms to get variety
    const selectedTerms = [];
    const termsCopy = [...searchTerms];
    for (let i = 0; i < Math.min(3, termsCopy.length); i++) {
        const idx = Math.floor(Math.random() * termsCopy.length);
        selectedTerms.push(termsCopy.splice(idx, 1)[0]);
    }

    try {
        const fetches = selectedTerms.map(term =>
            fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=25`)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                })
        );

        const results = await Promise.allSettled(fetches);
        let allSongs = [];

        for (const result of results) {
            if (result.status === "fulfilled" && result.value.results) {
                allSongs.push(...result.value.results);
            }
        }

        if (allSongs.length === 0) {
            throw new Error("No songs found");
        }

        // Remove duplicates by trackId
        const seen = new Set();
        allSongs = allSongs.filter(song => {
            if (seen.has(song.trackId)) return false;
            seen.add(song.trackId);
            return true;
        });

        // Shuffle and pick the requested count
        allSongs.sort(() => Math.random() - 0.5);
        const picked = allSongs.slice(0, count);

        return picked.map(song => ({
            title: song.trackName,
            artist: song.artistName,
            album: song.collectionName || "Single",
            cover: song.artworkUrl100.replace("100x100", "600x600"),
            previewUrl: song.previewUrl || null,
            spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(song.trackName + " " + song.artistName)}`
        }));

    } catch (error) {
        console.error("Error fetching songs:", error);
        return null;
    }
}

// Fetch songs seeded by today's date (for consistent daily picks)
async function fetchTodaysSongs(count = 5) {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const idx1 = seed % searchTerms.length;
    const idx2 = (seed * 3 + 7) % searchTerms.length;
    const idx3 = (seed * 7 + 13) % searchTerms.length;
    const dailyTerms = [...new Set([searchTerms[idx1], searchTerms[idx2], searchTerms[idx3]])];

    try {
        const fetches = dailyTerms.map(term =>
            fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=30`)
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                })
        );

        const results = await Promise.allSettled(fetches);
        let allSongs = [];

        for (const result of results) {
            if (result.status === "fulfilled" && result.value.results) {
                allSongs.push(...result.value.results);
            }
        }

        if (allSongs.length === 0) {
            throw new Error("No songs found");
        }

        // Remove duplicates
        const seen = new Set();
        allSongs = allSongs.filter(song => {
            if (seen.has(song.trackId)) return false;
            seen.add(song.trackId);
            return true;
        });

        // Seeded shuffle for consistent daily results
        function seededRandom(s) {
            const x = Math.sin(s) * 10000;
            return x - Math.floor(x);
        }

        let s = seed;
        for (let i = allSongs.length - 1; i > 0; i--) {
            s++;
            const j = Math.floor(seededRandom(s) * (i + 1));
            [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
        }

        const picked = allSongs.slice(0, count);

        return picked.map(song => ({
            title: song.trackName,
            artist: song.artistName,
            album: song.collectionName || "Single",
            cover: song.artworkUrl100.replace("100x100", "600x600"),
            previewUrl: song.previewUrl || null,
            spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(song.trackName + " " + song.artistName)}`
        }));

    } catch (error) {
        console.error("Error fetching today's songs:", error);
        return null;
    }
}

// REMOVED: old hardcoded songDatabase array replaced by dynamic API fetching