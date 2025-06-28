const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');
// const isAdmin = require('../middleware/isAdmin'); // Moved to admin routes
const { validateReviewData } = require('../middleware/validation');

// Public routes
router.get('/school/:schoolId', reviewController.getReviewsBySchool);

// Protected routes (require authentication)
router.get('/user/me', auth, reviewController.getUserReviews);
router.post('/school/:schoolId', auth, validateReviewData, reviewController.createReview);
router.put('/:id', auth, validateReviewData, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);

// Admin routes - MOVED TO /api/admin/reviews
// router.get('/', auth, isAdmin, reviewController.getAllReviews);
// router.delete('/admin/:reviewId', auth, isAdmin, reviewController.adminDeleteReview);

module.exports = router; 