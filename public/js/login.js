
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Google login handler
    const googleBtn = document.querySelector('.google-btn');
    googleBtn.addEventListener('click', () => {
        // Redirect to Google auth route
        window.location.href = 'http://localhost:3000/auth/google';
    });

    // Tab switching functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const selectedTab = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            loginForm.classList.remove('active');
            registerForm.classList.remove('active');
            tab.classList.add('active');
            if (selectedTab === 'login') {
                loginForm.classList.add('active');
            } else {
                registerForm.classList.add('active');
            }
        });
    });

    // Login form submission
    const loginButton = loginForm.querySelector('button[type="submit"]');
    loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email')?.value;
        const password = document.getElementById('login-password').value;

        if (email === '' || password === '') {
            alert('Please enter both email and password.');
        } else {
            loginUser(email, password);
        }
    });

    async function loginUser(email, password) {
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Login successful!');
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = '../index.html';
            } else {
                alert(data.error || 'Login failed.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Something went wrong. Please try again.');
        }
    }

    // Register form submission
    const registerButton = registerForm.querySelector('button[type="submit"]');
    registerButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-username').value;
        const email = document.getElementById('register-email')?.value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (!name || !email || !password || !confirmPassword) {
            alert('All fields are required.');
        } else if (password !== confirmPassword) {
            alert('Passwords do not match.');
        } else {
            try {
                const response = await fetch('/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Registration successful!');
                    loginForm.classList.add('active');
                    registerForm.classList.remove('active');
                    tabs[0].classList.add('active');
                    tabs[1].classList.remove('active');
                } else {
                    alert(data.error || 'Registration failed.');
                }
            } catch (error) {
                console.error('Error during registration:', error);
                alert('Something went wrong. Please try again.');
            }
        }
    });
});
