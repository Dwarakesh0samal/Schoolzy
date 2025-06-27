const db = require('../firestore');
const schoolController = require('./schoolController');
const { FieldValue } = require('firebase-admin').firestore;

// Get reviews for a school
async function getReviewsForSchool(req, res) {
  const { schoolId } = req.params;
  try {
    const reviewsRef = db.collection('reviews');
    const snapshot = await reviewsRef.where('schoolId', '==', schoolId).orderBy('createdAt', 'desc').get();
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews.' });
  }
}

// Get user's reviews
async function getUserReviews(req, res) {
  const userId = req.user.id;
  try {
    const reviewsRef = db.collection('reviews');
    const snapshot = await reviewsRef.where('userId', '==', userId).orderBy('createdAt', 'desc').get();
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user reviews.' });
  }
}

// Add a review
async function addReview(req, res) {
  try {
    const schoolId = req.params.schoolId;
    const userId = req.user.id;
    const { rating, review_text } = req.body;
    const userName = req.user.name || '';
    const userProfilePicture = req.user.profile_picture || '';
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }
    await db.collection('reviews').add({
      schoolId,
      userId,
      user_name: userName,
      user_profile_picture: userProfilePicture,
      rating,
      review_text,
      createdAt: new Date().toISOString()
    });
    await schoolController.updateSchoolRating(schoolId);
    res.json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review.' });
  }
}

// Update a review
async function updateReview(req, res) {
  const { reviewId } = req.params;
  const { rating, review_text } = req.body;
  const userId = req.user.id;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }
  try {
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();
    if (!reviewDoc.exists || reviewDoc.data().userId !== userId) {
      return res.status(404).json({ message: 'Review not found or unauthorized.' });
    }
    await reviewRef.update({
      rating,
      review_text,
      updatedAt: new Date().toISOString()
    });
    await schoolController.updateSchoolRating(reviewDoc.data().schoolId);
    res.json({ message: 'Review updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review.' });
  }
}

// Delete a review
async function deleteReview(req, res) {
  const { reviewId } = req.params;
  const userId = req.user.id;
  try {
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();
    if (!reviewDoc.exists || reviewDoc.data().userId !== userId) {
      return res.status(404).json({ message: 'Review not found or unauthorized.' });
    }
    const schoolId = reviewDoc.data().schoolId;
    await reviewRef.delete();
    await schoolController.updateSchoolRating(schoolId);
    res.json({ message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review.' });
  }
}

// Get all reviews (admin only)
async function getAllReviews(req, res) {
  const { page = 1, limit = 20 } = req.query;
  const limitNum = parseInt(limit);
  const offset = (page - 1) * limitNum;
  try {
    const reviewsRef = db.collection('reviews').orderBy('createdAt', 'desc');
    const snapshot = await reviewsRef.get();
    let reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Pagination
    reviews = reviews.slice(offset, offset + limitNum);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews.' });
  }
}

// Delete review (admin only)
async function adminDeleteReview(req, res) {
  const { reviewId } = req.params;
  try {
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();
    if (!reviewDoc.exists) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    const schoolId = reviewDoc.data().schoolId;
    await reviewRef.delete();
    await schoolController.updateSchoolRating(schoolId);
    res.json({ message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review.' });
  }
}

module.exports = {
  getReviewsForSchool,
  getUserReviews,
  addReview,
  updateReview,
  deleteReview,
  getAllReviews,
  adminDeleteReview
}; 