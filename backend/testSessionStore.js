const FirebaseSessionStore = require('./sessionStore');

async function testSessionStore() {
  try {
    console.log('Testing Firebase Session Store...');
    
    const sessionStore = new FirebaseSessionStore({
      collection: 'sessions',
      ttl: 7 * 24 * 60 * 60 * 1000 // 1 week
    });
    
    const testSessionId = 'test-session-' + Date.now();
    const testSessionData = {
      userId: 'test-user-123',
      email: 'test@example.com',
      loginTime: new Date().toISOString()
    };
    
    console.log('1. Testing session creation...');
    await new Promise((resolve, reject) => {
      sessionStore.set(testSessionId, testSessionData, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    console.log('✅ Session created successfully');
    
    console.log('2. Testing session retrieval...');
    const retrievedSession = await new Promise((resolve, reject) => {
      sessionStore.get(testSessionId, (error, session) => {
        if (error) reject(error);
        else resolve(session);
      });
    });
    
    if (retrievedSession && retrievedSession.userId === testSessionData.userId) {
      console.log('✅ Session retrieved successfully');
    } else {
      throw new Error('Session data mismatch');
    }
    
    console.log('3. Testing session update (touch)...');
    const updatedSessionData = { ...testSessionData, lastAccess: new Date().toISOString() };
    await new Promise((resolve, reject) => {
      sessionStore.touch(testSessionId, updatedSessionData, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    console.log('✅ Session updated successfully');
    
    console.log('4. Testing session deletion...');
    await new Promise((resolve, reject) => {
      sessionStore.destroy(testSessionId, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    console.log('✅ Session deleted successfully');
    
    console.log('5. Testing session retrieval after deletion...');
    const deletedSession = await new Promise((resolve, reject) => {
      sessionStore.get(testSessionId, (error, session) => {
        if (error) reject(error);
        else resolve(session);
      });
    });
    
    if (deletedSession === null) {
      console.log('✅ Session properly deleted (returns null)');
    } else {
      throw new Error('Session should be null after deletion');
    }
    
    console.log('🎉 All Firebase Session Store tests passed!');
    
  } catch (error) {
    console.error('❌ Firebase Session Store test failed:', error.message);
    process.exit(1);
  }
}

testSessionStore(); 