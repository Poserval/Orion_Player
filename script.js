document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен');

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
    
    const cutTrackModal = document.getElementById('cut-track-modal');
    const closeCutModal = document.getElementById('close-cut-modal');
    const saveCutBtn = document.getElementById('save-cut-btn');
    const startSlider = document.getElementById('start-slider');
    const endSlider = document.getElementById('end-slider');
    const startTime = document.getElementById('start-time');
    const endTime = document.getElementById('end-time');
    
    const addToPlaylistModal = document.getElementById('add-to-playlist-modal');
    const closePlaylistSelect = document.getElementById('close-playlist-select');
    
    const shareModal = document.getElementById('share-modal');
    const closeShareModal = document.getElementById('close-share-modal');

    // Состояние
    let currentAudio = null;
    let isPlaying = false;
    let currentTrack = null;
    let selectedTrack = null;

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
            
            const mediaItems = activeTab.querySelectorAll('.media-item, .folder-item, .playlist
