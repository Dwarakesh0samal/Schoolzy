const db = require('../firestore');
const schoolController = require('./schoolController');
const { FieldValue } = require('firebase-admin').firestore;

// Get reviews for a specific school
const getReviewsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const snapshot = await db.collection('reviews')
      .where('schoolId', '==', schoolId)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    res.json({
      reviews: paginatedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(reviews.length / limit),
        totalReviews: reviews.length,
        hasNext: endIndex < reviews.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error loading reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create a new review
const createReview = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { rating, review_text } = req.body;
    const userId = req.user.id;

    // Check if user already reviewed this school
    const existingReview = await db.collection('reviews')
      .where('schoolId', '==', schoolId)
      .where('userId', '==', userId)
      .get();

    if (!existingReview.empty) {
      return res.status(400).json({ message: 'You have already reviewed this school' });
    }

    // Get user info
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    const reviewData = {
      schoolId,
      userId,
      user_name: userData.name,
      user_profile_picture: userData.profile_picture || '',
      rating: parseInt(rating),
      review_text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('reviews').add(reviewData);

    // Update school's average rating
    await updateSchoolRating(schoolId);

    res.status(201).json({ 
      message: 'Review created successfully',
      id: docRef.id,
      review: { id: docRef.id, ...reviewData }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review_text } = req.body;
    const userId = req.user.id;

    const docRef = db.collection('reviews').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const reviewData = doc.data();
    if (reviewData.userId !== userId) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    const updateData = {
      rating: parseInt(rating),
      review_text,
      updatedAt: new Date().toISOString()
    };

    await docRef.update(updateData);

    // Update school's average rating
    await updateSchoolRating(reviewData.schoolId);

    res.json({ 
      message: 'Review updated successfully',
      id,
      review: { id, ...reviewData, ...updateData }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const docRef = db.collection('reviews').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const reviewData = doc.data();
    if (reviewData.userId !== userId) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await docRef.delete();

    // Update school's average rating
    await updateSchoolRating(reviewData.schoolId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user's reviews
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const snapshot = await db.collection('reviews')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    res.json({
      reviews: paginatedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(reviews.length / limit),
        totalReviews: reviews.length,
        hasNext: endIndex < reviews.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error loading user reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to update school's average rating
const updateSchoolRating = async (schoolId) => {
  try {
    const reviewsSnapshot = await db.collection('reviews')
      .where('schoolId', '==', schoolId)
      .get();

    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    
    if (reviews.length === 0) {
      await db.collection('schools').doc(schoolId).update({
        averageRating: 0,
        reviewCount: 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await db.collection('schools').doc(schoolId).update({
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error('Error updating school rating:', error);
  }
};

module.exports = {
  getReviewsBySchool,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews
}; 