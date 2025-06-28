const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

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

module.exports = router; 