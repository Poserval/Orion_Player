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
    const audioPlayer = document.getElementById('audio-player');
    
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

    // ========== CAPACITOR MEDIA ДЛЯ СИСТЕМНОГО МЕНЮ ==========
    async function setupMediaSession(file, audioElement) {
        if (typeof Capacitor === 'undefined') return;
        
        try {
            const { Media } = Capacitor.Plugins;
            
            if (!Media) return;

            // Регистрируем медиа-сессию
            await Media.setMetadata({
                title: file.displayName || file.title || 'Без названия',
                artist: file.artist || 'Неизвестный исполнитель',
                album: file.album || '',
                artwork: [
                    { src: 'assets/images/icon-header.png', sizes: '96x96', type: 'image/png' },
                    { src: 'assets/images/icon-header.png', sizes: '128x128', type: 'image/png' },
                    { src: 'assets/images/icon-header.png', sizes: '192x192', type: 'image/png' },
                    { src: 'assets/images/icon-header.png', sizes: '256x256', type: 'image/png' },
                    { src: 'assets/images/icon-header.png', sizes: '512x512', type: 'image/png' }
                ],
                duration: file.duration ? file.duration / 1000 : 0
            });

            // Обработчики системных кнопок
            Media.addListener('play', () => {
                if (audioElement) {
                    audioElement.play();
                    isPlaying = true;
                    miniPlayPause.textContent = '⏸';
                }
            });

            Media.addListener('pause', () => {
                if (audioElement) {
                    audioElement.pause();
                    isPlaying = false;
                    miniPlayPause.textContent = '▶';
                }
            });

            Media.addListener('seekTo', (info) => {
                if (audioElement && info.time !== undefined) {
                    audioElement.currentTime = info.time;
                }
            });

            Media.addListener('next', () => {
                console.log('Следующий трек - в разработке');
            });

            Media.addListener('previous', () => {
                console.log('Предыдущий трек - в разработке');
            });

            // Обновляем состояние воспроизведения
            Media.setPlaybackState({ state: isPlaying ? 'playing' : 'paused' });

        } catch (error) {
            console.error('Ошибка настройки Media:', error);
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
    }

    function goBack() {
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
        const cachedTime = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
        const now = Date.now();
        
        if (cachedTime && (now - parseInt(cachedTime)) < 3600000) {
            loadFromCache();
        } else {
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
            
            updateAllCounters();
            renderAllAudioFiles();
            renderFolders();
            renderAlbums();
            renderArtists();
            renderGenres();
            renderRecentMediaFiles();
            
        } catch (e) {
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
        } catch (e) {}
    }

    // ========== ЗАПРОС РАЗРЕШЕНИЙ И ЗАГРУЗКА ==========
    async function requestPermissionsAndLoadFiles() {
        try {
            if (typeof Capacitor === 'undefined') {
                loadTestData();
                return;
            }

            const { CapacitorMediaStore } = Capacitor.Plugins;

            if (!CapacitorMediaStore) {
                loadTestData();
                return;
            }

            await CapacitorMediaStore.requestPermissions({
                types: ['audio', 'images', 'video']
            });

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
                updateCount('count-all', allAudioFiles.length);
                renderAllAudioFiles();
            }
        } catch (error) {}
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
            updateCount('count-folders', allFolders.length);
            renderFolders();
            
        } catch (error) {}
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
            updateCount('count-albums', allAlbums.length);
            renderAlbums();
            
        } catch (error) {}
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
            updateCount('count-artists', allArtists.length);
            renderArtists();
            
        } catch (error) {}
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
            updateCount('count-genres', allGenres.length);
            renderGenres();
            
        } catch (error) {}
    }

    // ========== ЗАГРУЗКА НЕДАВНИХ ==========
    async function loadRecentMediaFiles(mediaStore) {
        try {
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            
            recentMediaFiles = allAudioFiles.filter(file => 
                file.dateAdded && file.dateAdded >= oneDayAgo
            );
            
            renderRecentMediaFiles();
            
        } catch (error) {}
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
        } catch (e) {}
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
                    } catch (e) {}
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
        if (!file || !file.uri) {
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
            
            currentAudio = new Audio(playableUrl);
            currentTrack = file;

            miniIcon.textContent = '🎵';
            miniTrackName.textContent = file.displayName || file.title || 'Трек';
            miniPlayer.classList.remove('hidden');

            // Настраиваем MediaSession через Capacitor
            await setupMediaSession(file, currentAudio);

            currentAudio.addEventListener('timeupdate', () => {
                const current = formatTime(currentAudio.currentTime);
                const duration = formatTime(currentAudio.duration);
                miniTime.textContent = `${current} / ${duration}`;
                
                // Обновляем позицию в системном меню
                if (typeof Capacitor !== 'undefined' && Capacitor.Plugins.Media) {
                    Capacitor.Plugins.Media.setPlaybackPosition({
                        position: currentAudio.currentTime
                    });
                }
            });
            
            currentAudio.addEventListener('ended', () => {
                isPlaying = false;
                miniPlayPause.textContent = '▶';
                if (typeof Capacitor !== 'undefined' && Capacitor.Plugins.Media) {
                    Capacitor.Plugins.Media.setPlaybackState({ state: 'paused' });
                }
            });

            currentAudio.play()
                .then(() => {
                    isPlaying = true;
                    miniPlayPause.textContent = '⏸';
                    if (typeof Capacitor !== 'undefined' && Capacitor.Plugins.Media) {
                        Capacitor.Plugins.Media.setPlaybackState({ state: 'playing' });
                    }
                })
                .catch(e => {
                    alert('Не удалось воспроизвести файл. Формат не поддерживается.');
                });

        } catch (e) {}
    }

    // Управление мини-плеером
    if (miniPlayPause) {
        miniPlayPause.addEventListener('click', (e) => {
            e.stopPropagation();

            if (currentAudio) {
                if (isPlaying) {
                    currentAudio.pause();
                    miniPlayPause.textContent = '▶';
                    if (typeof Capacitor !== 'undefined' && Capacitor.Plugins.Media) {
                        Capacitor.Plugins.Media.setPlaybackState({ state: 'paused' });
                    }
                } else {
                    currentAudio.play()
                        .then(() => {
                            miniPlayPause.textContent = '⏸';
                            if (typeof Capacitor !== 'undefined' && Capacitor.Plugins.Media) {
                                Capacitor.Plugins.Media.setPlaybackState({ state: 'playing' });
                            }
                        })
                        .catch(e => {});
                }
                isPlaying = !isPlaying;
            }
        });
    }

    // ========== ОБРАБОТКА КНОПКИ НАЗАД ==========
    function handleBackButton() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
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
                item.style.display = (query === '' || name.includes(query)) ? 'flex' : 'none';
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
                case 'edit-tags':
                case 'cut-track':
                case 'delete':
                    alert(`Функция "${item.querySelector('span:last-child').textContent}" будет доступна в следующей версии`);
                    break;
            }
        });
    });

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
            alert(`Поделиться "${trackName}" через ${shareMethod}`);
            shareModal.classList.remove('active');
        });
    });

    if (closeShareModal) {
        closeShareModal.addEventListener('click', () => {
            shareModal.classList.remove('active');
        });
    }

    // ========== МОДАЛКА РЕДАКТИРОВАНИЯ ВКЛАДОК ==========
    if (editTabsBtn) {
        editTabsBtn.addEventListener('click', () => {
            const tabs = Array.from(tabItems).map(tab => ({
                name: tab.textContent.replace(/[0-9]/g, '').trim(),
                dataTab: tab.getAttribute('data-tab')
            }));
            
            renderEditTabsList(tabs);
            editTabsModal.classList.add('active');
        });
    }

    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener('click', () => {
            editTabsModal.classList.remove('active');
        });
    }

    if (saveTabsBtn) {
        saveTabsBtn.addEventListener('click', () => {
            const editItems = document.querySelectorAll('.edit-tab-item');
            const newOrder = Array.from(editItems).map(item => ({
                name: item.querySelector('.tab-name')?.textContent || '',
                dataTab: item.getAttribute('data-tab')
            }));
            
            updateTabsOrder(newOrder);
            editTabsModal.classList.remove('active');
        });
    }

    function renderEditTabsList(tabs) {
        if (!editTabsList) return;
        
        editTabsList.innerHTML = '';
        
        tabs.forEach(tab => {
            const item = document.createElement('div');
            item.className = 'edit-tab-item';
            item.setAttribute('data-tab', tab.dataTab);
            item.innerHTML = `
                <span class="drag-handle">⋮⋮</span>
                <span class="tab-name">${tab.name}</span>
            `;
            
            item.setAttribute('draggable', 'true');
            
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);
            
            editTabsList.appendChild(item);
        });
    }

    let dragStartIndex;

    function handleDragStart(e) {
        dragStartIndex = Array.from(editTabsList.children).indexOf(this);
        this.style.opacity = '0.5';
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        const dragEndIndex = Array.from(editTabsList.children).indexOf(this);
        
        if (dragStartIndex !== dragEndIndex) {
            const items = Array.from(editTabsList.children);
            const dragItem = items[dragStartIndex];
            const dropItem = items[dragEndIndex];
            
            if (dragStartIndex < dragEndIndex) {
                dropItem.after(dragItem);
            } else {
                dropItem.before(dragItem);
            }
        }
        
        this.style.opacity = '';
    }

    function handleDragEnd(e) {
        this.style.opacity = '';
    }

    function updateTabsOrder(newOrder) {
        if (!tabsScroll) return;
        
        tabsScroll.innerHTML = '';
        
        newOrder.forEach(tab => {
            const tabElement = document.createElement('div');
            tabElement.className = 'tab-item';
            if (tab.dataTab === 'all') {
                tabElement.classList.add('active-tab');
            }
            tabElement.setAttribute('data-tab', tab.dataTab);
            tabElement.textContent = tab.name;
            
            tabElement.addEventListener('click', () => {
                document.querySelectorAll('.tab-item:not(.edit-tab)').forEach(t => t.classList.remove('active-tab'));
                tabElement.classList.add('active-tab');
                
                const tabName = tabElement.getAttribute('data-tab');
                document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active-pane'));
                const activePane = document.getElementById(`tab-${tabName}`);
                if (activePane) {
                    activePane.classList.add('active-pane');
                }
            });
            
            tabsScroll.appendChild(tabElement);
        });
        
        const editBtn = document.createElement('div');
        editBtn.className = 'tab-item edit-tab';
        editBtn.id = 'edit-tabs-btn';
        editBtn.textContent = '✎';
        editBtn.addEventListener('click', () => {
            const tabs = Array.from(document.querySelectorAll('.tab-item:not(.edit-tab)')).map(t => ({
                name: t.textContent,
                dataTab: t.getAttribute('data-tab')
            }));
            renderEditTabsList(tabs);
            editTabsModal.classList.add('active');
        });
        tabsScroll.appendChild(editBtn);
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
