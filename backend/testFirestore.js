const db = require('./firestore');

async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    
    // Test 1: Check if we can read from schools collection
    const schoolsSnapshot = await db.collection('schools').get();
    console.log(`✅ Found ${schoolsSnapshot.size} schools in database`);
    
    if (schoolsSnapshot.size > 0) {
      console.log('Sample schools:');
      schoolsSnapshot.docs.slice(0, 3).forEach(doc => {
        const school = doc.data();
        console.log(`- ${school.name} (${school.location}) - Lat: ${school.latitude}, Lng: ${school.longitude}`);
      });
    }
    
    // Test 2: Check if we can read from users collection
    const usersSnapshot = await db.collection('users').get();
    console.log(`✅ Found ${usersSnapshot.size} users in database`);
    
    console.log('🎉 Firebase connection test successful!');
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error.message);
    console.error('Please check your Firebase credentials and project configuration.');
  }
}

testFirebaseConnection(); 