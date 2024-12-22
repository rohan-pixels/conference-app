
const auth = firebase.auth();
const db = firebase.firestore();

// Register Event Handler
document.getElementById('registrationForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent form reload

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const gender = document.getElementById('gender').value;
    const phone = document.getElementById('phone').value;
    const dob = document.getElementById('dob').value;
    const password = document.getElementById('password').value;

    try {
        // Create a new user with Firebase Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Store additional user info in Firestore (not shown here, but you can do it similarly to the previous example)
        // For simplicity, we're only registering the user for now

        // Show success message
        document.getElementById('register-message').textContent = 'User registered successfully!';
        document.getElementById('register-message').style.color = 'green';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('register-message').textContent = error.message;
        document.getElementById('register-message').style.color = 'red';
    }
});

// Login Event Handler
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent form reload

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        // Sign in with Firebase Authentication
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Session handling - you can store user info in sessionStorage or localStorage for persistence
        sessionStorage.setItem('user', JSON.stringify(user));

        // Show success message
        document.getElementById('login-message').textContent = 'Login successful!';
        document.getElementById('login-message').style.color = 'green';

        // Hide login form and show logout button
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('login-message').textContent = error.message;
        document.getElementById('login-message').style.color = 'red';
    }
});

// Logout Event Handler
document.getElementById('logout-btn').addEventListener('click', async function () {
    try {
        await auth.signOut();
        sessionStorage.removeItem('user');

        // Hide logout button and show login form again
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('login-container').style.display = 'block';

        document.getElementById('login-message').textContent = 'You have logged out successfully!';
        document.getElementById('login-message').style.color = 'green';
    } catch (error) {
        console.error('Error:', error);
    }
});

// Check if user is logged in
window.addEventListener('load', function () {
    const user = sessionStorage.getItem('user');
    if (user) {
        // If user is logged in, show logout button and hide login form
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
    }
});
