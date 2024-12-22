// Import dependencies
const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Initialize Firebase Admin SDK with service account credentials
admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json')),
    databaseURL: 'https://your-project-id.firebaseio.com'
});

// Initialize Express
const app = express();

// Middleware to parse JSON data
app.use(bodyParser.json());

// Firebase Firestore reference
const db = admin.firestore();

// POST route to save additional user data after registration
app.post('/register', async (req, res) => {
    try {
        const { name, email, gender, phone, dob } = req.body;

        // Create a new user document in Firestore
        const userRef = db.collection('users').doc(email);
        await userRef.set({
            name: name,
            email: email,
            gender: gender,
            phone: phone,
            dob: dob,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).send({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send({ error: 'Failed to register user.' });
    }
});

// POST route to login (you can customize the login logic here)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Use Firebase Admin SDK to authenticate the user (server-side logic if needed)
        // Note: Firebase Admin SDK doesn't provide client-side functionality like password authentication. It's recommended to handle login on the frontend via Firebase Auth.

        res.status(200).send({ message: 'Login successful!' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({ error: 'Failed to log in user.' });
    }
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
