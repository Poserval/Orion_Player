document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен'); // для проверки

    // Элементы
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

    // Элементы плейлистов
    const createPlaylistBtn = document.getElementById('create-playlist-btn');
    const newPlaylistModal = document.getElementById('new-playlist-modal');
    const playlistName = document.getElementById('playlist-name');
    const createPlaylistConfirm = document.getElementById('create-playlist-confirm');
    const closePlaylistModal = document.getElementById('close-playlist-modal');

    // Заставка 5 секунд
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 500);
        }, 5000);
    }

    // Переключение на страницу Музыка
    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            console.log('Музыка нажата');
            pageMain.classList.remove('active-page');
            pageMusic.classList.add('active-page');
        });
    }

    // Возврат на главную
    if (backToMain) {
        backToMain.addEventListener('click', () => {
            console.log('Назад на главную');
            pageMusic.classList.remove('active-page');
            pageMain.classList.add('active-page');
        });
    }

    // ========== ПОИСК ==========
    if (searchToggle) {
        searchToggle.addEventListener('click', () => {
            console.log('Поиск открыт');
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
                // Убираем активный класс у всех вкладок
                tabItems.forEach(t => t.classList.remove('active-tab'));
                // Добавляем активный класс текущей вкладке
                tab.classList.add('active-tab');
                
                // Получаем id контента
                const tabName = tab.getAttribute('data-tab');
                
                // Скрываем все панели
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active-pane');
                });
                
                // Показываем нужную панель
                const activePane = document.getElementById(`tab-${tabName}`);
                if (activePane) {
                    activePane.classList.add('active-pane');
                }

                // Закрываем поиск
                if (searchBar) {
                    searchBar.classList.add('hidden');
                    if (searchInput) searchInput.value = '';
                }
            });
        });
    }

    // ========== СОРТИРОВКА ==========
    const sortItems = document.querySelectorAll('.sort-item');
    sortItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const sortType = e.target.getAttribute('data-sort');
            const pane = e.target.closest('.tab-pane');
            if (!pane) return;
            
            const mediaList = pane.querySelector('.media-list');
            if (!mediaList) return;
            
            const items = Array.from(mediaList.children);
            
            items.sort((a, b) => {
                const nameA = a.querySelector('.name')?.textContent || '';
                const nameB = b.querySelector('.name')?.textContent || '';
                return nameA.localeCompare(nameB);
            });
            
            mediaList.innerHTML = '';
            items.forEach(item => mediaList.appendChild(item));
            
            const sortBtn = pane.querySelector('.sort-btn');
            if (sortBtn) {
                sortBtn.textContent = `Сортировка: ${e.target.textContent} ▼`;
            }
        });
    });

    // ========== ПЛЕЙЛИСТЫ ==========
    if (createPlaylistBtn) {
        createPlaylistBtn.addEventListener('click', () => {
            console.log('Создать плейлист');
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
                const playlistsList = document.getElementById('playlists-list');
                if (playlistsList) {
                    const newPlaylist = document.createElement('div');
                    newPlaylist.className = 'playlist-item';
                    newPlaylist.innerHTML = `
                        <span class="icon">📋</span>
                        <span class="name">${name}</span>
                        <span class="file-count">0 треков</span>
                    `;
                    playlistsList.appendChild(newPlaylist);
                    
                    const countElem = document.getElementById('count-playlists');
                    if (countElem) {
                        const currentCount = parseInt(countElem.textContent) + 1;
                        countElem.textContent = currentCount;
                    }
                }
                
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

    // ========== МОДАЛКА РЕДАКТИРОВАНИЯ ==========
    if (editTabsBtn) {
        editTabsBtn.addEventListener('click', () => {
            console.log('Редактировать вкладки');
            const tabs = Array.from(tabItems).map(tab => ({
                name: tab.textContent.replace(/[0-9]/g, '').trim(),
                dataTab: tab.getAttribute('data-tab')
            }));
            
            renderEditTabsList(tabs);
            if (editTabsModal) {
                editTabsModal.classList.add('active');
            }
        });
    }

    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener('click', () => {
            if (editTabsModal) {
                editTabsModal.classList.remove('active');
            }
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
            
            if (editTabsModal) {
                editTabsModal.classList.remove('active');
            }
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
            if (editTabsModal) {
                editTabsModal.classList.add('active');
            }
        });
        tabsScroll.appendChild(editBtn);
    }

    // ========== ПЛЕЕР ==========
    function playMedia(file) {
        if (!app || !playerScreen) return;
        
        app.style.display = 'none';
        playerScreen.style.display = 'block';
        
        if (file.type === 'video') {
            if (videoPlayer) {
                videoPlayer.style.display = 'block';
                videoPlayer.src = '#';
                videoPlayer.play().catch(e => console.log('Автовоспроизведение заблокировано'));
            }
            if (audioPlayer) audioPlayer.style.display = 'none';
            if (subtitleBtn) subtitleBtn.style.display = 'block';
        } else {
            if (audioPlayer) {
                audioPlayer.style.display = 'block';
                audioPlayer.src = '#';
                audioPlayer.play().catch(e => console.log('Автовоспроизведение заблокировано'));
            }
            if (videoPlayer) videoPlayer.style.display = 'none';
            if (subtitleBtn) subtitleBtn.style.display = 'none';
        }
    }

    function exitPlayer() {
        if (playerScreen && playerScreen.style.display === 'block') {
            playerScreen.style.display = 'none';
            if (app) app.style.display = 'block';
            if (videoPlayer) videoPlayer.pause();
            if (audioPlayer) audioPlayer.pause();
        }
    }

    // Обработка системной кнопки назад
    document.addEventListener('backbutton', exitPlayer, false);

    // Тап по видео/аудио для паузы/плей
    if (videoPlayer) {
        videoPlayer.addEventListener('click', (e) => {
            e.preventDefault();
            if (videoPlayer.paused) {
                videoPlayer.play().catch(e => console.log('Ошибка воспроизведения'));
            } else {
                videoPlayer.pause();
            }
        });
    }

    if (audioPlayer) {
        audioPlayer.addEventListener('click', (e) => {
            e.preventDefault();
            if (audioPlayer.paused) {
                audioPlayer.play().catch(e => console.log('Ошибка воспроизведения'));
            } else {
                audioPlayer.pause();
            }
        });
    }

    // Клик по элементам списка для воспроизведения
    document.querySelectorAll('.media-item').forEach(item => {
        item.addEventListener('click', () => {
            const icon = item.querySelector('.icon')?.textContent || '';
            const name = item.querySelector('.name')?.textContent || '';
            const type = icon.includes('🎬') ? 'video' : 'audio';
            playMedia({ type, name, icon });
        });
    });

    // ========== МОДАЛКА ССЫЛКИ ==========
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', () => {
            if (modal) {
                modal.classList.add('active');
                if (urlInput) {
                    urlInput.value = '';
                    urlInput.focus();
                }
            }
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (modal) {
                modal.classList.remove('active');
            }
        });
    }

    if (playUrlBtn) {
        playUrlBtn.addEventListener('click', () => {
            const url = urlInput ? urlInput.value.trim() : '';
            if (url) {
                if (modal) {
                    modal.classList.remove('active');
                }
                playMedia({ type: 'video', name: url, icon: '🔗' });
            }
        });
    }

    // ========== СУБТИТРЫ ==========
    if (loadSubtitle) {
        loadSubtitle.addEventListener('click', () => {
            if (subtitleFile) {
                subtitleFile.click();
            }
        });
    }

    if (subtitleFile) {
        subtitleFile.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                console.log('Субтитры:', e.target.files[0].name);
            }
        });
    }

    console.log('Скрипт загружен полностью');
});
