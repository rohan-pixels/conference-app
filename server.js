// Import Required Packages
const express = require('express');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const path = require('path');
const session = require('express-session');

// Load Environment Variables from .env
dotenv.config();

// Load Firebase Service Account Key
const serviceAccount = require('./conference-data-60d66-firebase-adminsdk-kpwkp-da20f757ec.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});

// Get Firestore Database Reference
const db = admin.firestore();

// Create Express Server
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to Parse Requests and Serve Static Files
app.use(express.static(path.join(__dirname, 'public'))); // Serve files from the 'public' folder
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Session Management
app.use(
    session({
        secret: 'your-secret-key', // A secret key for session encryption
        resave: false,
        saveUninitialized: false, // Avoid creating empty sessions
        cookie: { secure: false, httpOnly: true }, // Set secure:true if using HTTPS
    }),
);

// Route to Serve index.html (Registration Page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to Register User
app.post('/add-user', async (req, res) => {
    const { name, email, gender, phone, dob, password } = req.body;

    try {
        const userRecord = await admin.auth().createUser({ email, password });

        await db.collection('users').doc(userRecord.uid).set({
            name,
            email,
            gender,
            phone,
            dob,
        });

        res.status(201).json({ message: 'User registered successfully!', user: { name, email, gender, phone, dob } });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Failed to register user.', error: error.message });
    }
});

// Route to Login User
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Authenticate the user with Firebase Authentication
        const user = await admin.auth().getUserByEmail(email);

        // Simulate password verification (replace this with your Firebase Authentication logic)
        const isValidPassword = password === 'test'; // Replace with secure password verification
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid login credentials!' });
        }

        req.session.user = { uid: user.uid, email: user.email };
        res.status(200).json({ message: 'Login successful!', user: req.session.user });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Login failed!', error: error.message });
    }
});

// Route to Check Login Status
app.get('/check-session', (req, res) => {
    if (req.session.user) {
        return res.status(200).json({ loggedIn: true, user: req.session.user });
    }
    res.status(200).json({ loggedIn: false });
});

// Route to Logout User
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed!' });
        }
        res.status(200).json({ message: 'Logged out successfully!' });
    });
});

// Route to Serve Dashboard Page with User Data
app.get('/dashboard', async (req, res) => {
    if (req.session.user) {
        try {
            const userRef = db.collection('users').doc(req.session.user.uid);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                res.json(userDoc.data());
            } else {
                res.status(404).json({ message: 'User not found!' });
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            res.status(500).json({ message: 'Error fetching user details.', error: error.message });
        }
    } else {
        res.status(401).json({ message: 'User not logged in!' });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
