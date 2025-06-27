const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// All routes require admin authentication
router.use(auth, isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);
router.get('/activity', adminController.getSystemActivity);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

// Admin management
router.get('/admins', adminController.getAdminList);
router.delete('/admins/:adminId', adminController.removeAdmin);

module.exports = router; 