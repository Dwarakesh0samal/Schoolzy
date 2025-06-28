const db = require('./firestore');
const EventEmitter = require('events');

class FirebaseSessionStore extends EventEmitter {
  constructor(options = {}) {
    super();
    this.collection = options.collection || 'sessions';
    this.ttl = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default
  }

  async get(sessionId, callback) {
    try {
      const doc = await db.collection(this.collection).doc(sessionId).get();
      
      if (!doc.exists) {
        return callback(null, null);
      }

      const session = doc.data();
      
      // Check if session has expired
      if (session.expires && new Date() > new Date(session.expires)) {
        await this.destroy(sessionId, () => {});
        return callback(null, null);
      }

      callback(null, session.data || null);
    } catch (error) {
      console.error('Firebase session store get error:', error);
      callback(error);
    }
  }

  async set(sessionId, session, callback) {
    try {
      const expires = new Date(Date.now() + this.ttl);
      
      await db.collection(this.collection).doc(sessionId).set({
        data: session,
        expires: expires.toISOString(),
        updatedAt: new Date().toISOString()
      });

      callback(null);
    } catch (error) {
      console.error('Firebase session store set error:', error);
      callback(error);
    }
  }

  async destroy(sessionId, callback) {
    try {
      await db.collection(this.collection).doc(sessionId).delete();
      callback(null);
    } catch (error) {
      console.error('Firebase session store destroy error:', error);
      callback(error);
    }
  }

  async touch(sessionId, session, callback) {
    try {
      const expires = new Date(Date.now() + this.ttl);
      
      await db.collection(this.collection).doc(sessionId).update({
        data: session,
        expires: expires.toISOString(),
        updatedAt: new Date().toISOString()
      });

      callback(null);
    } catch (error) {
      console.error('Firebase session store touch error:', error);
      callback(error);
    }
  }

  // Clean up expired sessions (can be called periodically)
  async cleanup() {
    try {
      const now = new Date();
      const snapshot = await db.collection(this.collection)
        .where('expires', '<', now.toISOString())
        .get();

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Cleaned up ${snapshot.docs.length} expired sessions`);
    } catch (error) {
      console.error('Firebase session store cleanup error:', error);
    }
  }

  // Required method for express-session compatibility
  all(callback) {
    // This is optional but can be implemented if needed
    callback(null, []);
  }

  // Required method for express-session compatibility
  clear(callback) {
    // This is optional but can be implemented if needed
    callback(null);
  }

  // Required method for express-session compatibility
  length(callback) {
    // This is optional but can be implemented if needed
    callback(null, 0);
  }
}

module.exports = FirebaseSessionStore; 