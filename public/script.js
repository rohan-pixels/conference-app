// Register Event Handler
document.getElementById('registrationForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the form from reloading the page

    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value.trim(),
        dob: document.getElementById('dob').value.trim(),
        password: document.getElementById('password').value.trim(),
    };

    // Validate form data
    if (!formData.name || !formData.email || !formData.password) {
        document.getElementById('register-message').textContent = 'Please fill all required fields.';
        document.getElementById('register-message').style.color = 'red';
        return;
    }

    try {
        const response = await fetch('/add-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('register-message').textContent = data.message;
            document.getElementById('register-message').style.color = 'green';
            sessionStorage.setItem('user', JSON.stringify(data.user));
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000); // Redirect after a delay
        } else {
            document.getElementById('register-message').textContent = data.message || 'Registration failed.';
            document.getElementById('register-message').style.color = 'red';
        }
    } catch (error) {
        console.error('Registration error:', error);
        document.getElementById('register-message').textContent = 'Server error, please try again.';
        document.getElementById('register-message').style.color = 'red';
    }
});

// Login Event Handler
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the form from reloading the page

    const loginData = {
        email: document.getElementById('login-email').value.trim(),
        password: document.getElementById('login-password').value.trim(),
    };

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem('user', JSON.stringify(data.user));
            document.getElementById('login-message').textContent = 'Login successful!';
            document.getElementById('login-message').style.color = 'green';
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000); // Redirect after a delay
        } else {
            document.getElementById('login-message').textContent = data.message || 'Login failed.';
            document.getElementById('login-message').style.color = 'red';
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('login-message').textContent = 'Server error, please try again.';
        document.getElementById('login-message').style.color = 'red';
    }
});

// Redirect if user is already logged in
window.addEventListener('load', function () {
    const user = sessionStorage.getItem('user');
    if (user) {
        if (window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard';
        }
    }
});

// Dashboard
document.addEventListener('DOMContentLoaded', async function () {
    const user = sessionStorage.getItem('user');
    if (user) {
        try {
            const response = await fetch('/dashboard');
            const data = await response.json();

            if (response.ok) {
                const userDetails = `
                    <div class="user-details-box">
                        <h2>Welcome, ${data.name}</h2>
                        <p>Email: ${data.email}</p>
                        <p>Gender: ${data.gender}</p>
                        <p>Phone: ${data.phone}</p>
                        <p>Date of Birth: ${data.dob}</p>
                    </div>
                    <button id="logoutBtn">Logout</button>
                `;
                document.getElementById('dashboard').innerHTML = userDetails;

                document.getElementById('logoutBtn').addEventListener('click', async function () {
                    try {
                        const logoutResponse = await fetch('/logout');
                        if (logoutResponse.ok) {
                            sessionStorage.removeItem('user');
                            window.location.href = '/';
                        }
                    } catch (error) {
                        console.error('Logout error:', error);
                    }
                });
            } else {
                console.error('Error fetching dashboard data:', data.message);
            }
        } catch (error) {
            console.error('Dashboard error:', error);
        }
    } else if (window.location.pathname === '/dashboard') {
        window.location.href = '/';
    }
});
