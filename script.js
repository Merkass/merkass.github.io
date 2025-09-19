// Данные пользователей с новыми требованиями
const usersData = [
    {
        id: "minebot_tob",
        blockId: "0499",
        username: "𓂃 𝔪𝔦𝔫𝔢𝔟𝔬𝔱 ་༘࿐",
        status: "soft_blocked",
        restrictionType: "Ослабленная блокировка",
        reason: "Многократные нарушения политики безопасности",
        dateReceived: "Скрыто",
        dateExpiry: "07.01.2026",
        fullDate: "Получено Скрыто, снято будет 07.01.2026"
    },
    {
        id: "Clexi_t",
        blockId: "0002",
        username: "Клекси",
        status: "blocked",
        restrictionType: "Автоматическая блокировка",
        statusNote: "(Вечная Блокировка)",
        reason: "Успешная попытка взлома консоли CWS.",
        dateReceived: "04.01.2021",
        dateExpiry: "Никогда",
        fullDate: "Получено 04.01.2021, снято будет Никогда"
    },
    {
        id: "Unknown",
        blockId: "0001",
        username: "мать.ебал",
        status: "restricted",
        restrictionType: "Автоматическое ограничение входа",
        statusNote: "(Блокировка и ограничение)",
        reason: "Нарушение правил EULA, попытка нарушить CWS-сервера",
        dateReceived: "29.12.2020",
        dateExpiry: "26.04.2027",
        fullDate: "Получено 29.12.2020, снято будет 26.04.2027"
    }
];

// Глобальные переменные
let currentFilter = 'all';
let filteredUsers = [...usersData];

/**
 * Получает первые две буквы имени пользователя для аватара
 * @param {string} username - Имя пользователя
 * @returns {string} Первые две буквы в верхнем регистре
 */
function getInitials(username) {
    return username.substring(0, 2).toUpperCase();
}

/**
 * Форматирует дату в российский формат
 * @param {string} dateString - Дата в формате DD.MM.YYYY
 * @returns {string} Отформатированная дата или исходная строка
 */
function formatDate(dateString) {
    if (dateString === "Никогда" || dateString === "Скрыто") {
        return dateString;
    }
    return dateString;
}

/**
 * Получает текст статуса на русском языке
 * @param {string} status - Статус пользователя
 * @returns {string} Локализованный статус
 */
function getStatusText(status) {
    const statusMap = {
        'blocked': 'Заблокирован',
        'restricted': 'Ограничен',
        'warning': 'Предупреждение',
        'soft_blocked': 'Заблокирован'
    };
    return statusMap[status] || status;
}

/**
 * Проверяет, истекла ли блокировка
 * @param {string} expiryDate - Дата окончания в формате DD.MM.YYYY
 * @returns {boolean} True если блокировка истекла
 */
function isExpired(expiryDate) {
    if (expiryDate === "Никогда" || expiryDate === "Скрыто") {
        return false;
    }
    
    const [day, month, year] = expiryDate.split('.');
    const expiry = new Date(year, month - 1, day);
    const now = new Date();
    
    return now > expiry;
}

/**
 * Получает количество дней до окончания блокировки
 * @param {string} expiryDate - Дата окончания в формате DD.MM.YYYY
 * @returns {number|string} Количество дней или специальное значение
 */
function getDaysUntilExpiry(expiryDate) {
    if (expiryDate === "Никогда") return "∞";
    if (expiryDate === "Скрыто") return "?";
    
    const [day, month, year] = expiryDate.split('.');
    const expiry = new Date(year, month - 1, day);
    const now = new Date();
    
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

/**
 * Создает HTML-разметку карточки пользователя
 * @param {Object} user - Объект с данными пользователя
 * @returns {string} HTML-разметка карточки
 */
function createUserCard(user) {
    const daysUntilExpiry = getDaysUntilExpiry(user.dateExpiry);
    const isUserExpired = isExpired(user.dateExpiry);
    
    let expiryClass = '';
    let expiryText = '';
    
    if (user.dateExpiry === "Никогда") {
        expiryClass = 'expiry-never';
        expiryText = 'Навсегда';
    } else if (user.dateExpiry === "Скрыто") {
        expiryClass = 'expiry-date';
        expiryText = 'Скрытая дата';
    } else if (isUserExpired) {
        expiryClass = 'expiry-never';
        expiryText = 'Истекла';
    } else if (typeof daysUntilExpiry === 'number') {
        expiryClass = 'expiry-date';
        if (daysUntilExpiry <= 7) {
            expiryClass = 'expiry-never';
            expiryText = `Осталось ${daysUntilExpiry} дн.`;
        } else {
            expiryText = `Осталось ${daysUntilExpiry} дн.`;
        }
    }

    const statusNote = user.statusNote ? ` <small>${user.statusNote}</small>` : '';

    return `
        <div class="user-card" data-status="${user.status}">
            <div class="status-badge status-${user.status}">
                ${getStatusText(user.status)}
            </div>
            <div class="user-header">
                <div class="user-avatar">${getInitials(user.username)}</div>
                <div class="user-info">
                    <h3>${user.username}</h3>
                    <div class="user-id">ID: ${user.id} | Блок ID: ${user.blockId}</div>
                </div>
            </div>
            <div class="restriction-info">
                <div class="restriction-type">${user.restrictionType}${statusNote}</div>
                <div class="restriction-reason">${user.reason}</div>
                <div class="restriction-date">${user.fullDate}</div>
                <div class="expiry-info">
                    <div class="${expiryClass}">Статус: ${expiryText}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Отображает список пользователей на странице
 * @param {Array} users - Массив пользователей для отображения
 */
function renderUsers(users) {
    const usersGrid = document.getElementById('usersGrid');
    const noResults = document.getElementById('noResults');
    
    if (users.length === 0) {
        usersGrid.style.display = 'none';
        noResults.style.display = 'block';
    } else {
        usersGrid.style.display = 'grid';
        noResults.style.display = 'none';
        usersGrid.innerHTML = users.map(createUserCard).join('');
    }
}

/**
 * Обновляет статистику на панели
 */
function updateStats() {
    const stats = {
        blocked: usersData.filter(u => u.status === 'blocked').length,
        restricted: usersData.filter(u => u.status === 'restricted').length,
        warning: usersData.filter(u => u.status === 'warning').length,
        soft_blocked: usersData.filter(u => u.status === 'soft_blocked').length,
        total: usersData.length
    };
    
    document.getElementById('totalBlocked').textContent = stats.blocked;
    document.getElementById('totalRestricted').textContent = stats.restricted;
    document.getElementById('totalWarning').textContent = stats.warning;
    document.getElementById('totalSoftBlocked').textContent = stats.soft_blocked;
    document.getElementById('totalUsers').textContent = stats.total;
}

/**
 * Фильтрует и отображает пользователей по текущим критериям
 */
function filterUsers() {
    let filtered = [...usersData];
    
    // Фильтр по статусу
    if (currentFilter !== 'all') {
        filtered = filtered.filter(user => user.status === currentFilter);
    }
    
    // Поиск по имени пользователя, ID, блок ID или другим полям
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(user => 
            user.username.toLowerCase().includes(searchTerm) || 
            user.id.toLowerCase().includes(searchTerm) ||
            user.blockId.toLowerCase().includes(searchTerm) ||
            user.reason.toLowerCase().includes(searchTerm) ||
            user.restrictionType.toLowerCase().includes(searchTerm)
        );
    }
    
    filteredUsers = filtered;
    renderUsers(filteredUsers);
}

/**
 * Устанавливает активный фильтр
 * @param {string} filter - Новый активный фильтр
 */
function setActiveFilter(filter) {
    // Удаляем активный класс у всех кнопок
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Добавляем активный класс нужной кнопке
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    currentFilter = filter;
}

/**
 * Очищает поле поиска
 */
function clearSearch() {
    document.getElementById('searchInput').value = '';
}

/**
 * Инициализация обработчиков событий
 */
function initEventListeners() {
    // Обработчик поиска
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', filterUsers);
    
    // Обработчик Enter в поле поиска
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterUsers();
        }
    });
    
    // Обработчики кнопок фильтра
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const filter = e.target.dataset.filter;
            setActiveFilter(filter);
            filterUsers();
        });
    });
}

/**
 * Инициализация приложения
 */
function initApp() {
    console.log('Crystalforge Web Services - Просмотр действующих наказаний');
    console.log(`Загружено пользователей: ${usersData.length}`);
    
    // Инициализация обработчиков
    initEventListeners();
    
    // Обновление статистики
    updateStats();
    
    // Первоначальное отображение всех пользователей
    renderUsers(usersData);
    
    console.log('Приложение успешно инициализировано');
}

/**
 * Функция для добавления нового пользователя (для будущего расширения)
 * @param {Object} userData - Данные нового пользователя
 */
function addUser(userData) {
    const newUser = {
        id: userData.id || `USR${String(usersData.length + 1).padStart(3, '0')}`,
        blockId: userData.blockId || String(usersData.length + 1).padStart(4, '0'),
        username: userData.username,
        status: userData.status || 'warning',
        restrictionType: userData.restrictionType,
        reason: userData.reason,
        dateReceived: userData.dateReceived || new Date().toLocaleDateString('ru-RU'),
        dateExpiry: userData.dateExpiry || 'Неопределено',
        fullDate: userData.fullDate || `Получено ${userData.dateReceived || new Date().toLocaleDateString('ru-RU')}, снято будет ${userData.dateExpiry || 'Неопределено'}`
    };
    
    usersData.push(newUser);
    updateStats();
    filterUsers();
    
    console.log('Добавлен новый пользователь:', newUser);
}

/**
 * Функция для удаления пользователя (для будущего расширения)
 * @param {string} userId - ID пользователя для удаления
 */
function removeUser(userId) {
    const index = usersData.findIndex(user => user.id === userId);
    if (index !== -1) {
        const removedUser = usersData.splice(index, 1)[0];
        updateStats();
        filterUsers();
        console.log('Удален пользователь:', removedUser);
        return true;
    }
    return false;
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);

// Экспорт функций для возможного использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        usersData,
        addUser,
        removeUser,
        filterUsers,
        updateStats
    };
}
