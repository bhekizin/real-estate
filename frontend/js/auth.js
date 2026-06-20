// Login form handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');
        errorEl.classList.remove('show');
        btn.disabled = true;
        btn.textContent = 'Signing in...';

        try {
            const data = await apiPost('/auth/login', {
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                userId: data.userId
            }));

            // Redirect based on role
            if (data.role === 'ADMIN') {
                window.location.href = 'admin.html';
            } else if (data.role === 'AGENT') {
                window.location.href = 'agent-dashboard.html';
            } else {
                window.location.href = '../index.html';
            }
        } catch (err) {
            errorEl.textContent = err.message || 'Invalid email or password';
            errorEl.classList.add('show');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    });
}

// Register form handler
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('register-error');
        const successEl = document.getElementById('register-success');
        const btn = document.getElementById('register-btn');
        errorEl.classList.remove('show');
        successEl.classList.remove('show');

        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;

        if (password !== confirm) {
            errorEl.textContent = 'Passwords do not match';
            errorEl.classList.add('show');
            return;
        }

        if (password.length < 6) {
            errorEl.textContent = 'Password must be at least 6 characters';
            errorEl.classList.add('show');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Creating account...';

        try {
            await apiPost('/auth/register', {
                firstName: document.getElementById('reg-firstname').value,
                lastName: document.getElementById('reg-lastname').value,
                email: document.getElementById('reg-email').value,
                phone: document.getElementById('reg-phone').value,
                password: password,
                role: document.getElementById('reg-role').value
            });

            successEl.textContent = 'Account created successfully! Redirecting to login...';
            successEl.classList.add('show');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (err) {
            errorEl.textContent = err.message || 'Registration failed. Please try again.';
            errorEl.classList.add('show');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });
}

// Role selection
function selectRole(el) {
    document.querySelectorAll('.role-option').forEach(r => r.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('reg-role').value = el.dataset.role;
}
