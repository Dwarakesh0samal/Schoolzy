const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const fetch = require('node-fetch');

// All admin routes require authentication and admin role
router.use(auth);
router.use(isAdmin);

// Dashboard statistics
router.get('/dashboard', adminController.getDashboardStats);

// School management
router.get('/schools', adminController.getAllSchools);
router.post('/schools', adminController.createSchool);
router.put('/schools/:id', adminController.updateSchool);
router.delete('/schools/:id', adminController.deleteSchool);

// Review management
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', adminController.deleteReview);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// System management
router.get('/system/health', adminController.getSystemHealth);
router.post('/system/seed', adminController.seedData);

router.get('/api/geocode', async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: 'City required' });
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&email=support@schoolzy.com`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SchoolzyMapApp/1.0 (support@schoolzy.com)',
        'Accept-Language': 'en'
      }
    });
    const data = await response.json();
    res.set('Cache-Control', 'no-store');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

module.exports = router; 