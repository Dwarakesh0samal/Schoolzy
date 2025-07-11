const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const auth = require('../middleware/auth');
const { validateSchoolData } = require('../middleware/validation');
const fetch = require('node-fetch');

// Public geocoding endpoint for map search
router.get('/geocode', async (req, res) => {
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

// Public routes
router.get('/', schoolController.getAllSchools);
router.get('/:id', schoolController.getSchoolById);
router.get('/:id/reviews', schoolController.getSchoolReviews);

// Protected routes (require authentication)
router.post('/', auth, validateSchoolData, schoolController.createSchool);
router.put('/:id', auth, validateSchoolData, schoolController.updateSchool);
router.delete('/:id', auth, schoolController.deleteSchool);

// Search and filter routes
router.get('/search/location', schoolController.searchByLocation);
router.get('/search/name', schoolController.searchByName);
router.get('/search/city', schoolController.searchByCity);
router.get('/filter/category/:category', schoolController.filterByCategory);
router.get('/filter/type/:type', schoolController.filterByType);

module.exports = router; 