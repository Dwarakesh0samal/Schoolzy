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
    const stats = {};
    // Total users
    const usersSnapshot = await db.collection('users').get();
    stats.totalUsers = usersSnapshot.docs.length;
    // Total schools
    const schoolsSnapshot = await db.collection('schools').get();
    stats.totalSchools = schoolsSnapshot.docs.length;
    // Total reviews
    const reviewsSnapshot = await db.collection('reviews').get();
    stats.totalReviews = reviewsSnapshot.docs.length;
    // Average school rating
    const ratedSchools = schoolsSnapshot.docs.map(doc => doc.data().rating).filter(r => typeof r === 'number');
    const totalRatings = ratedSchools.reduce((a, b) => a + b, 0);
    stats.averageRating = ratedSchools.length ? totalRatings / ratedSchools.length : 0;
    // Recent reviews (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentReviews = reviewsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.created_at && data.created_at.toDate() >= weekAgo;
    });
    stats.recentReviews = recentReviews.length;
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard stats.', error: err.message });
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

module.exports = {
  getAllUsers,
  getDashboardStats,
  updateUserRole,
  deleteUser,
  getRecentActivity,
  getAdmins,
  removeAdmin
}; 