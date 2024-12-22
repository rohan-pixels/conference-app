// Register Event Handler
document.getElementById('registrationForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the form from reloading the page

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value,
        dob: document.getElementById('dob').value,
        password: document.getElementById('password').value,
    };

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
        } else {
            document.getElementById('register-message').textContent = data.message || 'Something went wrong!';
            document.getElementById('register-message').style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('register-message').textContent = 'Error connecting to the server.';
        document.getElementById('register-message').style.color = 'red';
    }
});

// Login Event Handler
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the form from reloading the page

    const loginData = {
        email: document.getElementById('login-email').value,
        password: document.getElementById('login-password').value
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
            window.location.href = '/dashboard';  // Redirect to dashboard
        } else {
            document.getElementById('login-message').textContent = data.message || 'Invalid login credentials!';
            document.getElementById('login-message').style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('login-message').textContent = 'Error connecting to the server.';
        document.getElementById('login-message').style.color = 'red';
    }
});

// Check if user is already logged in (Session Persistence)
window.addEventListener('load', function() {
    const user = sessionStorage.getItem('user');
    if (user) {
        window.location.href = '/dashboard'; // Redirect if already logged in
    }
});

// Dashboard - Load user data and display in neat box
document.addEventListener('DOMContentLoaded', async function() {
    const user = sessionStorage.getItem('user');
    if (user) {
        try {
            const response = await fetch('/dashboard');
            const data = await response.json();

            if (response.ok) {
                // Display user details in a neat box on the dashboard
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

                // Logout button functionality
                document.getElementById('logoutBtn').addEventListener('click', async function() {
                    try {
                        const logoutResponse = await fetch('/logout');
                        const logoutData = await logoutResponse.json();

                        if (logoutResponse.ok) {
                            sessionStorage.removeItem('user'); // Clear session storage
                            window.location.href = '/';  // Redirect to registration page
                        } else {
                            console.error('Error logging out:', logoutData.message);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
                });
            } else {
                console.error('Error fetching user details:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        window.location.href = '/'; // Redirect to registration page if not logged in
    }
});
