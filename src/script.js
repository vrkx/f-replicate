document.addEventListener('DOMContentLoaded', () => {
    // --- APP STATE & CONFIG ---
    let appSettings = {};
    let translations = {};
    let pingIntervalId = null;
    const ICONS = {
        home: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
         shop:       '<img src="./imgs/icons/shop.png">',
        servers: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>',
        settings: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
        wifi: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>'
    };

    // --- DOM ELEMENTS ---
    const mainAppScreen = document.getElementById('main-app-screen');
    const setupModal = document.getElementById('setup-screen-modal');
    const finishSetupBtn = document.getElementById('finish-setup-btn');
    const sidebarProfileName = document.getElementById('sidebar-username');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageContents = document.querySelectorAll('.page-content');
    const newsContainer = document.getElementById('news-container');
    const serverListContainer = document.getElementById('server-list-container');
    const languageSelect = document.getElementById('language-select');
    const themeSwatches = document.querySelectorAll('.theme-swatch');
    const UserS = document.getElementById('UserSName');
    const saveUsernameBtn = document.getElementById('save-username-btn');
    const startupCheckbox = document.getElementById('startup-checkbox');
    const resetAppBtn = document.getElementById('reset-app-btn');
    const refreshPingsBtn = document.getElementById('refresh-pings-btn');
    const pingIntervalSelect = document.getElementById('ping-interval-select');

    // --- SETTINGS MANAGEMENT ---
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('appSettings')) || {};
        appSettings = {
            username: settings.username || null,
            theme: settings.theme || 'dark',
            language: settings.language || 'en',
            pingInterval: settings.pingInterval || 10000,
            startup: settings.startup || false
        };
    }

    function saveSettings() {
        localStorage.setItem('appSettings', JSON.stringify(appSettings));
    }

    // --- INITIALIZATION ---
    async function initialize() {
        loadSettings();
        await loadLanguage(appSettings.language);
        updateUIFromSettings();

        if (appSettings.username) {
            mainAppScreen.style.visibility = 'visible';
            setupModal.style.display = 'none';
            fetchNews();
            pingAllServers();
            startPingInterval();
        } else {
            mainAppScreen.style.visibility = 'hidden';
            setupModal.style.display = 'flex';
            document.querySelector('.theme-swatch[data-theme="dark"]').classList.add('active'); // Default active swatch in setup
        }
        addNavEventListeners();
    }
    
    // --- UI UPDATES ---
    function updateUIFromSettings() {
        document.documentElement.setAttribute('data-theme', appSettings.theme);
        themeSwatches.forEach(swatch => swatch.classList.toggle('active', swatch.dataset.theme === appSettings.theme));
        languageSelect.value = appSettings.language;
        pingIntervalSelect.value = appSettings.pingInterval;
        startupCheckbox.checked = appSettings.startup;
        UserS.textContent = appSettings.username;
        if (appSettings.username) {
            sidebarProfileName.textContent = appSettings.username;
            document.querySelector('.welcome-header h1').textContent = `${translations.welcome_message || 'Welcome'}! ${appSettings.username}`;
        }
    }
    
    function buildSidebar() {
        document.querySelector('.sidebar ul').innerHTML = `
            <li><a href="#" class="nav-link active" data-page="home">${ICONS.home}<span data-i18n="home">${translations.home || 'Home'}</span></a></li>
              <li><a href="#" class="nav-link active" data-page="shop">${ICONS.shop}<span data-i18n="shop">${translations.shop || 'Shop'}</span></a></li>
            <li><a href="#" class="nav-link" data-page="servers">${ICONS.servers}<span data-i18n="servers">${translations.servers || 'Servers'}</span></a></li>
            <li><a href="#" class="nav-link" data-page="settings">${ICONS.settings}<span data-i18n="settings">${translations.settings || 'Settings'}</span></a></li>
        `;
        addNavEventListeners();
    }

    // --- DATA & CORE FUNCTIONALITY ---
    async function pingAllServers() {
        const response = await fetch('./data/servers.json');
        const servers = await response.json();
        if (serverListContainer.innerHTML === '') { // First time loading
             servers.forEach(server => {
                 serverListContainer.innerHTML += `
                    <div class="server-item" id="server-${server.Name}">
                    
                        <span>${server.Name}</span>
                        
                        <span style="font-size: 14px;">${server.ServerAddress}</span>
                        <div class="server-item-info">
                            <div class="ping-spinner"></div>
                            <span class="ping"></span>
                        </div>
                    </div>`;
             });
        }
        
        servers.forEach(server => {
            const serverElement = document.getElementById(`server-${server.Name}`);
            const pingElement = serverElement.querySelector('.ping');
            const spinnerElement = serverElement.querySelector('.ping-spinner');
            spinnerElement.style.display = 'block';
            pingElement.textContent = '';

            window.chrome.webview.hostObjects.controller.PingServer(server.ServerAddress).then(ping => {
                spinnerElement.style.display = 'none';
                if (ping >= 0) {
                    pingElement.textContent = `${ping} ms`;
                    pingElement.className = 'ping';
                    if (ping < 50) pingElement.classList.add('good');
                    else if (ping < 100) pingElement.classList.add('medium');
                    else pingElement.classList.add('bad');
                } else {
                    pingElement.textContent = 'Error';
                    pingElement.className = 'ping error';
                }
            });
        });
    }

    function startPingInterval() {
        if (pingIntervalId) clearInterval(pingIntervalId);
        if (appSettings.pingInterval > 0) {
            pingIntervalId = setInterval(pingAllServers, appSettings.pingInterval);
        }
    }

    async function fetchNews() {
        try {
            const response = await fetch('./data/news.json');
            const newsItems = await response.json();
            newsContainer.innerHTML = newsItems.map(item => `
                <div class="news-item" style="background-color: ${item.color}; height: ${item.height}">
                    ${ICONS[item.icon] || ''}
                    <div><h2>${item.title}</h2><p>${item.content}</p></div>
                </div>`).join('') || `<div class="no-news">${translations.no_news}</div>`;
        } catch (error) {
            newsContainer.innerHTML = `<div class="no-news">${translations.no_news}</div>`;
        }
    }

    async function loadLanguage(lang) {
        try {
            const response = await fetch(`./data/${lang}.json`);
            translations = await response.json();
            appSettings.language = lang;
            buildSidebar();
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.dataset.i18n;
                if (translations[key]) el.textContent = translations[key];
            });
            updateUIFromSettings(); // Re-apply username to welcome message
        } catch (error) { console.error('Failed to load language'); }
    }

    // --- EVENT LISTENERS ---
    function addNavEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.dataset.page;
                document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
                link.classList.add('active');
                document.querySelectorAll('.page-content').forEach(page => {
                    page.classList.toggle('active', page.id === `${pageId}-page`);
                });
            });
        });
    }
    
    finishSetupBtn.addEventListener('click', () => {
        const username = document.getElementById('username-input').value.trim();
        if (username) {
            appSettings.username = username;
            saveSettings();
            initialize();
        } else {
            alert('Please enter a username.');
        }
    });

    themeSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            appSettings.theme = swatch.dataset.theme;
            updateUIFromSettings();
            saveSettings();
        });
    });

    languageSelect.addEventListener('change', () => { loadLanguage(languageSelect.value).then(saveSettings); });
    
    pingIntervalSelect.addEventListener('change', () => {
        appSettings.pingInterval = parseInt(pingIntervalSelect.value);
        saveSettings();
        startPingInterval();
    });

    saveUsernameBtn.addEventListener('click', () => {
        const newUsername = document.getElementById('username-settings-input').value.trim();
        if(newUsername) {
            appSettings.username = newUsername;
            saveSettings();
            updateUIFromSettings();
            alert('Username updated!');
        }
    });
    
    startupCheckbox.addEventListener('change', () => {
        appSettings.startup = startupCheckbox.checked;
        saveSettings();
        window.chrome.webview.hostObjects.controller.SetStartup(appSettings.startup);
    });
    
    resetAppBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to clear all app data? The app will restart.')) {
            localStorage.clear();
            window.location.reload();
        }

        
    });

    refreshPingsBtn.addEventListener('click', pingAllServers);



    // --- START APP ---
    initialize();
});


