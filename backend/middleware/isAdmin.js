const db = require('../firestore');

module.exports = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Access denied. Authentication required.' });
  }
  try {
    const userRef = db.collection('users').doc(req.user.id);
    const userDoc = await userRef.get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    req.admin = userDoc.data();
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Database error.' });
  }
}; 