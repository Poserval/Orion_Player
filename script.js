document.addEventListener('DOMContentLoaded', () => {
    console.log('Orion Player загружается...');

    // ========== ЭЛЕМЕНТЫ ==========
    const splash = document.getElementById('splash-screen');
    const app = document.getElementById('app');
    const modal = document.getElementById('link-modal');
    const addLinkBtn = document.getElementById('add-link-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const playUrlBtn = document.getElementById('play-url-btn');
    const urlInput = document.getElementById('url-input');
    const playerScreen = document.getElementById('player-screen');
    const videoPlayer = document.getElementById('video-player');
    const audioPlayer = document.getElementById('audio-player');
    const subtitleBtn = document.getElementById('subtitle-btn');
    const loadSubtitle = document.getElementById('load-subtitle');
    const subtitleFile = document.getElementById('subtitle-file');
    
    // Элементы нового плеера
    const playerCloseBtn = document.getElementById('player-close');
    const playerTrackName = document.getElementById('player-track-name');
    const playerTrackArtist = document.getElementById('player-track-artist');
    const playerPlayPause = document.getElementById('player-play-pause');
    const playerPrev = document.getElementById('player-prev');
    const playerNext = document.getElementById('player-next');
    const playerSpeed = document.getElementById('player-speed');
    const playerCurrentTime = document.getElementById('player-current-time');
    const playerDuration = document.getElementById('player-duration');
    const playerProgressFill = document.getElementById('player-progress-fill');
    const playerProgressHandle = document.getElementById('player-progress-handle');
    const playerProgressBar = document.getElementById('player-progress-bar');
    const playerLike = document.getElementById('player-like');
    const playerMenu = document.getElementById('player-menu');
    const playerPlaylist = document.getElementById('player-playlist');
    const playerDevices = document.getElementById('player-devices');
    
    // Элементы страниц
    const pageMain = document.getElementById('page-main');
    const pageMusic = document.getElementById('page-music');
    const musicBtn = document.getElementById('music-btn');
    const backToMain = document.getElementById('back-to-main');

    // Элементы вкладок
    const tabItems = document.querySelectorAll('.tab-item:not(.edit-tab)');
    const editTabsBtn = document.getElementById('edit-tabs-btn');
    const editTabsModal = document.getElementById('edit-tabs-modal');
    const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
    const saveTabsBtn = document.getElementById('save-tabs-btn');
    const editTabsList = document.getElementById('edit-tabs-list');
    const tabsScroll = document.getElementById('tabs-scroll');

    // Элементы поиска
    const searchToggle = document.getElementById('search-toggle');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');

    // Элементы мини-плеера
    const miniPlayer = document.getElementById('mini-player');
    const miniIcon = document.getElementById('mini-icon');
    const miniTrackName = document.getElementById('mini-track-name');
    const miniPlayPause = document.getElementById('mini-play-pause');
    const miniTime = document.getElementById('mini-time');

    // Элементы меню трека
    const trackMenuModal = document.getElementById('track-menu-modal');
    const closeTrackMenu = document.getElementById('close-track-menu');
    const trackMenuTitle = document.getElementById('track-menu-title');
    
    // Элементы модалок
    const editTagsModal = document.getElementById('edit-tags-modal');
    const closeTagsModal = document.getElementById('close-tags-modal');
    const saveTagsBtn = document.getElementById('save-tags-btn');
    const editTitle = document.getElementById('edit-title');
    const editArtist = document.getElementById('edit-artist');
    const editAlbum = document.getElementById('edit-album');
    const editGenre = document.getElementById('edit-genre');
    
    const cutTrackModal = document.getElementById('cut-track-modal');
    const closeCutModal = document.getElementById('close-cut-modal');
    const saveCutBtn = document.getElementById('save-cut-btn');
    const selectFullTrack = document.getElementById('select-full-track');
    const exactStart = document.getElementById('exact-start');
    const exactEnd = document.getElementById('exact-end');
    const currentPosition = document.getElementById('current-position');
    const startPlus = document.getElementById('start-plus');
    const endPlus = document.getElementById('end-plus');
    
    const addToPlaylistModal = document.getElementById('add-to-playlist-modal');
    const closePlaylistSelect = document.getElementById('close-playlist-select');
    
    const shareModal = document.getElementById('share-modal');
    const closeShareModal = document.getElementById('close-share-modal');
    
    const newPlaylistModal = document.getElementById('new-playlist-modal');
    const playlistName = document.getElementById('playlist-name');
    const createPlaylistConfirm = document.getElementById('create-playlist-confirm');
    const closePlaylistModal = document.getElementById('close-playlist-modal');
    
    const createPlaylistBtn = document.getElementById('create-playlist-btn');

    // Элементы сортировки
    const sortItems = document.querySelectorAll('.sort-item');

    // ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
    let currentAudio = null;
    let isPlaying = false;
    let currentTrack = null;
    let selectedTrack = null;
    let playbackSpeed = 1.0;
    
    // Данные
    let allAudioFiles = [];
    let allFolders = [];
    let allPlaylists = [];
    let allAlbums = [];
    let allArtists = [];
    let allGenres = [];
    let recentMediaFiles = [];

    // Кэширование
    const CACHE_KEYS = {
        AUDIO: 'orion_audio_files',
        FOLDERS: 'orion_folders',
        ALBUMS: 'orion_albums',
        ARTISTS: 'orion_artists',
        GENRES: 'orion_genres',
        RECENT: 'orion_recent',
        TIMESTAMP: 'orion_timestamp'
    };

    // ========== MEDIA SESSION API ==========
    function updateMediaSession(file, isPaused = false) {
        if ('mediaSession' in navigator) {
            console.log('Обновляем MediaSession для:', file.displayName);
            
            // Устанавливаем метаданные
            navigator.mediaSession.metadata = new MediaMetadata({
                title: file.displayName || file.title || 'Без названия',
                artist: file.artist || 'Неизвестный исполнитель',
                album: file.album || '',
                artwork: [
                    { src: 'assets/images/icon-header.png', sizes: '96x96', type: 'image/png' },
                    { src: 'assets/images/icon-header.png', sizes: '128x128', type: 'image/png' },
                    { src: 'assets/images/icon-header.png', sizes: '192x192', type: 'image/png' },
                    { src: 'assets/images/icon-header.png', sizes: '256x256', type: 'image/png' },
                    { src: 'assets/images/icon-header.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            // Устанавливаем обработчики кнопок
            navigator.mediaSession.setActionHandler('play', () => {
                console.log('MediaSession: play');
                if (currentAudio) {
                    currentAudio.play();
                    isPlaying = true;
                    if (miniPlayPause) miniPlayPause.textContent = '⏸';
                    if (playerPlayPause) playerPlayPause.textContent = '⏸';
                    updateMediaSession(file, false);
                }
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                console.log('MediaSession: pause');
                if (currentAudio) {
                    currentAudio.pause();
                    isPlaying = false;
                    if (miniPlayPause) miniPlayPause.textContent = '▶';
                    if (playerPlayPause) playerPlayPause.textContent = '▶';
                    updateMediaSession(file, true);
                }
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                console.log('MediaSession: previous');
                // Здесь будет логика предыдущего трека
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                console.log('MediaSession: next');
                // Здесь будет логика следующего трека
            });

            navigator.mediaSession.setActionHandler('seekbackward', () => {
                console.log('MediaSession: seek backward');
                if (currentAudio) {
                    currentAudio.currentTime = Math.max(0, currentAudio.currentTime - 10);
                }
            });

            navigator.mediaSession.setActionHandler('seekforward', () => {
                console.log('MediaSession: seek forward');
                if (currentAudio) {
                    currentAudio.currentTime = Math.min(currentAudio.duration, currentAudio.currentTime + 10);
                }
            });

            navigator.mediaSession.setActionHandler('seekto', (details) => {
                console.log('MediaSession: seek to', details.seekTime);
                if (currentAudio && details.seekTime) {
                    currentAudio.currentTime = details.seekTime;
                }
            });

            // Устанавливаем состояние воспроизведения
            navigator.mediaSession.playbackState = isPaused ? 'paused' : 'playing';
        }
    }

    // ========== ИСТОРИЯ НАВИГАЦИИ ==========
    let navigationStack = ['main'];

    function navigateTo(page) {
        console.log('Навигация на:', page);
        
        pageMain.classList.remove('active-page');
        pageMusic.classList.remove('active-page');
        
        if (page === 'main') {
            pageMain.classList.add('active-page');
        } else if (page === 'music') {
            pageMusic.classList.add('active-page');
        }
        
        if (navigationStack[navigationStack.length - 1] !== page) {
            navigationStack.push(page);
        }
        
        console.log('Стек навигации:', navigationStack);
    }

    function goBack() {
        console.log('Назад, текущий стек:', navigationStack);
        
        if (navigationStack.length > 1) {
            navigationStack.pop();
            const previousPage = navigationStack[navigationStack.length - 1];
            
            pageMain.classList.remove('active-page');
            pageMusic.classList.remove('active-page');
            
            if (previousPage === 'main') {
                pageMain.classList.add('active-page');
            } else if (previousPage === 'music') {
                pageMusic.classList.add('active-page');
            }
            
            console.log('Возврат на:', previousPage);
        } else {
            console.log('Выход из приложения');
        }
    }

    // ========== ЗАСТАВКА ==========
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                initApp();
            }, 500);
        }, 3000);
    }

    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    async function initApp() {
        console.log('Инициализация приложения...');
        
        const cachedTime = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
        const now = Date.now();
        
        if (cachedTime && (now - parseInt(cachedTime)) < 3600000) {
            console.log('Загружаем из кэша...');
            loadFromCache();
        } else {
            console.log('Кэш устарел, запрашиваем разрешения...');
            await requestPermissionsAndLoadFiles();
        }
        
        loadPlaylists();
        navigationStack = ['main'];
    }

    // ========== ЗАГРУЗКА ИЗ КЭША ==========
    function loadFromCache() {
        try {
            allAudioFiles = JSON.parse(localStorage.getItem(CACHE_KEYS.AUDIO)) || [];
            allFolders = JSON.parse(localStorage.getItem(CACHE_KEYS.FOLDERS)) || [];
            allAlbums = JSON.parse(localStorage.getItem(CACHE_KEYS.ALBUMS)) || [];
            allArtists = JSON.parse(localStorage.getItem(CACHE_KEYS.ARTISTS)) || [];
            allGenres = JSON.parse(localStorage.getItem(CACHE_KEYS.GENRES)) || [];
            recentMediaFiles = JSON.parse(localStorage.getItem(CACHE_KEYS.RECENT)) || [];
            
            console.log('Загружено из кэша:', {
                audio: allAudioFiles.length,
                folders: allFolders.length,
                albums: allAlbums.length,
                artists: allArtists.length,
                genres: allGenres.length,
                recent: recentMediaFiles.length
            });
            
            updateAllCounters();
            renderAllAudioFiles();
            renderFolders();
            renderAlbums();
            renderArtists();
            renderGenres();
            renderRecentMediaFiles();
            
        } catch (e) {
            console.error('Ошибка загрузки из кэша:', e);
            requestPermissionsAndLoadFiles();
        }
    }

    // ========== СОХРАНЕНИЕ В КЭШ ==========
    function saveToCache() {
        try {
            localStorage.setItem(CACHE_KEYS.AUDIO, JSON.stringify(allAudioFiles));
            localStorage.setItem(CACHE_KEYS.FOLDERS, JSON.stringify(allFolders));
            localStorage.setItem(CACHE_KEYS.ALBUMS, JSON.stringify(allAlbums));
            localStorage.setItem(CACHE_KEYS.ARTISTS, JSON.stringify(allArtists));
            localStorage.setItem(CACHE_KEYS.GENRES, JSON.stringify(allGenres));
            localStorage.setItem(CACHE_KEYS.RECENT, JSON.stringify(recentMediaFiles));
            localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
            console.log('Кэш сохранен');
        } catch (e) {
            console.error('Ошибка сохранения кэша:', e);
        }
    }

    // ========== ЗАПРОС РАЗРЕШЕНИЙ И ЗАГРУЗКА ==========
    async function requestPermissionsAndLoadFiles() {
        try {
            if (typeof Capacitor === 'undefined') {
                console.log('Capacitor не найден - используем тестовые данные');
                loadTestData();
                return;
            }

            const { CapacitorMediaStore } = Capacitor.Plugins;

            if (!CapacitorMediaStore) {
                console.log('MediaStore плагин не найден - тестовые данные');
                loadTestData();
                return;
            }

            console.log('Запрашиваем разрешения...');
            const permissions = await CapacitorMediaStore.requestPermissions({
                types: ['audio', 'images', 'video']
            });
            console.log('Разрешения получены:', permissions);

            await Promise.all([
                loadAllAudioFiles(CapacitorMediaStore),
                loadFolders(CapacitorMediaStore),
                loadAlbums(CapacitorMediaStore),
                loadArtists(CapacitorMediaStore),
                loadGenres(CapacitorMediaStore),
                loadRecentMediaFiles(CapacitorMediaStore)
            ]);

            saveToCache();

        } catch (error) {
            console.error('Ошибка при загрузке файлов:', error);
            loadTestData();
        }
    }

    // ========== ЗАГРУЗКА АУДИОФАЙЛОВ ==========
    async function loadAllAudioFiles(mediaStore) {
        try {
            const result = await mediaStore.getMediasByType({
                mediaType: 'audio',
                includeExternal: true,
                limit: 10000,
                sortBy: 'TITLE',
                sortOrder: 'ASC'
            });

            if (result && result.media) {
                allAudioFiles = result.media;
                console.log(`Загружено ${allAudioFiles.length} аудиофайлов`);
                updateCount('count-all', allAudioFiles.length);
                renderAllAudioFiles();
            }
        } catch (error) {
            console.error('Ошибка загрузки аудио:', error);
        }
    }

    // ========== ЗАГРУЗКА ПАПОК ==========
    async function loadFolders(mediaStore) {
        try {
            const folderMap = new Map();
            
            allAudioFiles.forEach(file => {
                if (file.folderPath) {
                    const folderName = file.folderPath.split('/').pop() || 'Root';
                    const folderPath = file.folderPath;
                    
                    if (!folderMap.has(folderPath)) {
                        folderMap.set(folderPath, {
                            name: folderName,
                            path: folderPath,
                            count: 1
                        });
                    } else {
                        const folder = folderMap.get(folderPath);
                        folder.count++;
                    }
                }
            });
            
            allFolders = Array.from(folderMap.values());
            console.log(`Найдено ${allFolders.length} папок`);
            updateCount('count-folders', allFolders.length);
            renderFolders();
            
        } catch (error) {
            console.error('Ошибка загрузки папок:', error);
        }
    }

    // ========== ЗАГРУЗКА АЛЬБОМОВ ==========
    async function loadAlbums(mediaStore) {
        try {
            const albumMap = new Map();
            
            allAudioFiles.forEach(file => {
                if (file.album) {
                    const key = file.album;
                    if (!albumMap.has(key)) {
                        albumMap.set(key, {
                            name: file.album,
                            artist: file.artist || 'Неизвестно',
                            count: 1
                        });
                    } else {
                        albumMap.get(key).count++;
                    }
                }
            });
            
            allAlbums = Array.from(albumMap.values());
            console.log(`Найдено ${allAlbums.length} альбомов`);
            updateCount('count-albums', allAlbums.length);
            renderAlbums();
            
        } catch (error) {
            console.error('Ошибка загрузки альбомов:', error);
        }
    }

    // ========== ЗАГРУЗКА АРТИСТОВ ==========
    async function loadArtists(mediaStore) {
        try {
            const artistMap = new Map();
            
            allAudioFiles.forEach(file => {
                if (file.artist) {
                    const key = file.artist;
                    if (!artistMap.has(key)) {
                        artistMap.set(key, {
                            name: file.artist,
                            count: 1
                        });
                    } else {
                        artistMap.get(key).count++;
                    }
                }
            });
            
            allArtists = Array.from(artistMap.values());
            console.log(`Найдено ${allArtists.length} артистов`);
            updateCount('count-artists', allArtists.length);
            renderArtists();
            
        } catch (error) {
            console.error('Ошибка загрузки артистов:', error);
        }
    }

    // ========== ЗАГРУЗКА ЖАНРОВ ==========
    async function loadGenres(mediaStore) {
        try {
            const genreMap = new Map();
            
            allAudioFiles.forEach(file => {
                if (file.genre) {
                    const key = file.genre;
                    if (!genreMap.has(key)) {
                        genreMap.set(key, {
                            name: file.genre,
                            count: 1
                        });
                    } else {
                        genreMap.get(key).count++;
                    }
                }
            });
            
            allGenres = Array.from(genreMap.values());
            console.log(`Найдено ${allGenres.length} жанров`);
            updateCount('count-genres', allGenres.length);
            renderGenres();
            
        } catch (error) {
            console.error('Ошибка загрузки жанров:', error);
        }
    }

    // ========== ЗАГРУЗКА НЕДАВНИХ ==========
    async function loadRecentMediaFiles(mediaStore) {
        try {
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            
            recentMediaFiles = allAudioFiles.filter(file => 
                file.dateAdded && file.dateAdded >= oneDayAgo
            );
            
            console.log(`Найдено ${recentMediaFiles.length} недавних файлов`);
            renderRecentMediaFiles();
            
        } catch (error) {
            console.error('Ошибка загрузки недавних:', error);
        }
    }

    // ========== ЗАГРУЗКА ПЛЕЙЛИСТОВ ==========
    function loadPlaylists() {
        try {
            const saved = localStorage.getItem('orion_playlists');
            if (saved) {
                allPlaylists = JSON.parse(saved);
            } else {
                allPlaylists = [
                    { name: 'Любимое', count: 0 },
                    { name: 'В машину', count: 0 },
                    { name: 'Для сна', count: 0 }
                ];
            }
            updateCount('count-playlists', allPlaylists.length);
            renderPlaylists();
        } catch (e) {
            console.error('Ошибка загрузки плейлистов:', e);
        }
    }

    // ========== ОБНОВЛЕНИЕ СЧЕТЧИКОВ ==========
    function updateCount(elementId, count) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = count;
    }

    function updateAllCounters() {
        updateCount('count-all', allAudioFiles.length);
        updateCount('count-folders', allFolders.length);
        updateCount('count-playlists', allPlaylists.length);
        updateCount('count-albums', allAlbums.length);
        updateCount('count-artists', allArtists.length);
        updateCount('count-genres', allGenres.length);
    }

    // ========== ФУНКЦИИ СОРТИРОВКИ ==========
    function sortFiles(files, sortBy, order = 'asc') {
        return files.sort((a, b) => {
            let valA, valB;
            
            switch(sortBy) {
                case 'name':
                    valA = a.displayName || a.title || '';
                    valB = b.displayName || b.title || '';
                    break;
                case 'size':
                    valA = a.size || 0;
                    valB = b.size || 0;
                    break;
                case 'date':
                    valA = a.dateAdded || 0;
                    valB = b.dateAdded || 0;
                    break;
                case 'duration':
                    valA = a.duration || 0;
                    valB = b.duration || 0;
                    break;
                case 'artist':
                    valA = a.artist || '';
                    valB = b.artist || '';
                    break;
                case 'count':
                    valA = a.count || 0;
                    valB = b.count || 0;
                    break;
                default:
                    return 0;
            }
            
            if (typeof valA === 'string') {
                const compare = valA.localeCompare(valB);
                return order === 'asc' ? compare : -compare;
            } else {
                const compare = valA - valB;
                return order === 'asc' ? compare : -compare;
            }
        });
    }

    // ========== ОТОБРАЖЕНИЕ ==========
    function renderAllAudioFiles() {
        const audioList = document.getElementById('all-audio-list');
        if (!audioList) return;

        audioList.innerHTML = '';

        allAudioFiles.forEach(file => {
            const item = createMediaItem(file, 'audio');
            audioList.appendChild(item);
        });

        attachMediaItemHandlers();
    }

    function renderFolders() {
        const foldersList = document.querySelector('#tab-folders .media-list');
        if (!foldersList) return;

        foldersList.innerHTML = '';

        allFolders.forEach(folder => {
            const item = document.createElement('div');
            item.className = 'folder-item';
            item.innerHTML = `
                <span class="icon">📁</span>
                <span class="name">${folder.name}</span>
                <span class="file-count">${folder.count} файлов</span>
                <button class="track-menu-btn">⋮</button>
            `;
            item.dataset.folderPath = folder.path;
            foldersList.appendChild(item);
        });
    }

    function renderPlaylists() {
        const playlistsList = document.getElementById('playlists-list');
        if (!playlistsList) return;

        playlistsList.innerHTML = '';

        allPlaylists.forEach(playlist => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            item.innerHTML = `
                <span class="icon">📋</span>
                <span class="name">${playlist.name}</span>
                <span class="file-count">${playlist.count} треков</span>
                <button class="track-menu-btn">⋮</button>
            `;
            playlistsList.appendChild(item);
        });
    }

    function renderAlbums() {
        const albumsList = document.querySelector('#tab-albums .media-list');
        if (!albumsList) return;

        albumsList.innerHTML = '';

        allAlbums.forEach(album => {
            const item = document.createElement('div');
            item.className = 'media-item';
            item.innerHTML = `
                <span class="icon">💿</span>
                <span class="name">${album.name}</span>
                <span class="artist-name">${album.artist}</span>
                <span class="file-count">${album.count} треков</span>
                <button class="track-menu-btn">⋮</button>
            `;
            albumsList.appendChild(item);
        });
    }

    function renderArtists() {
        const artistsList = document.querySelector('#tab-artists .media-list');
        if (!artistsList) return;

        artistsList.innerHTML = '';

        allArtists.forEach(artist => {
            const item = document.createElement('div');
            item.className = 'media-item';
            item.innerHTML = `
                <span class="icon">👤</span>
                <span class="name">${artist.name}</span>
                <span class="file-count">${artist.count} треков</span>
                <button class="track-menu-btn">⋮</button>
            `;
            artistsList.appendChild(item);
        });
    }

    function renderGenres() {
        const genresList = document.querySelector('#tab-genres .media-list');
        if (!genresList) return;

        genresList.innerHTML = '';

        allGenres.forEach(genre => {
            const item = document.createElement('div');
            item.className = 'media-item';
            item.innerHTML = `
                <span class="icon">🎸</span>
                <span class="name">${genre.name}</span>
                <span class="file-count">${genre.count} треков</span>
                <button class="track-menu-btn">⋮</button>
            `;
            genresList.appendChild(item);
        });
    }

    function renderRecentMediaFiles() {
        const mediaList = document.getElementById('media-list');
        if (!mediaList) return;

        mediaList.innerHTML = '';

        recentMediaFiles.forEach(file => {
            const item = createMediaItem(file, 'recent');
            mediaList.appendChild(item);
        });
    }

    function createMediaItem(file, type) {
        const item = document.createElement('div');
        item.className = 'media-item';
        
        let icon = '🎵';
        if (type === 'recent') {
            if (file.mediaType === 'video') icon = '🎬';
            else if (file.mediaType === 'image') icon = '🖼️';
        }
        
        const size = formatFileSize(file.size);
        const duration = file.duration ? formatDuration(file.duration) : '';
        
        item.innerHTML = `
            <span class="icon">${icon}</span>
            <span class="name">${file.displayName || file.title || 'Без названия'}</span>
            <span class="file-size">${size}</span>
            ${duration ? `<span class="file-duration">${duration}</span>` : ''}
            <button class="track-menu-btn">⋮</button>
        `;

        item.dataset.fileId = file.id;
        item.dataset.filePath = file.uri || file.path;
        item.dataset.fileType = type;
        item.dataset.fileData = JSON.stringify(file);
        
        return item;
    }

    // ========== ФОРМАТТЕРЫ ==========
    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function formatDuration(ms) {
        if (!ms) return '';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ========== ПРИКРЕПЛЕНИЕ ОБРАБОТЧИКОВ ==========
    function attachMediaItemHandlers() {
        document.querySelectorAll('.media-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.track-menu-btn')) return;

                const fileData = item.dataset.fileData;
                if (fileData) {
                    try {
                        const file = JSON.parse(fileData);
                        playMedia(file);
                    } catch (e) {
                        console.error('Ошибка парсинга данных файла:', e);
                    }
                }
            });
        });

        document.querySelectorAll('.track-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = btn.closest('.media-item, .folder-item, .playlist-item');
                const name = item.querySelector('.name')?.textContent || 'Трек';
                
                let fileData = null;
                if (item.dataset.fileData) {
                    try {
                        fileData = JSON.parse(item.dataset.fileData);
                    } catch (e) {}
                }
                
                selectedTrack = {
                    name: name,
                    element: item,
                    data: fileData
                };
                
                trackMenuTitle.textContent = name;
                trackMenuModal.classList.add('active');
            });
        });
    }

    // ========== ФУНКЦИЯ ВОСПРОИЗВЕДЕНИЯ ==========
    async function playMedia(file) {
        console.log('Попытка воспроизведения:', file);

        if (!file || !file.uri) {
            console.error('Нет пути к файлу');
            alert('Не удалось воспроизвести файл: путь не найден');
            return;
        }

        try {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }

            let playableUrl;
            if (typeof Capacitor !== 'undefined') {
                playableUrl = Capacitor.convertFileSrc(file.uri);
            } else {
                playableUrl = file.uri;
            }
            
            console.log('Playable URL:', playableUrl);
            
            currentAudio = new Audio(playableUrl);
            currentTrack = file;

            miniIcon.textContent = '🎵';
            miniTrackName.textContent = file.displayName || file.title || 'Трек';
            miniPlayer.classList.remove('hidden');

            currentAudio.addEventListener('timeupdate', updateMiniPlayerTime);
            
            currentAudio.addEventListener('loadedmetadata', () => {
                console.log('Метаданные загружены, длительность:', currentAudio.duration);
                updateMiniPlayerTime();
            });
            
            currentAudio.addEventListener('ended', () => {
                isPlaying = false;
                miniPlayPause.textContent = '▶';
                if (playerPlayPause) playerPlayPause.textContent = '▶';
                updateMediaSession(file, true);
            });
            
            currentAudio.addEventListener('error', (e) => {
                console.error('Ошибка воспроизведения:', e);
                
                if (currentAudio.error && currentAudio.error.code === 4) {
                    openFullscreenPlayer(file, 0);
                } else {
                    alert('Не удалось воспроизвести файл. Формат не поддерживается.');
                }
            });

            currentAudio.play()
                .then(() => {
                    isPlaying = true;
                    miniPlayPause.textContent = '⏸';
                    console.log('Воспроизведение начато');
                    updateMediaSession(file, false);
                })
                .catch(e => {
                    console.error('Ошибка при попытке воспроизвести:', e);
                    
                    if (e.name === 'NotSupportedError') {
                        openFullscreenPlayer(file, 0);
                    }
                });

        } catch (e) {
            console.error('Критическая ошибка в playMedia:', e);
        }
    }

    // ========== ФУНКЦИЯ ОТКРЫТИЯ ПОЛНОЭКРАННОГО ПЛЕЕРА ==========
    function openFullscreenPlayer(file, startTime = 0) {
        console.log('Открываем полноэкранный плеер для:', file.displayName);
        
        playerScreen.style.display = 'block';
        app.style.display = 'none';
        
        playerTrackName.textContent = file.displayName || file.title || 'Без названия';
        playerTrackArtist.textContent = file.artist || 'Неизвестный исполнитель';
        
        let playableUrl;
        if (typeof Capacitor !== 'undefined') {
            playableUrl = Capacitor.convertFileSrc(file.uri);
        } else {
            playableUrl = file.uri;
        }
        
        if (file.mediaType === 'video') {
            videoPlayer.style.display = 'block';
            audioPlayer.style.display = 'none';
            videoPlayer.src = playableUrl;
            videoPlayer.currentTime = startTime;
            videoPlayer.play().catch(e => console.error('Ошибка видео:', e));
            if (subtitleBtn) subtitleBtn.style.display = 'block';
        } else {
            audioPlayer.style.display = 'block';
            videoPlayer.style.display = 'none';
            audioPlayer.src = playableUrl;
            audioPlayer.currentTime = startTime;
            audioPlayer.play().catch(e => console.error('Ошибка аудио:', e));
            if (subtitleBtn) subtitleBtn.style.display = 'none';
        }
        
        if (currentAudio) {
            currentAudio.pause();
        }
        currentAudio = file.mediaType === 'video' ? videoPlayer : audioPlayer;
        currentTrack = file;
        isPlaying = true;
        
        if (playerPlayPause) playerPlayPause.textContent = '⏸';
        
        if (file.duration) {
            playerDuration.textContent = formatDuration(file.duration);
        }
        
        // Добавляем обработчик времени для обновления прогресса
        currentAudio.addEventListener('timeupdate', updateFullscreenProgress);
        
        // Обновляем MediaSession
        updateMediaSession(file, false);
    }

    function updateMiniPlayerTime() {
        if (currentAudio) {
            const current = formatTime(currentAudio.currentTime);
            const duration = formatTime(currentAudio.duration);
            miniTime.textContent = `${current} / ${duration}`;
        }
    }

    function updateFullscreenProgress() {
        if (currentAudio && playerCurrentTime && playerProgressFill && playerProgressHandle) {
            const current = currentAudio.currentTime;
            const duration = currentAudio.duration;
            
            playerCurrentTime.textContent = formatTime(current);
            
            if (duration && duration > 0 && isFinite(duration)) {
                const percent = (current / duration) * 100;
                playerProgressFill.style.width = `${percent}%`;
                playerProgressHandle.style.left = `${percent}%`;
            }
        }
    }

    // Управление мини-плеером
    if (miniPlayPause) {
        miniPlayPause.addEventListener('click', (e) => {
            e.stopPropagation();

            if (currentAudio) {
                if (isPlaying) {
                    currentAudio.pause();
                    miniPlayPause.textContent = '▶';
                    if (playerPlayPause) playerPlayPause.textContent = '▶';
                    updateMediaSession(currentTrack, true);
                } else {
                    currentAudio.play()
                        .then(() => {
                            miniPlayPause.textContent = '⏸';
                            if (playerPlayPause) playerPlayPause.textContent = '⏸';
                            updateMediaSession(currentTrack, false);
                        })
                        .catch(e => console.error('Ошибка при возобновлении:', e));
                }
                isPlaying = !isPlaying;
            }
        });
    }

    if (miniPlayer) {
        miniPlayer.addEventListener('click', () => {
            if (currentTrack && currentAudio) {
                const currentTime = currentAudio.currentTime;
                openFullscreenPlayer(currentTrack, currentTime);
            }
        });
    }

    // ========== УПРАВЛЕНИЕ ПОЛНОЭКРАННЫМ ПЛЕЕРОМ ==========
    if (playerCloseBtn) {
        playerCloseBtn.addEventListener('click', exitPlayer);
    }

    if (playerPlayPause) {
        playerPlayPause.addEventListener('click', () => {
            if (currentAudio) {
                if (isPlaying) {
                    currentAudio.pause();
                    playerPlayPause.textContent = '▶';
                    if (miniPlayPause) miniPlayPause.textContent = '▶';
                    updateMediaSession(currentTrack, true);
                } else {
                    currentAudio.play();
                    playerPlayPause.textContent = '⏸';
                    if (miniPlayPause) miniPlayPause.textContent = '⏸';
                    updateMediaSession(currentTrack, false);
                }
                isPlaying = !isPlaying;
            }
        });
    }

    if (playerPrev) {
        playerPrev.addEventListener('click', () => {
            console.log('Предыдущий трек - в разработке');
        });
    }

    if (playerNext) {
        playerNext.addEventListener('click', () => {
            console.log('Следующий трек - в разработке');
        });
    }

    if (playerSpeed) {
        playerSpeed.addEventListener('click', () => {
            const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
            const currentIndex = speeds.indexOf(playbackSpeed);
            const nextIndex = (currentIndex + 1) % speeds.length;
            playbackSpeed = speeds[nextIndex];
            
            playerSpeed.textContent = playbackSpeed + 'x';
            
            if (currentAudio) {
                currentAudio.playbackRate = playbackSpeed;
            }
        });
    }

    if (playerProgressBar) {
        playerProgressBar.addEventListener('click', (e) => {
            if (currentAudio && currentAudio.duration) {
                const rect = playerProgressBar.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percent = clickX / rect.width;
                const newTime = percent * currentAudio.duration;
                
                currentAudio.currentTime = newTime;
                updateFullscreenProgress();
            }
        });
    }

    if (playerLike) {
        playerLike.addEventListener('click', () => {
            console.log('Лайк - в разработке');
        });
    }

    if (playerMenu) {
        playerMenu.addEventListener('click', () => {
            if (selectedTrack) {
                trackMenuModal.classList.add('active');
            }
        });
    }

    if (playerPlaylist) {
        playerPlaylist.addEventListener('click', () => {
            console.log('Плейлист - в разработке');
        });
    }

    if (playerDevices) {
        playerDevices.addEventListener('click', () => {
            console.log('Устройства - в разработке');
        });
    }

    // ========== ВЫХОД ИЗ ПЛЕЕРА ==========
    function exitPlayer() {
        if (playerScreen && playerScreen.style.display === 'block') {
            console.log('Закрываем полноэкранный плеер');
            
            playerScreen.style.display = 'none';
            app.style.display = 'flex';
            
            if (videoPlayer) {
                videoPlayer.pause();
                videoPlayer.src = '';
            }
            if (audioPlayer) {
                audioPlayer.pause();
                audioPlayer.src = '';
            }
            
            // Сбрасываем MediaSession
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'none';
                try {
                    navigator.mediaSession.setActionHandler('play', null);
                    navigator.mediaSession.setActionHandler('pause', null);
                    navigator.mediaSession.setActionHandler('previoustrack', null);
                    navigator.mediaSession.setActionHandler('nexttrack', null);
                } catch (e) {}
            }
            
            console.log('Плеер закрыт');
        }
    }

    // ========== ОБРАБОТКА КНОПКИ НАЗАД ==========
    function handleBackButton() {
        console.log('Системная кнопка назад нажата');
        
        if (playerScreen && playerScreen.style.display === 'block') {
            console.log('Закрываем полноэкранный плеер');
            exitPlayer();
            return;
        }
        
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            console.log('Закрываем модалку');
            activeModal.classList.remove('active');
            return;
        }
        
        goBack();
    }

    document.addEventListener('backbutton', handleBackButton, false);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            handleBackButton();
        }
    });

    // ========== НАВИГАЦИЯ ==========
    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            navigateTo('music');
        });
    }

    if (backToMain) {
        backToMain.addEventListener('click', () => {
            navigateTo('main');
        });
    }

    // ========== ПОИСК ==========
    if (searchToggle) {
        searchToggle.addEventListener('click', () => {
            searchBar.classList.toggle('hidden');
            if (!searchBar.classList.contains('hidden')) {
                searchInput.focus();
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const activeTab = document.querySelector('.tab-pane.active-pane');
            if (!activeTab) return;

            const mediaItems = activeTab.querySelectorAll('.media-item, .folder-item, .playlist-item');
            mediaItems.forEach(item => {
                const name = item.querySelector('.name')?.textContent.toLowerCase() || '';
                if (query === '' || name.includes(query)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            const activeTab = document.querySelector('.tab-pane.active-pane');
            if (activeTab) {
                const mediaItems = activeTab.querySelectorAll('.media-item, .folder-item, .playlist-item');
                mediaItems.forEach(item => {
                    item.style.display = 'flex';
                });
            }
            searchInput.focus();
        });
    }

    // ========== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ==========
    if (tabItems.length > 0) {
        tabItems.forEach(tab => {
            tab.addEventListener('click', () => {
                tabItems.forEach(t => t.classList.remove('active-tab'));
                tab.classList.add('active-tab');

                const tabName = tab.getAttribute('data-tab');
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active-pane');
                });

                const activePane = document.getElementById(`tab-${tabName}`);
                if (activePane) {
                    activePane.classList.add('active-pane');
                }

                if (searchBar) {
                    searchBar.classList.add('hidden');
                    if (searchInput) searchInput.value = '';
                }
            });
        });
    }

    // ========== СОРТИРОВКА ==========
    if (sortItems.length > 0) {
        sortItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const sortBy = e.target.getAttribute('data-sort');
                const pane = e.target.closest('.tab-pane');
                if (!pane) return;

                const paneId = pane.id;
                let sortedFiles = [];

                switch(paneId) {
                    case 'tab-all':
                        sortedFiles = sortFiles([...allAudioFiles], sortBy);
                        allAudioFiles = sortedFiles;
                        renderAllAudioFiles();
                        break;
                    case 'tab-folders':
                        sortedFiles = sortFiles([...allFolders], sortBy);
                        allFolders = sortedFiles;
                        renderFolders();
                        break;
                    case 'tab-albums':
                        sortedFiles = sortFiles([...allAlbums], sortBy);
                        allAlbums = sortedFiles;
                        renderAlbums();
                        break;
                    case 'tab-artists':
                        sortedFiles = sortFiles([...allArtists], sortBy);
                        allArtists = sortedFiles;
                        renderArtists();
                        break;
                    case 'tab-genres':
                        sortedFiles = sortFiles([...allGenres], sortBy);
                        allGenres = sortedFiles;
                        renderGenres();
                        break;
                }

                const sortBtn = pane.querySelector('.sort-btn');
                if (sortBtn) {
                    const sortText = e.target.textContent;
                    sortBtn.textContent = `Сортировка: ${sortText} ▼`;
                }
            });
        });
    }

    // ========== МЕНЮ ТРЕКА ==========
    if (closeTrackMenu) {
        closeTrackMenu.addEventListener('click', () => {
            trackMenuModal.classList.remove('active');
        });
    }

    document.querySelectorAll('.track-menu-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            const action = item.getAttribute('data-action');
            trackMenuModal.classList.remove('active');
            
            switch(action) {
                case 'add-to-playlist':
                    if (addToPlaylistModal) addToPlaylistModal.classList.add('active');
                    break;
                case 'share':
                    if (shareModal) shareModal.classList.add('active');
                    break;
                case 'set-ringtone':
                    if (selectedTrack?.data) {
                        alert('Функция установки рингтона будет доступна в следующей версии');
                    }
                    break;
                case 'edit-tags':
                    if (editTagsModal && selectedTrack?.data) {
                        editTitle.value = selectedTrack.data.title || '';
                        editArtist.value = selectedTrack.data.artist || '';
                        editAlbum.value = selectedTrack.data.album || '';
                        editGenre.value = selectedTrack.data.genre || '';
                        editTagsModal.classList.add('active');
                    }
                    break;
                case 'cut-track':
                    if (cutTrackModal && selectedTrack?.data) {
                        document.getElementById('cut-track-title').textContent = selectedTrack.name;
                        cutTrackModal.classList.add('active');
                    }
                    break;
                case 'delete':
                    if (selectedTrack && confirm(`Удалить "${selectedTrack.name}" с телефона?`)) {
                        alert('Функция удаления будет доступна в следующей версии');
                    }
                    break;
            }
        });
    });

    // ========== РЕДАКТИРОВАНИЕ ТЕГОВ ==========
    if (closeTagsModal) {
        closeTagsModal.addEventListener('click', () => {
            editTagsModal.classList.remove('active');
        });
    }

    if (saveTagsBtn) {
        saveTagsBtn.addEventListener('click', async () => {
            if (!selectedTrack?.data) return;
            try {
                alert('Сохранение тегов будет доступно в следующей версии');
                editTagsModal.classList.remove('active');
            } catch (e) {
                console.error('Ошибка сохранения тегов:', e);
            }
        });
    }

    // ========== ОБРЕЗКА ТРЕКА ==========
    if (selectFullTrack) {
        selectFullTrack.addEventListener('click', () => {
            if (exactStart) exactStart.textContent = '00:00.0';
            if (exactEnd && selectedTrack?.data?.duration) {
                const total = formatDuration(selectedTrack.data.duration);
                exactEnd.textContent = total;
            }
            if (currentPosition) currentPosition.textContent = '00:00.0';
        });
    }

    if (closeCutModal) {
        closeCutModal.addEventListener('click', () => {
            cutTrackModal.classList.remove('active');
        });
    }

    if (saveCutBtn) {
        saveCutBtn.addEventListener('click', () => {
            const start = exactStart?.textContent || '00:00';
            const end = exactEnd?.textContent || '00:00';
            alert(`Функция обрезки будет доступна в следующей версии (${start} - ${end})`);
            cutTrackModal.classList.remove('active');
        });
    }

    // ========== ПЛЕЙЛИСТЫ ==========
    if (createPlaylistBtn) {
        createPlaylistBtn.addEventListener('click', () => {
            if (newPlaylistModal) {
                newPlaylistModal.classList.add('active');
                if (playlistName) {
                    playlistName.value = '';
                    playlistName.focus();
                }
            }
        });
    }

    if (createPlaylistConfirm) {
        createPlaylistConfirm.addEventListener('click', () => {
            const name = playlistName ? playlistName.value.trim() : '';
            if (name) {
                allPlaylists.push({ name, count: 0 });
                localStorage.setItem('orion_playlists', JSON.stringify(allPlaylists));
                renderPlaylists();
                updateCount('count-playlists', allPlaylists.length);
                
                if (newPlaylistModal) {
                    newPlaylistModal.classList.remove('active');
                }
            }
        });
    }

    if (closePlaylistModal) {
        closePlaylistModal.addEventListener('click', () => {
            if (newPlaylistModal) {
                newPlaylistModal.classList.remove('active');
            }
        });
    }

    document.querySelectorAll('.add-to-playlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const playlistItem = btn.closest('.playlist-select-item');
            const playlistName = playlistItem.querySelector('span')?.textContent;
            
            if (selectedTrack) {
                alert(`"${selectedTrack.name}" добавлен в плейлист "${playlistName}"`);
                addToPlaylistModal.classList.remove('active');
            }
        });
    });

    if (closePlaylistSelect) {
        closePlaylistSelect.addEventListener('click', () => {
            addToPlaylistModal.classList.remove('active');
        });
    }

    // ========== ПОДЕЛИТЬСЯ ==========
    document.querySelectorAll('.share-option').forEach(option => {
        option.addEventListener('click', () => {
            const shareMethod = option.getAttribute('data-share');
            const trackName = selectedTrack?.name || 'трек';
            
            if (shareMethod === 'system') {
                if (selectedTrack?.data?.uri) {
                    alert(`Системное меню шаринга для "${trackName}"`);
                }
            } else {
                alert(`Поделиться "${trackName}" через ${shareMethod} будет доступно в следующей версии`);
            }
            
            shareModal.classList.remove('active');
        });
    });

    if (closeShareModal) {
        closeShareModal.addEventListener('click', () => {
            shareModal.classList.remove('active');
        });
    }

    // ========== ТЕСТОВЫЕ ДАННЫЕ ==========
    function loadTestData() {
        allAudioFiles = [
            { displayName: 'Песня 9. Настроение май ...', size: 5242880, uri: 'test://1', id: '1', duration: 213000, mediaType: 'audio', artist: 'dumbstruckdynamics736' },
            { displayName: 'трек_2.flac', size: 26214400, uri: 'test://2', id: '2', duration: 312000, mediaType: 'audio', artist: 'Исполнитель 2' }
        ];
        
        allFolders = [
            { name: 'Музыка', path: '/music', count: 45 },
            { name: 'Подкасты', path: '/podcasts', count: 12 }
        ];
        
        allAlbums = [
            { name: 'Альбом 2024', artist: 'Исполнитель', count: 12 },
            { name: 'Сборник', artist: 'Разные', count: 8 }
        ];
        
        allArtists = [
            { name: 'Исполнитель 1', count: 15 },
            { name: 'dumbstruckdynamics736', count: 8 }
        ];
        
        allGenres = [
            { name: 'Рок', count: 34 },
            { name: 'Классика', count: 28 }
        ];
        
        recentMediaFiles = allAudioFiles;
        
        updateAllCounters();
        renderAllAudioFiles();
        renderFolders();
        renderPlaylists();
        renderAlbums();
        renderArtists();
        renderGenres();
        renderRecentMediaFiles();
    }

    console.log('Orion Player готов к работе!');
});
