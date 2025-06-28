const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const auth = require('../middleware/auth');
const { validateSchoolData } = require('../middleware/validation');

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
router.get('/filter/category/:category', schoolController.filterByCategory);
router.get('/filter/type/:type', schoolController.filterByType);

module.exports = router; 