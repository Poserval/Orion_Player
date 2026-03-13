document.addEventListener('DOMContentLoaded', () => {
    // Элементы
    const splash = document.getElementById('splash-screen');
    const app = document.getElementById('app');
    const modal = document.getElementById('link-modal');
    const addLinkBtn = document.getElementById('add-link-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const playUrlBtn = document.getElementById('play-url-btn');
    const urlInput = document.getElementById('url-input');
    const mediaList = document.getElementById('media-list');
    const playerScreen = document.getElementById('player-screen');
    const videoPlayer = document.getElementById('video-player');
    const audioPlayer = document.getElementById('audio-player');
    const subtitleBtn = document.getElementById('subtitle-btn');
    const loadSubtitle = document.getElementById('load-subtitle');
    const subtitleFile = document.getElementById('subtitle-file');

    // Заставка 5 секунд
    setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
        }, 500);
    }, 5000);

    // Заглушки для списка
    const mockMediaItems = [
        { name: 'видео_20250313.mp4', type: 'video', icon: '🎬' },
        { name: 'трек_вчера.mp3', type: 'audio', icon: '🎵' },
        { name: 'книга_глава_3.mp3', type: 'audiobook', icon: '🎧' },
        { name: 'видос_с_работы.mp4', type: 'video', icon: '🎬' },
        { name: 'новый_трек.flac', type: 'audio', icon: '🎵' },
        { name: 'фильм_до_конца.mp4', type: 'video', icon: '🎬' },
        { name: 'ещё_один_трек.mp3', type: 'audio', icon: '🎵' },
        { name: 'клип.mp4', type: 'video', icon: '🎬' }
    ];

    // Заполняем список
    function renderMediaList() {
        if (!mediaList) return;
        
        mediaList.innerHTML = '';
        
        mockMediaItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'media-item';
            div.innerHTML = `<span class="icon">${item.icon}</span><span class="name">${item.name}</span>`;
            
            div.addEventListener('click', () => {
                playMedia({ type: item.type, path: '#', name: item.name });
            });
            
            mediaList.appendChild(div);
        });
    }

    // Плеер
    function playMedia(file) {
        document.querySelector('.content').style.display = 'none';
        playerScreen.style.display = 'block';
        
        if (file.type === 'video') {
            videoPlayer.style.display = 'block';
            audioPlayer.style.display = 'none';
            videoPlayer.src = file.path;
            videoPlayer.play();
            if (subtitleBtn) subtitleBtn.style.display = 'block';
        } else {
            audioPlayer.style.display = 'block';
            videoPlayer.style.display = 'none';
            audioPlayer.src = file.path;
            audioPlayer.play();
            if (subtitleBtn) subtitleBtn.style.display = 'none';
        }
    }

    // Выход из плеера
    function exitPlayer() {
        if (playerScreen.style.display === 'block') {
            playerScreen.style.display = 'none';
            document.querySelector('.content').style.display = 'flex';
            videoPlayer.pause();
            audioPlayer.pause();
        }
    }

    // Обработка системной кнопки "Назад"
    document.addEventListener('backbutton', exitPlayer, false);

    // Тап для паузы/плея
    if (videoPlayer) {
        videoPlayer.addEventListener('click', (e) => {
            e.preventDefault();
            videoPlayer.paused ? videoPlayer.play() : videoPlayer.pause();
        });
    }

    if (audioPlayer) {
        audioPlayer.addEventListener('click', (e) => {
            e.preventDefault();
            audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
        });
    }

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
                playMedia({ type: 'video', path: url, name: url });
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
                // Здесь будет загрузка субтитров
            }
        });
    }

    // Инициализация
    renderMediaList();
});
