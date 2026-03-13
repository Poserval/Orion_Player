document.addEventListener('DOMContentLoaded', () => {
    // Элементы
    const splash = document.getElementById('splash-screen');
    const app = document.getElementById('app');
    const modal = document.getElementById('link-modal');
    const addLinkBtn = document.getElementById('add-link-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const playUrlBtn = document.getElementById('play-url-btn');
    const urlInput = document.getElementById('url-input');
    const fileList = document.getElementById('file-list');
    const breadcrumbs = document.querySelector('.breadcrumbs .location');
    const playerScreen = document.getElementById('player-screen');
    const videoPlayer = document.getElementById('video-player');
    const audioPlayer = document.getElementById('audio-player');
    const subtitleBtn = document.getElementById('subtitle-btn');
    const loadSubtitle = document.getElementById('load-subtitle');
    const subtitleFile = document.getElementById('subtitle-file');

    // Состояние
    let currentPath = '/storage/emulated/0';

    // Заставка 2 секунды
    setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
        }, 500);
    }, 5000);

    // Мок-данные
    const mockFolders = [
        { name: 'Movies', type: 'folder', path: '/storage/emulated/0/Movies' },
        { name: 'Music', type: 'folder', path: '/storage/emulated/0/Music' },
        { name: 'Downloads', type: 'folder', path: '/storage/emulated/0/Downloads' }
    ];

    const mockFiles = [
        { name: 'big_buck_bunny.mp4', type: 'video', path: '#video1' },
        { name: 'ambient_loop.mp3', type: 'audio', path: '#audio1' },
        { name: 'interview.mp4', type: 'video', path: '#video2' }
    ];

    // Отрисовка
    function renderFileList(items) {
        fileList.innerHTML = '';
        
        if (currentPath !== '/storage/emulated/0') {
            const upItem = document.createElement('div');
            upItem.className = 'folder-item';
            upItem.innerHTML = '<span class="icon">⬆️</span><span class="name">.. (наверх)</span>';
            upItem.addEventListener('click', goUp);
            fileList.appendChild(upItem);
        }

        items.forEach(item => {
            const div = document.createElement('div');
            div.className = item.type === 'folder' ? 'folder-item' : 'file-item';
            
            let icon = '📄';
            if (item.type === 'folder') icon = '📁';
            else if (item.type === 'video') icon = '🎬';
            else if (item.type === 'audio') icon = '🎵';
            
            div.innerHTML = `<span class="icon">${icon}</span><span class="name">${item.name}</span>`;
            
            div.addEventListener('click', () => {
                if (item.type === 'folder') {
                    openFolder(item.path);
                } else {
                    playMedia(item);
                }
            });
            
            fileList.appendChild(div);
        });
    }

    // Навигация
    function openFolder(path) {
        currentPath = path;
        breadcrumbs.textContent = path;
        
        if (path.includes('Movies')) {
            renderFileList(mockFiles.filter(f => f.type === 'video'));
        } else if (path.includes('Music')) {
            renderFileList(mockFiles.filter(f => f.type === 'audio'));
        } else {
            renderFileList(mockFolders);
        }
    }

    function goUp() {
        const parts = currentPath.split('/');
        parts.pop();
        openFolder(parts.join('/') || '/storage/emulated/0');
    }

    // Плеер
    function playMedia(file) {
        app.style.display = 'none';
        playerScreen.style.display = 'block';
        
        if (file.type === 'video') {
            videoPlayer.style.display = 'block';
            audioPlayer.style.display = 'none';
            videoPlayer.src = file.path;
            videoPlayer.play();
            subtitleBtn.style.display = 'block';
        } else {
            audioPlayer.style.display = 'block';
            videoPlayer.style.display = 'none';
            audioPlayer.src = file.path;
            audioPlayer.play();
            subtitleBtn.style.display = 'none';
        }
    }

    // Выход из плеера
    function exitPlayer() {
        if (playerScreen.style.display === 'block') {
            playerScreen.style.display = 'none';
            app.style.display = 'flex';
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
    addLinkBtn.addEventListener('click', () => {
        modal.classList.add('active');
        urlInput.value = '';
        urlInput.focus();
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    playUrlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
            modal.classList.remove('active');
            playMedia({ type: 'video', path: url, name: url });
        }
    });

    // Субтитры
    loadSubtitle.addEventListener('click', () => {
        subtitleFile.click();
    });

    subtitleFile.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            console.log('Субтитры:', e.target.files[0].name);
        }
    });

    // Старт
    openFolder('/storage/emulated/0');
});
