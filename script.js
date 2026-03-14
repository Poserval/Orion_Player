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

    // ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
    let currentAudio = null;
    let isPlaying = false;
    let currentTrack = null;
    let allAudioFiles = [];      // Все аудиофайлы на устройстве
    let recentMediaFiles = [];    // Все медиафайлы за последние сутки

    // ========== ЗАСТАВКА 5 СЕКУНД ==========
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                // После заставки запрашиваем разрешения и грузим файлы
                requestPermissionsAndLoadFiles();
            }, 500);
        }, 5000);
    }

    // ========== ЗАПРОС РАЗРЕШЕНИЙ И ЗАГРУЗКА ФАЙЛОВ ==========
    async function requestPermissionsAndLoadFiles() {
        try {
            // Проверяем, доступен ли Capacitor
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

            // Запрашиваем разрешения на всё
            console.log('Запрашиваем разрешения...');
            const permissions = await CapacitorMediaStore.requestPermissions({
                types: ['audio', 'images', 'video']
            });

            console.log('Разрешения:', permissions);

            // Грузим аудиофайлы для страницы музыки
            await loadAllAudioFiles(CapacitorMediaStore);

            // Грузим недавние медиафайлы для главной
            await loadRecentMediaFiles(CapacitorMediaStore);

        } catch (error) {
            console.error('Ошибка при загрузке файлов:', error);
            loadTestData(); // Если что-то пошло не так - показываем тестовые
        }
    }

    // ========== ЗАГРУЗКА ВСЕХ АУДИОФАЙЛОВ ==========
    async function loadAllAudioFiles(mediaStore) {
        try {
            const result = await mediaStore.getMediasByType({
                mediaType: 'audio',
                includeExternal: true,  // Включая SD-карту
                limit: 1000,             // Максимум
                sortBy: 'TITLE',
                sortOrder: 'ASC'
            });

            if (result && result.media) {
                allAudioFiles = result.media;
                console.log(`Загружено ${allAudioFiles.length} аудиофайлов`);

                // Обновляем счетчик на вкладке "Все"
                const countAll = document.getElementById('count-all');
                if (countAll) countAll.textContent = allAudioFiles.length;

                // Отображаем аудиофайлы
                renderAllAudioFiles();
            }

            // Загружаем также информацию об альбомах, артистах, жанрах
            await loadAlbums(mediaStore);
            await loadArtists(mediaStore);
            await loadGenres(mediaStore);

        } catch (error) {
            console.error('Ошибка загрузки аудио:', error);
            loadTestAudioData();
        }
    }

    // ========== ЗАГРУЗКА НЕДАВНИХ МЕДИАФАЙЛОВ (за сутки) ==========
    async function loadRecentMediaFiles(mediaStore) {
        try {
            // Получаем timestamp 24 часа назад
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

            // Загружаем все типы медиа
            const [audio, video, images] = await Promise.all([
                mediaStore.getMediasByType({
                    mediaType: 'audio',
                    includeExternal: true,
                    limit: 100,
                    sortBy: 'DATE_ADDED',
                    sortOrder: 'DESC'
                }),
                mediaStore.getMediasByType({
                    mediaType: 'video',
                    includeExternal: true,
                    limit: 100,
                    sortBy: 'DATE_ADDED',
                    sortOrder: 'DESC'
                }),
                mediaStore.getMediasByType({
                    mediaType: 'image',
                    includeExternal: true,
                    limit: 100,
                    sortBy: 'DATE_ADDED',
                    sortOrder: 'DESC'
                })
            ]);

            // Объединяем и фильтруем по дате
            recentMediaFiles = [
                ...(audio.media || []),
                ...(video.media || []),
                ...(images.media || [])
            ].filter(file => file.dateAdded >= oneDayAgo);

            console.log(`Загружено ${recentMediaFiles.length} недавних медиафайлов`);

            // Отображаем на главной
            renderRecentMediaFiles();

        } catch (error) {
            console.error('Ошибка загрузки недавних файлов:', error);
            loadTestRecentData();
        }
    }

    // ========== ЗАГРУЗКА АЛЬБОМОВ ==========
    async function loadAlbums(mediaStore) {
        try {
            const result = await mediaStore.getAlbums();
            if (result && result.albums) {
                const countAlbums = document.getElementById('count-albums');
                if (countAlbums) countAlbums.textContent = result.albums.length;

                // Отображаем альбомы (заглушка - можно потом сделать полноценно)
                const albumsList = document.querySelector('#tab-albums .media-list');
                if (albumsList) {
                    albumsList.innerHTML = '';
                    result.albums.slice(0, 20).forEach(album => {
                        const item = document.createElement('div');
                        item.className = 'media-item';
                        item.innerHTML = `
                            <span class="icon">💿</span>
                            <span class="name">${album.name}</span>
                            <span class="artist-name">${album.artist || 'Неизвестно'}</span>
                            <span class="file-count">${album.trackCount} треков</span>
                        `;
                        albumsList.appendChild(item);
                    });
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки альбомов:', error);
        }
    }

    // ========== ЗАГРУЗКА АРТИСТОВ ==========
    async function loadArtists(mediaStore) {
        // Пока заглушка - в следующей версии
    }

    // ========== ЗАГРУЗКА ЖАНРОВ ==========
    async function loadGenres(mediaStore) {
        // Пока заглушка - в следующей версии
    }

    // ========== ОТОБРАЖЕНИЕ АУДИОФАЙЛОВ ==========
    function renderAllAudioFiles() {
        const audioList = document.getElementById('all-audio-list');
        if (!audioList) return;

        audioList.innerHTML = '';

        allAudioFiles.forEach(file => {
            const item = document.createElement('div');
            item.className = 'media-item';
            
            // Определяем иконку по mime-типу
            let icon = '🎵';
            if (file.mimeType?.includes('flac')) icon = '🎵';
            else if (file.mimeType?.includes('aac')) icon = '🎵';
            else if (file.mimeType?.includes('opus')) icon = '🎵';
            
            // Форматируем размер
            const size = formatFileSize(file.size);
            
            // Длительность в минуты:секунды
            const duration = file.duration ? formatDuration(file.duration) : '';

            item.innerHTML = `
                <span class="icon">${icon}</span>
                <span class="name">${file.displayName || file.title || 'Без названия'}</span>
                <span class="file-size">${size}</span>
                <span class="file-duration">${duration}</span>
                <button class="track-menu-btn">⋮</button>
            `;

            // Сохраняем данные файла
            item.dataset.fileId = file.id;
            item.dataset.filePath = file.uri;
            item.dataset.fileType = 'audio';
            
            audioList.appendChild(item);
        });

        // Добавляем обработчики
        attachMediaItemHandlers();
    }

    // ========== ОТОБРАЖЕНИЕ НЕДАВНИХ МЕДИАФАЙЛОВ ==========
    function renderRecentMediaFiles() {
        const mediaList = document.getElementById('media-list');
        if (!mediaList) return;

        mediaList.innerHTML = '';

        recentMediaFiles.forEach(file => {
            const item = document.createElement('div');
            item.className = 'media-item';
            
            // Определяем иконку по типу
            let icon = '📄';
            if (file.mediaType === 'audio') icon = '🎵';
            else if (file.mediaType === 'video') icon = '🎬';
            else if (file.mediaType === 'image') icon = '🖼️';
            
            const size = formatFileSize(file.size);
            const date = new Date(file.dateAdded).toLocaleString();

            item.innerHTML = `
                <span class="icon">${icon}</span>
                <span class="name">${file.displayName || 'Без названия'}</span>
                <span class="file-size">${size}</span>
                <span class="file-date">${date}</span>
                <button class="track-menu-btn">⋮</button>
            `;

            item.dataset.fileId = file.id;
            item.dataset.filePath = file.uri;
            item.dataset.fileType = file.mediaType;
            
            mediaList.appendChild(item);
        });

        attachMediaItemHandlers();
    }

    // ========== ФОРМАТИРОВАНИЕ РАЗМЕРА ФАЙЛА ==========
    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // ========== ФОРМАТИРОВАНИЕ ДЛИТЕЛЬНОСТИ ==========
    function formatDuration(ms) {
        if (!ms) return '';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // ========== ТЕСТОВЫЕ ДАННЫЕ (ЕСЛИ НЕТ ПЛАГИНА) ==========
    function loadTestData() {
        loadTestAudioData();
        loadTestRecentData();
    }

    function loadTestAudioData() {
        allAudioFiles = [
            { displayName: 'трек_1.mp3', size: 5242880, mimeType: 'audio/mp3', duration: 213000 },
            { displayName: 'трек_2.flac', size: 26214400, mimeType: 'audio/flac', duration: 312000 },
            { displayName: 'подкаст_5.opus', size: 8388608, mimeType: 'audio/opus', duration: 1245000 },
            { displayName: 'запись.aac', size: 4194304, mimeType: 'audio/aac', duration: 185000 }
        ];
        renderAllAudioFiles();
        
        const countAll = document.getElementById('count-all');
        if (countAll) countAll.textContent = allAudioFiles.length;
    }

    function loadTestRecentData() {
        recentMediaFiles = [
            { displayName: 'видео_20250313.mp4', size: 15938355, mediaType: 'video', dateAdded: Date.now() - 3600000 },
            { displayName: 'трек_вчера.mp3', size: 5242880, mediaType: 'audio', dateAdded: Date.now() - 7200000 },
            { displayName: 'фото.jpg', size: 3145728, mediaType: 'image', dateAdded: Date.now() - 10800000 }
        ];
        renderRecentMediaFiles();
    }

    // ========== ПРИКРЕПЛЕНИЕ ОБРАБОТЧИКОВ ==========
    function attachMediaItemHandlers() {
        // Обработка клика по файлу (воспроизведение)
        document.querySelectorAll('.media-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.track-menu-btn')) return;

                const name = item.querySelector('.name').textContent;
                const filePath = item.dataset.filePath;
                const fileType = item.dataset.fileType;

                playMedia({
                    name: name,
                    path: filePath,
                    type: fileType,
                    icon: item.querySelector('.icon').textContent
                });
            });
        });

        // Обработка кнопки меню
        document.querySelectorAll('.track-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = btn.closest('.media-item');
                const trackName = item.querySelector('.name').textContent;
                
                // Здесь можно открыть меню трека
                console.log('Меню для:', trackName);
                // Пока просто алерт
                alert(`Действия с "${trackName}"\nВ следующей версии: добавить в плейлист, поделиться, редактировать теги, обрезать, удалить...`);
            });
        });
    }

    // ========== ФУНКЦИИ ПЛЕЕРА ==========
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function updateMiniPlayerTime() {
        if (currentAudio) {
            const current = formatTime(currentAudio.currentTime);
            const duration = formatTime(currentAudio.duration);
            miniTime.textContent = `${current} / ${duration}`;
        }
    }

    function playMedia(file) {
        console.log('Воспроизведение:', file);

        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        // Создаем новый Audio объект
        // В реальности тут должен быть путь к файлу через Capacitor
        currentAudio = new Audio(file.path || file.name);
        currentTrack = file;

        miniIcon.textContent = file.icon || '🎵';
        miniTrackName.textContent = file.name;
        miniPlayer.classList.remove('hidden');

        currentAudio.addEventListener('timeupdate', updateMiniPlayerTime);
        currentAudio.addEventListener('loadedmetadata', updateMiniPlayerTime);
        currentAudio.addEventListener('ended', () => {
            isPlaying = false;
            miniPlayPause.textContent = '▶';
        });

        currentAudio.play()
            .then(() => {
                isPlaying = true;
                miniPlayPause.textContent = '⏸';
            })
            .catch(e => {
                console.error('Ошибка воспроизведения:', e);
                alert('Не удалось воспроизвести файл');
            });
    }

    // Управление мини-плеером
    if (miniPlayPause) {
        miniPlayPause.addEventListener('click', (e) => {
            e.stopPropagation();

            if (currentAudio) {
                if (isPlaying) {
                    currentAudio.pause();
                    miniPlayPause.textContent = '▶';
                } else {
                    currentAudio.play();
                    miniPlayPause.textContent = '⏸';
                }
                isPlaying = !isPlaying;
            }
        });
    }

    if (miniPlayer) {
        miniPlayer.addEventListener('click', () => {
            if (currentTrack && currentAudio) {
                app.style.display = 'none';
                playerScreen.style.display = 'block';

                const currentTime = currentAudio.currentTime;

                if (currentTrack.type === 'video') {
                    videoPlayer.style.display = 'block';
                    audioPlayer.style.display = 'none';
                    videoPlayer.src = currentTrack.path || currentTrack.name;
                    videoPlayer.currentTime = currentTime;
                    videoPlayer.play();
                    subtitleBtn.style.display = 'block';
                } else {
                    audioPlayer.style.display = 'block';
                    videoPlayer.style.display = 'none';
                    audioPlayer.src = currentTrack.path || currentTrack.name;
                    audioPlayer.currentTime = currentTime;
                    audioPlayer.play();
                    subtitleBtn.style.display = 'none';
                }
            }
        });
    }

    // Выход из полноэкранного плеера
    function exitPlayer() {
        if (playerScreen && playerScreen.style.display === 'block') {
            playerScreen.style.display = 'none';
            app.style.display = 'flex';

            if (videoPlayer) videoPlayer.pause();
            if (audioPlayer) audioPlayer.pause();
        }
    }

    document.addEventListener('backbutton', exitPlayer, false);

    if (videoPlayer) {
        videoPlayer.addEventListener('click', (e) => {
            e.preventDefault();
            if (videoPlayer.paused) {
                videoPlayer.play();
            } else {
                videoPlayer.pause();
            }
        });
    }

    if (audioPlayer) {
        audioPlayer.addEventListener('click', (e) => {
            e.preventDefault();
            if (audioPlayer.paused) {
                audioPlayer.play();
            } else {
                audioPlayer.pause();
            }
        });
    }

    // ========== НАВИГАЦИЯ ==========
    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            pageMain.classList.remove('active-page');
            pageMusic.classList.add('active-page');
        });
    }

    if (backToMain) {
        backToMain.addEventListener('click', () => {
            pageMusic.classList.remove('active-page');
            pageMain.classList.add('active-page');
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

            const mediaItems = activeTab.querySelectorAll('.media-item');

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
                const mediaItems = activeTab.querySelectorAll('.media-item');
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

    console.log('Orion Player готов к работе!');
});
