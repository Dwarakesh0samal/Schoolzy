const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Public routes
router.get('/', schoolController.getAllSchools);
router.get('/nearby', schoolController.getSchoolsNearby);
router.get('/:id', schoolController.getSchoolById);

// Protected routes (admin only)
router.post('/', auth, isAdmin, schoolController.createSchool);
router.put('/:id', auth, isAdmin, schoolController.updateSchool);
router.delete('/:id', auth, isAdmin, schoolController.deleteSchool);

module.exports = router; 