const express = require('express');
const passport = require('passport');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { validateRegistrationData, validateLoginData } = require('../middleware/validation');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const token = require('jsonwebtoken').sign(
      {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role || 'user',
        profile_picture: req.user.profile_picture || ''
      },
      process.env.JWT_SECRET || 'schoolzy_jwt_secret',
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`/?token=${token}`);
  }
);

// Manual authentication routes with validation
router.post('/register', validateRegistrationData, userController.registerUser);
router.post('/login', validateLoginData, userController.loginUser);

// Protected routes
router.get('/me', auth, userController.getProfile);
router.put('/profile', auth, upload.single('profile_picture'), userController.updateProfileWithPicture);
router.delete('/account', auth, userController.deleteAccount);

// Logout route
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Check authentication status
router.get('/status', auth, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      profile_picture: req.user.profile_picture,
      role: req.user.role
    }
  });
});

module.exports = router; 