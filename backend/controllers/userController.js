const db = require('../firestore');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user
async function registerUser(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userDoc = await usersRef.add({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      created_at: new Date(),
      profile_picture: ''
    });
    res.json({ message: 'User registered', id: userDoc.id });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
}

// Login user
async function loginUser(req, res) {
  // Log the received request body
  console.log('LOGIN REQ BODY:', req.body);
  const { email, password } = req.body;

  // Fallback demo login
  if (email === 'demo@schoolzy.com' && password === 'demo123') {
    const demoUser = {
      id: 'demo12345',
      name: 'Demo User',
      email: 'demo@schoolzy.com',
      role: 'user'
    };
    const token = jwt.sign(
      {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role
      },
      process.env.JWT_SECRET || 'schoolzy_jwt_secret',
      { expiresIn: '1d' }
    );
    return res.status(200).json({ user: demoUser, token });
  }

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const usersRef = db.collection('users');
    let snapshot;
    try {
      snapshot = await usersRef.where('email', '==', email).get();
      // Log Firestore snapshot
      console.log('USER SNAPSHOT EMPTY:', snapshot.empty);
      if (!snapshot.empty) {
        console.log('USER DATA:', snapshot.docs[0].data());
      }
    } catch (firestoreErr) {
      console.error('FIRESTORE ERROR:', firestoreErr);
      return res.status(500).json({ message: 'Firestore error', error: firestoreErr.message || firestoreErr });
    }
    if (snapshot.empty) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    // Log password hashes being compared
    console.log('HASHED PASSWORD IN DB:', user.password);
    console.log('PASSWORD ENTERED:', password);
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
      console.log('BCRYPT COMPARE RESULT:', isMatch);
    } catch (bcryptErr) {
      console.error('BCRYPT ERROR:', bcryptErr);
    }
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      {
        id: userDoc.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        profile_picture: user.profile_picture || ''
      },
      process.env.JWT_SECRET || 'schoolzy_jwt_secret',
      { expiresIn: '7d' }
    );
    res.json({ message: 'Login successful', token, user: { ...user, id: userDoc.id } });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Login failed', error: err.message || err });
  }
}

// Get user by email
async function getUserByEmail(email) {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
  return null;
}

// Get user profile
async function getProfile(req, res) {
  try {
    const userRef = db.collection('users').doc(req.user.id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const user = userDoc.data();
    res.json({ id: userDoc.id, name: user.name, email: user.email, profile_picture: user.profile_picture, role: user.role, created_at: user.created_at });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
}

// Update user profile
async function updateProfile(req, res) {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }
  try {
    const userRef = db.collection('users').doc(req.user.id);
    await userRef.update({ name, email });
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
}

// Update user profile (with picture upload)
async function updateProfileWithPicture(req, res) {
  const { name, email } = req.body;
  let profile_picture = req.user.profile_picture;
  if (req.file) {
    profile_picture = `/uploads/${req.file.filename}`;
  }
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }
  try {
    const userRef = db.collection('users').doc(req.user.id);
    await userRef.update({ name, email, profile_picture });
    res.json({ message: 'Profile updated successfully.', profile_picture });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
}

// Delete user account
async function deleteAccount(req, res) {
  try {
    const userRef = db.collection('users').doc(req.user.id);
    await userRef.delete();
    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting account.' });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserByEmail,
  getProfile,
  updateProfile,
  updateProfileWithPicture,
  deleteAccount
}; 