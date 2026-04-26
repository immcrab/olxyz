// Devlog System for OwenLee.XYZ
// Handles admin creation, notifications, and side panel

const DEVLOG_ADMIN_EMAILS = ['imcrabfr@gmail.com', 'olee018@stpaul.k12.mn.us'];
const DEVLOG_STORAGE_KEY = 'owenlee_devlogs';
const DEVLOG_VIEWED_KEY = 'owenlee_devlogs_viewed';
const REDIRECT_URL = 'https://404.owenlee.xyz';

// Initialize devlog system
function initDevlog() {
    loadDevlogs();
    checkForNewDevlogs();
}

// Load devlogs from localStorage
function loadDevlogs() {
    const stored = localStorage.getItem(DEVLOG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Save devlogs to localStorage
function saveDevlogs(devlogs) {
    localStorage.setItem(DEVLOG_STORAGE_KEY, JSON.stringify(devlogs));
}

// Get viewed devlog IDs
function getViewedDevlogs() {
    const stored = localStorage.getItem(DEVLOG_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Mark a devlog as viewed
function markDevlogViewed(id) {
    const viewed = getViewedDevlogs();
    if (!viewed.includes(id)) {
        viewed.push(id);
        localStorage.setItem(DEVLOG_VIEWED_KEY, JSON.stringify(viewed));
    }
}

// Check if user is admin
function isAdminEmail(email) {
    return DEVLOG_ADMIN_EMAILS.includes(email.toLowerCase());
}

// Check for new devlogs and show notification
function checkForNewDevlogs() {
    const devlogs = loadDevlogs();
    const viewed = getViewedDevlogs();
    
    // Find unviewed devlogs
    const newDevlogs = devlogs.filter(d => !viewed.includes(d.id));
    
    if (newDevlogs.length > 0) {
        showDevlogNotification(newDevlogs[0]);
    }
}

// Show devlog notification popup
function showDevlogNotification(devlog) {
    // Remove existing notification
    const existing = document.getElementById('devlog-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'devlog-notification';
    notification.innerHTML = `
        <div class="devlog-notif-content">
            <div class="devlog-notif-header">
                <span>📝 New Devlog!</span>
                <button onclick="closeDevlogNotification()">✕</button>
            </div>
            <div class="devlog-notif-body">
                <h4>${escapeHtml(devlog.title)}</h4>
                <p>${escapeHtml(devlog.description)}</p>
                <small>${formatDate(devlog.date)}</small>
            </div>
            <button class="devlog-notif-btn" onclick="openDevlogPanel()">View All Devlogs</button>
        </div>
    `;
    
    // Add styles
    addDevlogNotificationStyles();
    document.body.appendChild(notification);
    
    // Mark as viewed
    markDevlogViewed(devlog.id);
}

// Close notification
function closeDevlogNotification() {
    const notification = document.getElementById('devlog-notification');
    if (notification) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }
}

// Add notification styles
function addDevlogNotificationStyles() {
    if (document.getElementById('devlog-notif-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'devlog-notif-styles';
    styles.textContent = `
        #devlog-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-family: 'Lilita One', sans-serif;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .devlog-notif-content {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 2px solid #c5ffea;
            border-radius: 15px;
            padding: 0;
            max-width: 350px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(197,255,234,0.2);
        }
        .devlog-notif-header {
            background: #c5ffea;
            color: #1a1a1a;
            padding: 12px 15px;
            border-radius: 13px 13px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 1rem;
        }
        .devlog-notif-header button {
            background: none;
            border: none;
            color: #1a1a1a;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
        .devlog-notif-body {
            padding: 15px;
            color: #fff;
        }
        .devlog-notif-body h4 {
            margin: 0 0 8px 0;
            color: #c5ffea;
            font-size: 1.1rem;
        }
        .devlog-notif-body p {
            margin: 0 0 8px 0;
            font-size: 0.9rem;
            color: #ccc;
            line-height: 1.4;
        }
        .devlog-notif-body small {
            color: #666;
            font-size: 0.75rem;
        }
        .devlog-notif-btn {
            width: 100%;
            padding: 12px;
            background: #c5ffea;
            color: #1a1a1a;
            border: none;
            border-radius: 0 0 13px 13px;
            font-family: 'Lilita One', sans-serif;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .devlog-notif-btn:hover {
            background: #fff;
        }
    `;
    document.head.appendChild(styles);
}

// Open devlog side panel
function openDevlogPanel() {
    closeDevlogNotification();
    
    // Remove existing panel
    const existing = document.getElementById('devlog-panel-overlay');
    if (existing) {
        existing.remove();
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'devlog-panel-overlay';
    
    const devlogs = loadDevlogs();
    const viewed = getViewedDevlogs();
    
    overlay.innerHTML = `
        <div class="devlog-panel">
            <div class="devlog-panel-header">
                <h2>📝 Dev Logs</h2>
                <button onclick="closeDevlogPanel()">✕</button>
            </div>
            <div class="devlog-panel-content">
                ${devlogs.length === 0 ? '<p class="no-devlogs">No devlogs yet!</p>' : ''}
                ${devlogs.map(d => `
                    <div class="devlog-item ${viewed.includes(d.id) ? 'viewed' : 'new'}">
                        <div class="devlog-item-header">
                            <h3>${escapeHtml(d.title)}</h3>
                            ${!viewed.includes(d.id) ? '<span class="new-badge">NEW</span>' : ''}
                        </div>
                        <p>${escapeHtml(d.description)}</p>
                        <small>${formatDate(d.date)}</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    addDevlogPanelStyles();
    document.body.appendChild(overlay);
    
    // Mark all as viewed when panel opens
    devlogs.forEach(d => markDevlogViewed(d.id));
}

// Close devlog panel
function closeDevlogPanel() {
    const overlay = document.getElementById('devlog-panel-overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
    }
}

// Add panel styles
function addDevlogPanelStyles() {
    if (document.getElementById('devlog-panel-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'devlog-panel-styles';
    styles.textContent = `
        #devlog-panel-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 9999;
            display: flex;
            justify-content: flex-end;
            animation: fadeIn 0.3s ease;
            font-family: 'Lilita One', sans-serif;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        .devlog-panel {
            width: 100%;
            max-width: 400px;
            background: #1a1a1a;
            border-left: 2px solid #c5ffea;
            height: 100%;
            overflow-y: auto;
            animation: slideInRight 0.3s ease;
        }
        @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        .devlog-panel-header {
            background: #c5ffea;
            color: #1a1a1a;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
        }
        .devlog-panel-header h2 {
            margin: 0;
            font-size: 1.5rem;
        }
        .devlog-panel-header button {
            background: none;
            border: none;
            color: #1a1a1a;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
        .devlog-panel-content {
            padding: 20px;
        }
        .no-devlogs {
            color: #666;
            text-align: center;
            padding: 40px 0;
        }
        .devlog-item {
            background: #252525;
            border: 2px solid #333;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
            transition: all 0.2s ease;
        }
        .devlog-item.new {
            border-color: #c5ffea;
            box-shadow: 0 0 15px rgba(197,255,234,0.2);
        }
        .devlog-item.viewed {
            opacity: 0.7;
        }
        .devlog-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .devlog-item-header h3 {
            margin: 0;
            color: #c5ffea;
            font-size: 1.1rem;
        }
        .new-badge {
            background: #c5ffea;
            color: #1a1a1a;
            padding: 3px 8px;
            border-radius: 5px;
            font-size: 0.7rem;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .devlog-item p {
            color: #ccc;
            font-size: 0.9rem;
            margin: 0 0 8px 0;
            line-height: 1.4;
        }
        .devlog-item small {
            color: #666;
            font-size: 0.75rem;
        }
    `;
    document.head.appendChild(styles);
}

// Add devlog button to nav (call this after auth loads)
function addDevlogButtonToNav() {
    // Try to find existing nav-bar
    let navBar = document.querySelector('.nav-bar');
    
    // If no nav-bar, create one
    if (!navBar) {
        navBar = document.createElement('div');
        navBar.className = 'nav-bar';
        navBar.style.cssText = 'position: fixed; top: 20px; right: 20px; display: flex; gap: 10px; z-index: 1000;';
        document.body.appendChild(navBar);
    }
    
    // Check if button already exists
    if (document.getElementById('devlogBtn')) return;
    
    const btn = document.createElement('button');
    btn.id = 'devlogBtn';
    btn.className = 'auth-btn';
    btn.textContent = '📝 Dev Logs';
    btn.onclick = openDevlogPanel;
    navBar.appendChild(btn);
}

// Helper: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper: Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export for use in other scripts
window.DevlogSystem = {
    init: initDevlog,
    loadDevlogs,
    saveDevlogs,
    isAdminEmail,
    addDevlogButtonToNav,
    openDevlogPanel,
    closeDevlogPanel
};