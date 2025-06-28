const db = require('./firestore');
const app = require('./app');
const request = require('supertest');

async function testProductionSetup() {
    console.log('🧪 Testing Production Setup...\n');

    // Test 1: Firebase Connection
    console.log('1. Testing Firebase Connection...');
    try {
        const schoolsSnapshot = await db.collection('schools').limit(1).get();
        console.log('✅ Firebase connection successful');
        console.log(`   Found ${schoolsSnapshot.size} schools in database`);
    } catch (error) {
        console.error('❌ Firebase connection failed:', error.message);
        return;
    }

    // Test 2: Express App Configuration
    console.log('\n2. Testing Express App Configuration...');
    try {
        const response = await request(app).get('/api/health');
        if (response.status === 200) {
            console.log('✅ Health endpoint working');
            console.log('   Environment:', response.body.environment);
            console.log('   Trust Proxy:', response.body.trustProxy);
        } else {
            console.error('❌ Health endpoint failed:', response.status);
        }
    } catch (error) {
        console.error('❌ Express app test failed:', error.message);
    }

    // Test 3: Schools API
    console.log('\n3. Testing Schools API...');
    try {
        const response = await request(app).get('/api/schools');
        if (response.status === 200) {
            const data = response.body;
            console.log('✅ Schools API working');
            
            // Handle the correct response structure
            const schools = data.schools || data || [];
            console.log(`   Found ${schools.length} schools`);
            
            // Check if schools have coordinates
            const schoolsWithCoords = schools.filter(school => school.latitude && school.longitude);
            console.log(`   Schools with coordinates: ${schoolsWithCoords.length}/${schools.length}`);
            
            if (schoolsWithCoords.length === 0) {
                console.log('⚠️  Warning: No schools have coordinates for map display');
            }
        } else {
            console.error('❌ Schools API failed:', response.status);
        }
    } catch (error) {
        console.error('❌ Schools API test failed:', error.message);
    }

    // Test 4: Environment Variables
    console.log('\n4. Testing Environment Variables...');
    const requiredVars = [
        'NODE_ENV',
        'JWT_SECRET',
        'SESSION_SECRET',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL'
    ];

    const missingVars = [];
    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    });

    if (missingVars.length === 0) {
        console.log('✅ All required environment variables are set');
    } else {
        console.log('❌ Missing environment variables:', missingVars.join(', '));
    }

    // Test 5: CORS Configuration
    console.log('\n5. Testing CORS Configuration...');
    try {
        const response = await request(app)
            .get('/api/health')
            .set('Origin', 'https://schoolzy-k8g7.onrender.com');
        
        if (response.headers['access-control-allow-origin']) {
            console.log('✅ CORS configured correctly');
        } else {
            console.log('⚠️  CORS headers not found');
        }
    } catch (error) {
        console.error('❌ CORS test failed:', error.message);
    }

    console.log('\n🎉 Production setup test completed!');
}

// Run the test
testProductionSetup().catch(console.error); 