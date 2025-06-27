const db = require('../firestore');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register user
async function registerUser(req, res) {
  const { name, email, password } = req.body;
  // Check if user exists
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();
  if (!snapshot.empty) {
    return res.status(400).json({ message: 'User already exists' });
  }
  await usersRef.add({ name, email, password }); // Hash password in production!
  res.json({ message: 'User registered' });
}

// Login user
async function loginUser(req, res) {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();
  if (snapshot.empty) {
    console.log('No user found for email:', email);
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const userDoc = snapshot.docs[0];
  const user = userDoc.data();
  console.log('User found:', user);
  if (user.password !== password) {
    console.log('Password mismatch:', user.password, password);
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: userDoc.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET || 'schoolzy_jwt_secret',
    { expiresIn: '7d' }
  );

  res.json({ message: 'Login successful', token, user: { ...user, id: userDoc.id } });
}

// Get user by email
async function getUserByEmail(email) {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();
  if (!snapshot.empty) {
    return snapshot.docs[0].data();
  }
  return null;
}

// Get user profile
function getProfile(req, res) {
  db.get('SELECT id, name, email, profile_picture, role, created_at FROM users WHERE id = ?', 
    [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error.' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  });
}

// Update user profile
function updateProfile(req, res) {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }
  db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', 
    [name, email, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error updating profile.' });
    }
    res.json({ message: 'Profile updated successfully.' });
  });
}

// Update user profile (with picture upload)
function updateProfileWithPicture(req, res) {
  const { name, email } = req.body;
  let profile_picture = req.user.profile_picture;
  if (req.file) {
    // Save the uploaded file path
    profile_picture = `/uploads/${req.file.filename}`;
  }
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }
  db.run('UPDATE users SET name = ?, email = ?, profile_picture = ? WHERE id = ?', 
    [name, email, profile_picture, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error updating profile.' });
    }
    res.json({ message: 'Profile updated successfully.', profile_picture });
  });
}

// Delete user account
function deleteAccount(req, res) {
  db.run('DELETE FROM users WHERE id = ?', [req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting account.' });
    }
    res.json({ message: 'Account deleted successfully.' });
  });
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