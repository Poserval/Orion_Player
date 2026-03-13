document.addEventListener('DOMContentLoaded', () => {
    // ... (все предыдущие объявления элементов остаются)

    // Новые элементы поиска
    const searchToggle = document.getElementById('search-toggle');
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    
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
            
            // Получаем активную вкладку
            const activeTab = document.querySelector('.tab-pane.active-pane');
            const mediaItems = activeTab.querySelectorAll('.media-item, .folder-item, .playlist-item');
            
            if (query === '') {
                // Показываем все
                mediaItems.forEach(item => {
                    item.style.display = 'flex';
                });
            } else {
                // Фильтруем по названию
                mediaItems.forEach(item => {
                    const name = item.querySelector('.name').textContent.toLowerCase();
                    if (name.includes(query)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            
            // Показываем все элементы
            const activeTab = document.querySelector('.tab-pane.active-pane');
            const mediaItems = activeTab.querySelectorAll('.media-item, .folder-item, .playlist-item');
            mediaItems.forEach(item => {
                item.style.display = 'flex';
            });
            
            searchInput.focus();
        });
    }

    // Закрытие поиска при переключении вкладок
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            searchBar.classList.add('hidden');
            searchInput.value = '';
        });
    });

    // ... (остальной код)
});
