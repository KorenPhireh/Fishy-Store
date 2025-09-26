// Global Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = this.getStoredUsers();
        this.init();
    }
    
    init() {
        const savedUser = localStorage.getItem('brainrot_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
        if (document.getElementById('user-greeting')) {
            this.updateUI();
        }
        this.setupForms();
        this.setupProfileDropdown();
    }
    
    getStoredUsers() {
        const defaultUsers = [
            { id: 1, username: 'admin', password: 'brainrot123', email: 'admin@brainrot.com', role: 'admin' },
            { id: 2, username: 'customer', password: 'password123', email: 'customer@example.com', role: 'customer' }
        ];
        const storedUsers = JSON.parse(localStorage.getItem('brainrot_users'));
        return storedUsers || defaultUsers;
    }
    
    setupForms() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        const showRegister = document.getElementById('show-register');
        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }
    }
    
    showRegisterForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('show-register').style.display = 'none';
        this.clearAuthMessage();
    }
    
    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const user = this.users.find(u => u.username === username && u.password === password);
        if (user) {
            this.login(user);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            this.showAuthMessage('Invalid username or password', 'error');
        }
    }
    
    handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        if (password !== confirmPassword) {
            this.showAuthMessage('Passwords do not match', 'error');
            return;
        }
        if (this.users.find(u => u.username === username)) {
            this.showAuthMessage('Username already exists', 'error');
            return;
        }
        const newUser = {
            id: this.users.length + 1,
            username,
            email,
            password,
            role: 'customer'
        };
        this.users.push(newUser);
        localStorage.setItem('brainrot_users', JSON.stringify(this.users));
        this.login(newUser);
        this.showAuthMessage('Registration successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
    
    login(user) {
        this.currentUser = user;
        localStorage.setItem('brainrot_current_user', JSON.stringify(user));
        this.updateUI();
        this.showAuthMessage(`Welcome back, ${user.username}!`, 'success');
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('brainrot_current_user');
        this.updateUI();
        this.showAuthMessage('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
    
    updateUI() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userGreeting = document.getElementById('user-greeting');
        const adminPanelLink = document.getElementById('admin-panel-link');
        const profileIcon = document.getElementById('profile-icon');
        const profileDropdown = document.getElementById('profile-dropdown');
        if (this.currentUser) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userGreeting) {
                userGreeting.textContent = `Welcome, ${this.currentUser.username}`;
                userGreeting.style.color = '#667eea';
                userGreeting.style.fontWeight = 'bold';
            }
            if (this.currentUser.role === 'admin' && adminPanelLink) {
                adminPanelLink.style.display = 'block';
            } else if (adminPanelLink) {
                adminPanelLink.style.display = 'none';
            }
            if (profileIcon) {
                profileIcon.style.display = 'block';
                profileIcon.textContent = this.currentUser.username.charAt(0).toUpperCase();
            }
            if (profileDropdown) {
                const usernameSpan = profileDropdown.querySelector('.username');
                const emailSpan = profileDropdown.querySelector('.email');
                if (usernameSpan) usernameSpan.textContent = this.currentUser.username;
                if (emailSpan) emailSpan.textContent = this.currentUser.email;
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userGreeting) {
                userGreeting.textContent = 'Welcome, Guest';
                userGreeting.style.color = '#ccc';
                userGreeting.style.fontWeight = 'normal';
            }
            if (adminPanelLink) adminPanelLink.style.display = 'none';
            if (profileIcon) profileIcon.style.display = 'none';
            if (profileDropdown) profileDropdown.classList.remove('show');
        }
    }
    
    setupProfileDropdown() {
        const profileIcon = document.getElementById('profile-icon');
        const profileDropdown = document.getElementById('profile-dropdown');
        if (profileIcon && profileDropdown) {
            profileIcon.addEventListener('click', () => {
                profileDropdown.classList.toggle('show');
            });
            document.addEventListener('click', (e) => {
                if (!profileIcon.contains(e.target) && !profileDropdown.contains(e.target)) {
                    profileDropdown.classList.remove('show');
                }
            });
        }
    }
    
    showAuthMessage(message, type) {
        const messageDiv = document.getElementById('auth-message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `auth-message ${type}`;
            messageDiv.style.display = 'block';
        }
    }
    
    clearAuthMessage() {
        const messageDiv = document.getElementById('auth-message');
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }
    }
    
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    sendReceipt(order) {
        if (this.currentUser && this.currentUser.email) {
            console.log(`Receipt sent to ${this.currentUser.email} for order ${order.id}`);
        }
    }
}

const auth = new AuthSystem();

function logout() {
    auth.logout();
}

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => auth.logout());
    }
});