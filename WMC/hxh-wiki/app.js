// ============================================================
// 1. CONSTANTS & STATE
// ============================================================
const BASE_URL = 'https://api.jikan.moe/v4';
const ANIME_ID = 11061; // Hunter x Hunter (2011)

// Arc definitions: episode ranges + character names for filtering
const ARCS = [
    {
        name: 'Hunter Exam',
        episodeStart: 1,
        episodeEnd: 21,
        characters: [
            'Gon Freecss', 'Killua Zoldyck', 'Kurapika', 'Leorio Paradinight',
            'Hisoka Morow', 'Illumi Zoldyck', 'Tonpa', 'Hanzo', 'Satotz',
            'Menchi', 'Buhara', 'Isaac Netero', 'Beans', 'Pokkle', 'Ponzu',
            'Geretta', 'Bodoro', 'Gittarackur', 'Cherry', 'Sedokan', 'Todo',
        ],
    },
    {
        name: 'Zoldyck Family',
        episodeStart: 22,
        episodeEnd: 26,
        characters: [
            'Gon Freecss', 'Killua Zoldyck', 'Kurapika', 'Leorio Paradinight',
            'Zeno Zoldyck', 'Silva Zoldyck', 'Kikyo Zoldyck', 'Milluki Zoldyck',
            'Alluka Zoldyck', 'Gotoh', 'Canary', 'Zebro', 'Seaquant', 'Nanika',
        ],
    },
    {
        name: 'Heavens Arena',
        episodeStart: 27,
        episodeEnd: 36,
        characters: [
            'Gon Freecss', 'Killua Zoldyck', 'Hisoka Morow', 'Wing', 'Zushi',
            'Kastro', 'Gido', 'Riehlvelt', 'Sadaso',
        ],
    },
    {
        name: 'Yorknew City',
        episodeStart: 37,
        episodeEnd: 58,
        characters: [
            'Gon Freecss', 'Killua Zoldyck', 'Kurapika', 'Leorio Paradinight',
            'Hisoka Morow', 'Chrollo Lucilfer', 'Neon Nostrade', 'Light Nostrade',
            'Silva Zoldyck', 'Zeno Zoldyck', 'Illumi Zoldyck',
            'Feitan Portor', 'Franklin Bordeau', 'Machi Komacine', 'Nobunaga Hazama',
            'Phinks Magcub', 'Bonolenov Ndongo', 'Shizuku Murasaki', 'Pakunoda',
            'Kortopi', 'Shalnark', 'Uvogin', 'Melody', 'Basho', 'Squala',
        ],
    },
    {
        name: 'Greed Island',
        episodeStart: 59,
        episodeEnd: 75,
        characters: [
            'Gon Freecss', 'Killua Zoldyck', 'Biscuit Krueger', 'Goreinu',
            'Tsezguerra', 'Razor', 'Genthru', 'Sub', 'Bara', 'Hisoka Morow',
        ],
    },
    {
        name: 'Chimera Ant',
        episodeStart: 76,
        episodeEnd: 136,
        characters: [
            'Gon Freecss', 'Killua Zoldyck', 'Knov', 'Morel Mackernasey',
            'Isaac Netero', 'Meruem', 'Neferpitou', 'Shaiapouf', 'Menthuthuyoupi',
            'Komugi', 'Ikalgo', 'Palm Siberia', 'Knuckle Bine', 'Shoot McMahon',
            'Colt', 'Cheetu', 'Zazan', 'Welfin', 'Meleoron', 'Kite',
            'Peggy', 'Leol', 'Bloster', 'Brovada', 'Bizeff',
        ],
    },
    {
        name: 'Election Arc',
        episodeStart: 137,
        episodeEnd: 148,
        characters: [
            'Gon Freecss', 'Killua Zoldyck', 'Alluka Zoldyck', 'Nanika',
            'Leorio Paradinight', 'Kurapika', 'Pariston Hill', 'Cheadle Yorkshire',
            'Ging Freecss', 'Illumi Zoldyck', 'Hisoka Morow', 'Beans',
            'Mizaistom Nana', 'Cluck', 'Saccho Kobayakawa', 'Teradein Neutral',
        ],
    },
];

const state = {
    characters: [],     // normalised { mal_id, name, imageUrl }
    episodes: [],       // all loaded episodes (accumulated across pages)
    favorites: [],      // { mal_id, name, imageUrl }
    episodePage: 1,
    hasMoreEpisodes: true,
};

// ============================================================
// 2. API FUNCTIONS
// ============================================================
async function fetchCharacters() {
    const res = await fetch(`${BASE_URL}/anime/${ANIME_ID}/characters`);
    const json = await res.json();
    return json.data; // array of { character, role, voice_actors }
}

async function fetchCharacterDetails(id) {
    const res = await fetch(`${BASE_URL}/characters/${id}`);
    const json = await res.json();
    return json.data;
}

async function fetchEpisodes(page) {
    const res = await fetch(`${BASE_URL}/anime/${ANIME_ID}/episodes?page=${page}`);
    const json = await res.json();
    return json; // { data: [...], pagination: { has_next_page } }
}

async function fetchSearchCharacters(query) {
    const res = await fetch(`${BASE_URL}/characters?q=${encodeURIComponent(query)}&limit=24`);
    const json = await res.json();
    return json.data;
}

// ============================================================
// 3. DOM REFERENCES
// ============================================================
const pages = {
    characters: document.getElementById('page-characters'),
    episodes:   document.getElementById('page-episodes'),
    search:     document.getElementById('page-search'),
    favorites:  document.getElementById('page-favorites'),
};

const navBtns        = document.querySelectorAll('.nav-btn');
const charactersGrid = document.getElementById('characters-grid');
const charArcSelect  = document.getElementById('char-arc-select');
const episodesList   = document.getElementById('episodes-list');
const epArcSelect    = document.getElementById('ep-arc-select');
const loadMoreBtn    = document.getElementById('load-more-btn');
const searchInput    = document.getElementById('search-input');
const searchType     = document.getElementById('search-type');
const searchBtn      = document.getElementById('search-btn');
const searchResults  = document.getElementById('search-results');
const favoritesGrid  = document.getElementById('favorites-grid');
const modal          = document.getElementById('modal');
const modalClose     = document.getElementById('modal-close');
const modalBody      = document.getElementById('modal-body');

// ============================================================
// 4. ARC FILTER HELPERS
// ============================================================
function getCharactersForArc(arcName) {
    if (arcName === 'all') return state.characters;
    const arc = ARCS.find(a => a.name === arcName);
    if (!arc) return state.characters;

    // Match by checking if any arc character name is a substring of the API name or vice versa
    return state.characters.filter(char => {
        const nameLower = char.name.toLowerCase();
        return arc.characters.some(arcName =>
            nameLower.includes(arcName.toLowerCase()) ||
            arcName.toLowerCase().includes(nameLower)
        );
    });
}

function getEpisodesForArc(arcName) {
    if (arcName === 'all') return state.episodes;
    const arc = ARCS.find(a => a.name === arcName);
    if (!arc) return state.episodes;
    return state.episodes.filter(ep => ep.mal_id >= arc.episodeStart && ep.mal_id <= arc.episodeEnd);
}

// ============================================================
// 5. DOM CREATION HELPERS
// ============================================================
function createCharacterCard({ mal_id, name, imageUrl }) {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src     = imageUrl || 'https://via.placeholder.com/150x225?text=No+Image';
    img.alt     = name;
    img.loading = 'lazy';

    const nameDiv = document.createElement('div');
    nameDiv.className   = 'card-name';
    nameDiv.textContent = name;

    const favBtn = document.createElement('button');
    favBtn.className = 'fav-btn' + (isFavorite(mal_id) ? ' saved' : '');
    favBtn.textContent = '♥';
    favBtn.title       = 'Toggle favorite';
    favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(mal_id, name, imageUrl);
        favBtn.classList.toggle('saved', isFavorite(mal_id));
    });

    card.appendChild(img);
    card.appendChild(nameDiv);
    card.appendChild(favBtn);
    card.addEventListener('click', () => openCharacterModal(mal_id, name, imageUrl));

    return card;
}

function createEpisodeItem(ep) {
    const div = document.createElement('div');
    div.className = 'episode-item';

    const num = document.createElement('span');
    num.className   = 'episode-num';
    num.textContent = `#${ep.mal_id}`;

    const title = document.createElement('span');
    title.className   = 'episode-title';
    title.textContent = ep.title || 'Unknown Title';

    const score = document.createElement('span');
    score.className   = 'episode-score';
    score.textContent = ep.score ? `${ep.score}` : '';

    div.appendChild(num);
    div.appendChild(title);
    div.appendChild(score);
    div.addEventListener('click', () => openEpisodeModal(ep));

    return div;
}

// ============================================================
// 6. RENDER FUNCTIONS
// ============================================================
function renderCharacters() {
    const filtered = getCharactersForArc(charArcSelect.value);
    charactersGrid.innerHTML = '';
    if (filtered.length === 0) {
        charactersGrid.innerHTML = '<p class="empty">No characters found for this arc.</p>';
        return;
    }
    for (const c of filtered) {
        charactersGrid.appendChild(createCharacterCard(c));
    }
}

function renderEpisodes() {
    const filtered = getEpisodesForArc(epArcSelect.value);
    episodesList.innerHTML = '';
    if (filtered.length === 0) {
        episodesList.innerHTML = '<p class="empty">No episodes loaded for this arc yet — click Load More.</p>';
        return;
    }
    for (const ep of filtered) {
        episodesList.appendChild(createEpisodeItem(ep));
    }
}

function renderFavorites() {
    favoritesGrid.innerHTML = '';
    if (state.favorites.length === 0) {
        favoritesGrid.innerHTML = '<p class="empty">No favorites yet. Click the heart on a character card to save one.</p>';
        return;
    }
    for (const fav of state.favorites) {
        favoritesGrid.appendChild(createCharacterCard(fav));
    }
}

// ============================================================
// 7. LOAD DATA FROM API
// ============================================================
async function loadCharacters() {
    charactersGrid.innerHTML = '<p class="loading">Loading characters...</p>';
    try {
        const entries = await fetchCharacters();
        state.characters = entries.map(e => ({
            mal_id:   e.character.mal_id,
            name:     e.character.name,
            imageUrl: e.character.images?.jpg?.image_url ?? '',
        }));
        renderCharacters();
    } catch {
        charactersGrid.innerHTML = '<p class="error">Failed to load characters.</p>';
    }
}

async function loadEpisodes() {
    episodesList.innerHTML = '<p class="loading">Loading episodes...</p>';
    try {
        const json = await fetchEpisodes(1);
        state.episodes        = json.data;
        state.episodePage     = 1;
        state.hasMoreEpisodes = json.pagination?.has_next_page ?? false;
        renderEpisodes();
        loadMoreBtn.style.display = state.hasMoreEpisodes ? 'block' : 'none';
    } catch {
        episodesList.innerHTML = '<p class="error">Failed to load episodes.</p>';
    }
}

async function loadMoreEpisodes() {
    loadMoreBtn.textContent = 'Loading...';
    loadMoreBtn.disabled    = true;
    try {
        state.episodePage++;
        const json = await fetchEpisodes(state.episodePage);
        state.episodes        = [...state.episodes, ...json.data];
        state.hasMoreEpisodes = json.pagination?.has_next_page ?? false;
        renderEpisodes(); // full re-render so arc filter is applied
        loadMoreBtn.style.display = state.hasMoreEpisodes ? 'block' : 'none';
    } catch {
        state.episodePage--;
    } finally {
        loadMoreBtn.textContent = 'Load More';
        loadMoreBtn.disabled    = false;
    }
}

// ============================================================
// 8. MODAL
// ============================================================
async function openCharacterModal(id, name, imageUrl) {
    modal.classList.remove('hidden');
    modalBody.innerHTML = '<p class="loading">Loading details...</p>';

    try {
        const details = await fetchCharacterDetails(id);

        const wrapper = document.createElement('div');
        wrapper.className = 'modal-char';

        const img = document.createElement('img');
        img.src = imageUrl || '';
        img.alt = name;

        const info = document.createElement('div');
        info.className = 'modal-char-info';

        const h3 = document.createElement('h3');
        h3.textContent = details.name;

        const nicknames = document.createElement('p');
        nicknames.className   = 'nicknames';
        nicknames.textContent = details.nicknames?.length
            ? `Also known as: ${details.nicknames.join(', ')}`
            : '';

        const about = document.createElement('p');
        about.className   = 'about';
        about.textContent = details.about
            ? details.about.slice(0, 800) + (details.about.length > 800 ? '...' : '')
            : 'No description available.';

        info.appendChild(h3);
        if (nicknames.textContent) info.appendChild(nicknames);
        info.appendChild(about);

        wrapper.appendChild(img);
        wrapper.appendChild(info);

        modalBody.innerHTML = '';
        modalBody.appendChild(wrapper);
    } catch {
        modalBody.innerHTML = '<p class="error">Could not load character details.</p>';
    }
}

function openEpisodeModal(ep) {
    modal.classList.remove('hidden');
    modalBody.innerHTML = '';

    const div = document.createElement('div');
    div.className = 'modal-ep';

    const h3 = document.createElement('h3');
    h3.textContent = `Episode ${ep.mal_id}: ${ep.title || '-'}`;

    const rows = [
        { label: ep.title_japanese, className: '' },
        { label: ep.aired ? `Aired: ${new Date(ep.aired).toLocaleDateString('de-AT')}` : '', className: '' },
        { label: ep.score ? `Score: ${ep.score}` : '', className: 'score' },
        { label: [ep.filler && 'Filler', ep.recap && 'Recap'].filter(Boolean).join(' · '), className: 'tag' },
    ];

    div.appendChild(h3);
    for (const row of rows) {
        if (!row.label) continue;
        const p = document.createElement('p');
        p.textContent = row.label;
        if (row.className) p.classList.add(row.className);
        div.appendChild(p);
    }

    modalBody.appendChild(div);
}

function closeModal() {
    modal.classList.add('hidden');
    modalBody.innerHTML = '';
}

// ============================================================
// 9. SEARCH
// ============================================================
async function doSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    const type = searchType.value;
    searchResults.innerHTML = '<p class="loading">Searching...</p>';

    try {
        if (type === 'characters') {
            const chars = await fetchSearchCharacters(query);
            if (!chars || chars.length === 0) {
                searchResults.innerHTML = '<p class="empty">No characters found.</p>';
                return;
            }
            const normalised = chars.map(c => ({
                mal_id:   c.mal_id,
                name:     c.name,
                imageUrl: c.images?.jpg?.image_url ?? '',
            }));
            searchResults.innerHTML = '';
            const grid = document.createElement('div');
            grid.className = 'cards-grid';
            for (const c of normalised) {
                grid.appendChild(createCharacterCard(c));
            }
            searchResults.appendChild(grid);

        } else {
            if (state.episodes.length === 0) {
                searchResults.innerHTML = '<p class="empty">Load the Episodes page first, then search here.</p>';
                return;
            }
            const lc = query.toLowerCase();
            const results = state.episodes.filter(ep =>
                ep.title?.toLowerCase().includes(lc) ||
                ep.title_japanese?.toLowerCase().includes(lc)
            );
            if (results.length === 0) {
                searchResults.innerHTML = '<p class="empty">No episodes found.</p>';
                return;
            }
            searchResults.innerHTML = '';
            for (const ep of results) {
                searchResults.appendChild(createEpisodeItem(ep));
            }
        }
    } catch {
        searchResults.innerHTML = '<p class="error">Search failed. Try again.</p>';
    }
}

// ============================================================
// 10. FAVORITES
// ============================================================
function isFavorite(id) {
    return state.favorites.some(f => f.mal_id === id);
}

function toggleFavorite(id, name, imageUrl) {
    if (isFavorite(id)) {
        state.favorites = state.favorites.filter(f => f.mal_id !== id);
    } else {
        state.favorites.push({ mal_id: id, name, imageUrl });
    }
}

// ============================================================
// 11. NAVIGATION
// ============================================================
function showPage(pageName) {
    for (const page of Object.values(pages)) {
        page.classList.add('hidden');
    }
    pages[pageName].classList.remove('hidden');

    for (const btn of navBtns) {
        btn.classList.toggle('active', btn.dataset.page === pageName);
    }

    if (pageName === 'characters' && state.characters.length === 0) loadCharacters();
    if (pageName === 'episodes'   && state.episodes.length === 0)   loadEpisodes();
    if (pageName === 'favorites')                                    renderFavorites();
}

// ============================================================
// 12. EVENT BINDINGS
// ============================================================
for (const btn of navBtns) {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
}

charArcSelect.addEventListener('change', renderCharacters);
epArcSelect.addEventListener('change', renderEpisodes);

loadMoreBtn.addEventListener('click', loadMoreEpisodes);

searchBtn.addEventListener('click', doSearch);
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// ============================================================
// 13. INIT
// ============================================================
showPage('characters');
