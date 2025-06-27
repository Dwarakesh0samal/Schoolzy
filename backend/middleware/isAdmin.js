const db = require('../db');

module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Access denied. Authentication required.' });
  }

  db.get('SELECT * FROM admins WHERE user_id = ?', [req.user.id], (err, admin) => {
    if (err) {
      return res.status(500).json({ message: 'Database error.' });
    }
    
    if (!admin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    req.admin = admin;
    next();
  });
}; 