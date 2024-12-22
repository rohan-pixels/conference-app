// 1️⃣ Import Required Packages
const express = require('express');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const path = require('path');
const session = require('express-session'); // Import express-session for session management

// 2️⃣ Load Environment Variables from .env
dotenv.config();

// 3️⃣ Load Firebase Service Account Key
const serviceAccount = require('./conference-data-60d66-firebase-adminsdk-kpwkp-da20f757ec.json');

// 4️⃣ Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

// 5️⃣ Get Firestore Database Reference
const db = admin.firestore();

// 6️⃣ Create Express Server
const app = express();
const PORT = process.env.PORT || 3000;

// 7️⃣ Middleware to Parse Requests and Serve Static Files
app.use(express.static(path.join(__dirname, 'public'))); // Serve files from the 'public' folder
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 8️⃣ Set up Session Management
app.use(session({
    secret: 'your-secret-key', // A secret key for session encryption
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use 'secure: true' if you're using HTTPS
}));

// 🛠️ Route to Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🛠️ Route to Register User
app.post('/add-user', async (req, res) => {
    const { name, email, gender, phone, dob, password } = req.body;

    try {
        // Check if the email is already registered
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return res.status(400).json({ message: 'Email is already registered!' });
        }

        // Create a new user in Firebase Auth
        const userRecord = await admin.auth().createUser({ email, password });

        // Save user details in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            name,
            email,
            gender,
            phone,
            dob,
        });

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Failed to register user.', error: error.message });
    }
});

// 🛠️ Route to Login User
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verify the user's credentials using Firebase Authentication
        const userRecord = await admin.auth().getUserByEmail(email);

        // Check if the password is correct
        const isValidPassword = await verifyPassword(userRecord.uid, password); // Implement password verification (you may need to handle this using custom logic)

        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid login credentials!' });
        }

        // Store user session data
        req.session.user = { uid: userRecord.uid, email: userRecord.email };

        // Send a response back to the client
        res.status(200).json({ message: 'Login successful!', user: req.session.user });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Login failed!', error: error.message });
    }
});

// 🛠️ Route to Check Login Status
app.get('/check-session', (req, res) => {
    if (req.session.user) {
        return res.status(200).json({ loggedIn: true, user: req.session.user });
    }
    res.status(200).json({ loggedIn: false });
});

// 🛠️ Route to Logout User
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed!' });
        }
        res.status(200).json({ message: 'Logged out successfully!' });
    });
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Helper function to verify password (this might need to be adjusted for your logic)
async function verifyPassword(uid, password) {
    try {
        // Implement the password verification logic (Firebase Auth does not directly provide password comparison functionality)
        // You can use Firebase's built-in authentication features, or handle this using custom authentication methods.
        return true; // Placeholder: Replace this with actual password verification logic
    } catch (error) {
        console.error('Password verification error:', error);
        return false;
    }
}
