const db = require('../firestore');

// Get all schools
async function getAllSchools(req, res) {
  const schoolsRef = db.collection('schools');
  const snapshot = await schoolsRef.get();
  const schools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(schools);
}

// Add a school
async function addSchool(req, res) {
  const { name, location, category } = req.body;
  await db.collection('schools').add({ name, location, category });
  res.json({ message: 'School added' });
}

// Update the average rating for a school
async function updateSchoolRating(schoolId) {
  const reviewsRef = db.collection('reviews');
  const snapshot = await reviewsRef.where('schoolId', '==', schoolId).get();
  const reviews = snapshot.docs.map(doc => doc.data());
  if (reviews.length === 0) {
    await db.collection('schools').doc(schoolId).update({ averageRating: null, reviewCount: 0 });
    return;
  }
  const total = reviews.reduce((sum, r) => sum + (parseFloat(r.rating) || 0), 0);
  const avg = total / reviews.length;
  await db.collection('schools').doc(schoolId).update({ averageRating: avg, reviewCount: reviews.length });
}

module.exports = { getAllSchools, addSchool, updateSchoolRating }; 