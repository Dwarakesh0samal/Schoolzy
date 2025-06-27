require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./firestore');
const authRoutes = require('./routes/auth');

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// --- User Registration ---
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, profile_picture, bio } = req.body;
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: 'User already exists' });
    }
    await db.collection('users').add({
      name,
      email,
      password, // Hash in production!
      profile_picture: profile_picture || '',
      bio: bio || '',
      createdAt: new Date().toISOString(),
      role: 'user'
    });
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user.' });
  }
});

// --- Get All Schools ---
app.get('/api/schools', async (req, res) => {
  try {
    const snapshot = await db.collection('schools').get();
    const schools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(schools);
  } catch (error) {
    res.status(500).json({ message: 'Error loading schools.' });
  }
});

// --- Get a single school by ID ---
app.get('/api/schools/:id', async (req, res) => {
  try {
    const doc = await db.collection('schools').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: 'Error loading school details.' });
  }
});

// --- Get Reviews for a School ---
app.get('/api/reviews/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const snapshot = await db.collection('reviews').where('schoolId', '==', schoolId).orderBy('createdAt', 'desc').get();
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error loading reviews.' });
  }
});

// --- Add a Review ---
app.post('/api/reviews/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { userId, user_name, user_profile_picture, rating, review_text } = req.body;
    await db.collection('reviews').add({
      schoolId,
      userId,
      user_name,
      user_profile_picture,
      rating,
      review_text,
      createdAt: new Date().toISOString()
    });
    res.json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review.' });
  }
});

app.use('/api/auth', authRoutes);

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 