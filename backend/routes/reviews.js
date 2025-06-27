const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// Public routes
router.get('/school/:schoolId', reviewController.getReviewsForSchool);

// Protected routes
router.get('/user', auth, reviewController.getUserReviews);
router.post('/school/:schoolId', auth, reviewController.addReview);
router.put('/:reviewId', auth, reviewController.updateReview);
router.delete('/:reviewId', auth, reviewController.deleteReview);

// Admin routes
router.get('/', auth, isAdmin, reviewController.getAllReviews);
router.delete('/admin/:reviewId', auth, isAdmin, reviewController.adminDeleteReview);

module.exports = router; 