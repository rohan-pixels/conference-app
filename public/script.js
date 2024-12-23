// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAkxYi05Z2-_iFCsL1heSnrVV77Z-9dhDQ",
    authDomain: "1:332019788420:web:ff31b1e24eaccc1f7130d1.firebaseapp.com",
    projectId: "conference-data-60d66",
    storageBucket: "conference-data-60d66.firebasestorage.app",
    messagingSenderId: "332019788420",
    appId: "1:332019788420:web:ff31b1e24eaccc1f7130d1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Register Event Handler
document.getElementById('registrationForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const gender = document.getElementById('gender').value;
    const phone = document.getElementById('phone').value.trim();
    const dob = document.getElementById('dob').value.trim();

    if (!name || !email || !password) {
        document.getElementById('register-message').textContent = 'Please fill all required fields.';
        document.getElementById('register-message').style.color = 'red';
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user details to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name,
            email,
            gender,
            phone,
            dob,
            uid: user.uid
        });

        document.getElementById('register-message').textContent = 'Registration successful!';
        document.getElementById('register-message').style.color = 'green';

        sessionStorage.setItem('user', JSON.stringify({ name, email, gender, phone, dob }));
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
    } catch (error) {
        console.error('Registration error:', error);
        document.getElementById('register-message').textContent = error.message;
        document.getElementById('register-message').style.color = 'red';
    }
});

// Login Event Handler
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        sessionStorage.setItem('user', JSON.stringify({ email }));
        document.getElementById('login-message').textContent = 'Login successful!';
        document.getElementById('login-message').style.color = 'green';

        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('login-message').textContent = error.message;
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
document.addEventListener('DOMContentLoaded', function () {
    const user = sessionStorage.getItem('user');
    if (user && window.location.pathname === '/dashboard') {
        const userDetails = JSON.parse(user);
        const dashboardContent = `
            <div class="user-details-box">
                <h2>Welcome, ${userDetails.name || 'User'}</h2>
                <p>Email: ${userDetails.email}</p>
                <p>Gender: ${userDetails.gender || 'Not provided'}</p>
                <p>Phone: ${userDetails.phone || 'Not provided'}</p>
                <p>Date of Birth: ${userDetails.dob || 'Not provided'}</p>
            </div>
            <button id="logoutBtn">Logout</button>
        `;
        document.getElementById('dashboard').innerHTML = dashboardContent;

        document.getElementById('logoutBtn').addEventListener('click', async function () {
            try {
                await signOut(auth);
                sessionStorage.removeItem('user');
                window.location.href = '/';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    } else if (!user && window.location.pathname === '/dashboard') {
        window.location.href = '/';
    }
});
