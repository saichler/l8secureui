// Layer 8 Ecosystem - Main Application Coordinator
// Manages tabs and communication between embedded apps (Users, Roles)

// Login page URL
const LOGIN_URL = 'login/index.html';

// Authentication token (set externally via setBearerToken or from localStorage)
let bearerToken = localStorage.getItem('bearerToken') || null;

// Check authentication and redirect to login if needed
function checkAuthentication() {
    if (!bearerToken) {
        window.location.href = LOGIN_URL;
        return false;
    }
    return true;
}

// Set bearer token for API authentication
function setBearerToken(token) {
    bearerToken = token;
    if (token) {
        localStorage.setItem('bearerToken', token);
    } else {
        localStorage.removeItem('bearerToken');
    }
    // Update all embedded iframes
    updateIframeTokens();
}

// Logout and redirect to login
function logout() {
    localStorage.removeItem('bearerToken');
    localStorage.removeItem('rememberedUser');
    window.location.href = LOGIN_URL;
}

// Update bearer token in all embedded iframes
function updateIframeTokens() {
    const usersIframe = document.getElementById('users-iframe');
    if (usersIframe && usersIframe.contentWindow && usersIframe.contentWindow.UsersApp) {
        usersIframe.contentWindow.UsersApp.setBearerToken(bearerToken);
    }

    const rolesIframe = document.getElementById('roles-iframe');
    if (rolesIframe && rolesIframe.contentWindow && rolesIframe.contentWindow.RolesApp) {
        rolesIframe.contentWindow.RolesApp.setBearerToken(bearerToken);
    }

    const credentialsIframe = document.getElementById('credentials-iframe');
    if (credentialsIframe && credentialsIframe.contentWindow && credentialsIframe.contentWindow.CredentialsApp) {
        credentialsIframe.contentWindow.CredentialsApp.setBearerToken(bearerToken);
    }

    const targetsIframe = document.getElementById('targets-iframe');
    if (targetsIframe && targetsIframe.contentWindow && targetsIframe.contentWindow.TargetsApp) {
        targetsIframe.contentWindow.TargetsApp.setBearerToken(bearerToken);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication first
    if (!checkAuthentication()) {
        return;
    }

    initTabs();
    setupIframeHandlers();
});

// Tab switching
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Setup iframe load handlers
function setupIframeHandlers() {
    const usersIframe = document.getElementById('users-iframe');
    const rolesIframe = document.getElementById('roles-iframe');
    const credentialsIframe = document.getElementById('credentials-iframe');

    if (usersIframe) {
        usersIframe.addEventListener('load', function() {
            if (bearerToken && usersIframe.contentWindow && usersIframe.contentWindow.UsersApp) {
                usersIframe.contentWindow.UsersApp.setBearerToken(bearerToken);
                usersIframe.contentWindow.UsersApp.refreshData();
            }
        });
    }

    if (rolesIframe) {
        rolesIframe.addEventListener('load', function() {
            if (bearerToken && rolesIframe.contentWindow && rolesIframe.contentWindow.RolesApp) {
                rolesIframe.contentWindow.RolesApp.setBearerToken(bearerToken);
                rolesIframe.contentWindow.RolesApp.refreshData();
                // Set callback for when roles change
                rolesIframe.contentWindow.RolesApp.setOnRolesChanged(onRolesChanged);
            }
        });
    }

    if (credentialsIframe) {
        credentialsIframe.addEventListener('load', function() {
            if (bearerToken && credentialsIframe.contentWindow && credentialsIframe.contentWindow.CredentialsApp) {
                credentialsIframe.contentWindow.CredentialsApp.setBearerToken(bearerToken);
                credentialsIframe.contentWindow.CredentialsApp.refreshData();
            }
        });
    }

    const targetsIframe = document.getElementById('targets-iframe');
    if (targetsIframe) {
        targetsIframe.addEventListener('load', function() {
            if (bearerToken && targetsIframe.contentWindow && targetsIframe.contentWindow.TargetsApp) {
                targetsIframe.contentWindow.TargetsApp.setBearerToken(bearerToken);
                targetsIframe.contentWindow.TargetsApp.refreshData();
            }
        });
    }
}

// Called when roles change - refresh users to update role assignments display
function onRolesChanged(roles) {
    const usersIframe = document.getElementById('users-iframe');
    if (usersIframe && usersIframe.contentWindow && usersIframe.contentWindow.UsersApp) {
        usersIframe.contentWindow.UsersApp.refreshData();
    }
}

// Refresh all data in embedded apps
function refreshAllData() {
    const usersIframe = document.getElementById('users-iframe');
    if (usersIframe && usersIframe.contentWindow && usersIframe.contentWindow.UsersApp) {
        usersIframe.contentWindow.UsersApp.refreshData();
    }

    const rolesIframe = document.getElementById('roles-iframe');
    if (rolesIframe && rolesIframe.contentWindow && rolesIframe.contentWindow.RolesApp) {
        rolesIframe.contentWindow.RolesApp.refreshData();
    }

    const credentialsIframe = document.getElementById('credentials-iframe');
    if (credentialsIframe && credentialsIframe.contentWindow && credentialsIframe.contentWindow.CredentialsApp) {
        credentialsIframe.contentWindow.CredentialsApp.refreshData();
    }

    const targetsIframe = document.getElementById('targets-iframe');
    if (targetsIframe && targetsIframe.contentWindow && targetsIframe.contentWindow.TargetsApp) {
        targetsIframe.contentWindow.TargetsApp.refreshData();
    }
}

// Toast notification system (for main app messages)
function showToast(message, type, duration) {
    if (type === undefined) type = 'error';
    if (duration === undefined) duration = 5000;

    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        error: '!',
        success: '\u2713',
        warning: '\u26A0'
    };

    const titles = {
        error: 'Error',
        success: 'Success',
        warning: 'Warning'
    };

    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.error}</div>
        <div class="toast-content">
            <div class="toast-title">${titles[type] || titles.error}</div>
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        <button class="toast-close" onclick="dismissToast(this.parentElement)">&times;</button>
    `;

    container.appendChild(toast);

    if (duration > 0) {
        setTimeout(function() { dismissToast(toast); }, duration);
    }

    return toast;
}

function dismissToast(toast) {
    if (!toast || toast.classList.contains('removing')) return;
    toast.classList.add('removing');
    setTimeout(function() { toast.remove(); }, 300);
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// Export for external use
if (typeof window !== 'undefined') {
    window.MainApp = {
        setBearerToken: setBearerToken,
        refreshAllData: refreshAllData,
        getToken: function() { return bearerToken; },
        logout: logout
    };
}
