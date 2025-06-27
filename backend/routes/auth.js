const express = require('express');
const passport = require('passport');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// Manual authentication routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, upload.single('profile_picture'), userController.updateProfileWithPicture);
router.delete('/account', auth, userController.deleteAccount);

// Logout
// router.get('/logout', (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       return res.status(500).json({ message: 'Error logging out.' });
//     }
//     res.json({ message: 'Logged out successfully.' });
//   });
// });

// Check authentication status
// router.get('/status', (req, res) => {
//   if (req.isAuthenticated()) {
//     res.json({
//       authenticated: true,
//       user: {
//         id: req.user.id,
//         name: req.user.name,
//         email: req.user.email,
//         profile_picture: req.user.profile_picture,
//         role: req.user.role
//       }
//     });
//   } else {
//     res.json({ authenticated: false });
//   }
// });

// Get current user info (for frontend after login)
router.get('/me', auth, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role
  });
});

module.exports = router; 