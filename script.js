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

    // Заглушки для списка (временные данные)
    const mockRecentFiles = [
        { name: 'видео_20250313.mp4', type: 'video', icon: '🎬' },
        { name: 'трек_вчера.mp3', type: 'audio', icon: '🎵' },
        { name: 'книга_глава_3.mp3', type: 'audiobook', icon: '🎧' },
        { name: 'видос_с_работы.mp4', type: 'video', icon: '🎬' },
        { name: 'новый_трек.flac', type: 'audio', icon: '🎵' },
        { name: 'фильм_до_конца.mp4', type: 'video', icon: '🎬' }
    ];

    // Заполняем список файлов на главной
    const mediaList = document.getElementById('media-list');
    function renderMainList() {
        if (!mediaList) return;
        
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
            videoPlayer.src = '#'; // Заглушка
            videoPlayer.play();
            subtitleBtn.style.display = 'block';
        } else {
            audioPlayer.style.display = 'block';
            videoPlayer.style.display = 'none';
            audioPlayer.src = '#'; // Заглушка
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
