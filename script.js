document.addEventListener('DOMContentLoaded', () => {
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

    // Заставка 5 секунд
    setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
        }, 500);
    }, 5000);

    // Переключение на страницу Музыка
    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            pageMain.classList.remove('active-page');
            pageMusic.classList.add('active-page');
        });
    }

    // Возврат на главную
    if (backToMain) {
        backToMain.addEventListener('click', () => {
            pageMusic.classList.remove('active-page');
            pageMain.classList.add('active-page');
        });
    }

    // ========== ЛОГИКА ВКЛАДОК ==========
    
    // Переключение между вкладками
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
        });
    });

    // Открытие модалки редактирования
    if (editTabsBtn) {
        editTabsBtn.addEventListener('click', () => {
            // Собираем текущий порядок вкладок
            const tabs = Array.from(tabItems).map(tab => ({
                name: tab.textContent,
                dataTab: tab.getAttribute('data-tab')
            }));
            
            // Отрисовываем список для редактирования
            renderEditTabsList(tabs);
            
            editTabsModal.classList.add('active');
        });
    }

    // Закрытие модалки редактирования
    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener('click', () => {
            editTabsModal.classList.remove('active');
        });
    }

    // Сохранение порядка вкладок
    if (saveTabsBtn) {
        saveTabsBtn.addEventListener('click', () => {
            // Собираем новый порядок из DOM
            const editItems = document.querySelectorAll('.edit-tab-item');
            const newOrder = Array.from(editItems).map(item => ({
                name: item.querySelector('.tab-name').textContent,
                dataTab: item.getAttribute('data-tab')
            }));
            
            // Обновляем вкладки в новом порядке
            updateTabsOrder(newOrder);
            
            editTabsModal.classList.remove('active');
        });
    }

    // Функция отрисовки списка редактирования
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
            
            // Добавляем логику перетаскивания (drag & drop)
            item.setAttribute('draggable', 'true');
            
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);
            
            editTabsList.appendChild(item);
        });
    }

    // Переменные для drag & drop
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

    // Функция обновления порядка вкладок
    function updateTabsOrder(newOrder) {
        // Очищаем контейнер с вкладками
        tabsScroll.innerHTML = '';
        
        // Создаем вкладки в новом порядке
        newOrder.forEach(tab => {
            const tabElement = document.createElement('div');
            tabElement.className = 'tab-item';
            if (tab.dataTab === 'all') {
                tabElement.classList.add('active-tab');
            }
            tabElement.setAttribute('data-tab', tab.dataTab);
            tabElement.textContent = tab.name;
            
            // Добавляем обработчик клика
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
        
        // Добавляем кнопку редактирования в конец
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

    // Заглушки для списка на главной
    const mediaList = document.getElementById('media-list');
    function renderMainList() {
        if (!mediaList) return;
        
        const mockRecentFiles = [
            { name: 'видео_20250313.mp4', type: 'video', icon: '🎬' },
            { name: 'трек_вчера.mp3', type: 'audio', icon: '🎵' },
            { name: 'книга_глава_3.mp3', type: 'audiobook', icon: '🎧' }
        ];
        
        mediaList.innerHTML = '';
        
        mockRecentFiles.forEach(file => {
            const item = document.createElement('div');
            item.className = 'media-item';
            item.innerHTML = `
                <span class="icon">${file.icon}</span>
                <span class="name">${file.name}</span>
            `;
            
            item.addEventListener('click', () => {
                playMedia(file);
            });
            
            mediaList.appendChild(item);
        });
    }

    // Плеер
    function playMedia(file) {
        app.style.display = 'none';
        playerScreen.style.display = 'block';
        
        if (file.type === 'video') {
            videoPlayer.style.display = 'block';
            audioPlayer.style.display = 'none';
            videoPlayer.src = '#';
            videoPlayer.play();
            subtitleBtn.style.display = 'block';
        } else {
            audioPlayer.style.display = 'block';
            videoPlayer.style.display = 'none';
            audioPlayer.src = '#';
            audioPlayer.play();
            subtitleBtn.style.display = 'none';
        }
    }

    // Выход из плеера
    function exitPlayer() {
        if (playerScreen.style.display === 'block') {
            playerScreen.style.display = 'none';
            app.style.display = 'block';
            videoPlayer.pause();
            audioPlayer.pause();
        }
    }

    document.addEventListener('backbutton', exitPlayer, false);

    // Тап пауза/плей
    videoPlayer.addEventListener('click', (e) => {
        e.preventDefault();
        videoPlayer.paused ? videoPlayer.play() : videoPlayer.pause();
    });

    audioPlayer.addEventListener('click', (e) => {
        e.preventDefault();
        audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
    });

    // Модалка ссылки
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', () => {
            modal.classList.add('active');
            urlInput.value = '';
            urlInput.focus();
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (playUrlBtn) {
        playUrlBtn.addEventListener('click', () => {
            const url = urlInput.value.trim();
            if (url) {
                modal.classList.remove('active');
                playMedia({ type: 'video', name: url, icon: '🔗' });
            }
        });
    }

    // Субтитры
    if (loadSubtitle) {
        loadSubtitle.addEventListener('click', () => {
            subtitleFile.click();
        });
    }

    if (subtitleFile) {
        subtitleFile.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                console.log('Субтитры:', e.target.files[0].name);
            }
        });
    }

    // Старт
    renderMainList();
});
