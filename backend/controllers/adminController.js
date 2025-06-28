const db = require('../firestore');

// Get all users (admin)
async function getAllUsers(req, res) {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    const users = snapshot.docs.map(doc => doc.data());
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users.', error: err.message });
  }
}

// Get admin dashboard statistics
async function getDashboardStats(req, res) {
  try {
    const [schoolsSnapshot, usersSnapshot, reviewsSnapshot] = await Promise.all([
      db.collection('schools').get(),
      db.collection('users').get(),
      db.collection('reviews').get()
    ]);

    const stats = {
      totalSchools: schoolsSnapshot.size,
      totalUsers: usersSnapshot.size,
      totalReviews: reviewsSnapshot.size,
      averageSchoolRating: 0,
      recentActivity: []
    };

    // Calculate average school rating
    if (schoolsSnapshot.size > 0) {
      const totalRating = schoolsSnapshot.docs.reduce((sum, doc) => {
        const data = doc.data();
        return sum + (data.averageRating || 0);
      }, 0);
      stats.averageSchoolRating = Math.round((totalRating / schoolsSnapshot.size) * 10) / 10;
    }

    // Get recent reviews for activity feed
    const recentReviews = reviewsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    stats.recentActivity = recentReviews;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

// Update user role (admin only)
async function updateUserRole(req, res) {
  const { userId } = req.params;
  const { role } = req.body;
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({ role });
    if (role === 'admin') {
      await db.collection('admins').doc(userId).set({});
    } else {
      await db.collection('admins').doc(userId).delete();
    }
    res.json({ message: 'User role updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user role.', error: err.message });
  }
}

// Delete user (admin only)
async function deleteUser(req, res) {
  const { userId } = req.params;
  try {
    // Delete user's reviews
    const reviewsRef = db.collection('reviews').where('userId', '==', userId);
    const reviewsSnapshot = await reviewsRef.get();
    const batch = db.batch();
    reviewsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    // Delete from admins
    const adminRef = db.collection('admins').doc(userId);
    batch.delete(adminRef);
    // Delete the user
    const userRef = db.collection('users').doc(userId);
    batch.delete(userRef);
    await batch.commit();
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user.', error: err.message });
  }
}

// Get recent activity (registrations and reviews)
async function getRecentActivity(req, res) {
  try {
    // Recent user registrations (last 10)
    const usersSnapshot = await db.collection('users').orderBy('created_at', 'desc').limit(10).get();
    const registrations = usersSnapshot.docs.map(doc => ({
      type: 'user_registration',
      name: doc.data().name,
      email: doc.data().email,
      timestamp: doc.data().created_at ? doc.data().created_at.toDate().toISOString() : null
    }));
    // Recent reviews (last 10)
    const reviewsSnapshot = await db.collection('reviews').orderBy('created_at', 'desc').limit(10).get();
    const reviews = reviewsSnapshot.docs.map(doc => ({
      type: 'review',
      rating: doc.data().rating,
      review_text: doc.data().review_text,
      userId: doc.data().userId,
      schoolId: doc.data().schoolId,
      timestamp: doc.data().created_at ? doc.data().created_at.toDate().toISOString() : null
    }));
    // Combine and sort by timestamp
    const activity = [...registrations, ...reviews].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching activity.', error: err.message });
  }
}

// Get all admins
async function getAdmins(req, res) {
  try {
    const adminsRef = db.collection('admins');
    const adminsSnapshot = await adminsRef.get();
    const admins = adminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admins.', error: err.message });
  }
}

// Remove admin privileges
async function removeAdmin(req, res) {
  const { adminId } = req.params;
  try {
    const adminRef = db.collection('admins').doc(adminId);
    await adminRef.delete();
    res.json({ message: 'Admin privileges removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing admin privileges.', error: err.message });
  }
}

// Get all schools (admin view)
const getAllSchools = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const snapshot = await db.collection('schools').get();
    
    const schools = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSchools = schools.slice(startIndex, endIndex);

    res.json({
      schools: paginatedSchools,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(schools.length / limit),
        totalSchools: schools.length,
        hasNext: endIndex < schools.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching schools',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create school (admin)
const createSchool = async (req, res) => {
  try {
    const schoolData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      averageRating: 0,
      reviewCount: 0
    };

    const docRef = await db.collection('schools').add(schoolData);
    res.status(201).json({ 
      message: 'School created successfully',
      id: docRef.id,
      school: { id: docRef.id, ...schoolData }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating school',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update school (admin)
const updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const docRef = db.collection('schools').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'School not found' });
    }

    await docRef.update(updateData);
    res.json({ 
      message: 'School updated successfully',
      id,
      school: { id, ...updateData }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating school',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete school (admin)
const deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('schools').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Delete associated reviews
    const reviewsSnapshot = await db.collection('reviews')
      .where('schoolId', '==', id)
      .get();
    
    const deletePromises = reviewsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    // Delete the school
    await docRef.delete();
    res.json({ message: 'School and associated reviews deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting school',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all reviews (admin view)
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const snapshot = await db.collection('reviews')
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
      message: 'Error fetching reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete review (admin)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('reviews').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const reviewData = doc.data();
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

// Get system health
const getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error checking system health',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Seed data
const seedData = async (req, res) => {
  try {
    const { seedSchools, seedUsers } = require('../seedData');
    
    if (seedSchools) await seedSchools();
    if (seedUsers) await seedUsers();
    
    res.json({ message: 'Data seeded successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error seeding data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to update school rating
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
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    });
  } catch (error) {
    console.error('Error updating school rating:', error);
  }
};

module.exports = {
  getAllUsers,
  getDashboardStats,
  updateUserRole,
  deleteUser,
  getRecentActivity,
  getAdmins,
  removeAdmin,
  getAllSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  getAllReviews,
  deleteReview,
  getSystemHealth,
  seedData
}; 