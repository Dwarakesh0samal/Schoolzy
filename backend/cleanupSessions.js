const FirebaseSessionStore = require('./sessionStore');

async function cleanupExpiredSessions() {
  try {
    console.log('Starting session cleanup...');
    
    const sessionStore = new FirebaseSessionStore({
      collection: 'sessions',
      ttl: 7 * 24 * 60 * 60 * 1000 // 1 week
    });
    
    await sessionStore.cleanup();
    
    console.log('Session cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Session cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  cleanupExpiredSessions();
}

module.exports = cleanupExpiredSessions; 