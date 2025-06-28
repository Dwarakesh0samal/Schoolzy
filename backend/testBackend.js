const request = require('supertest');
const app = require('./app');

async function testBackendEndpoints() {
    console.log('🧪 Testing Backend Endpoints...\n');

    // Test 1: Health endpoint
    console.log('1. Testing Health Endpoint...');
    try {
        const response = await request(app).get('/api/health');
        if (response.status === 200) {
            console.log('✅ Health endpoint working');
            console.log('   Environment:', response.body.environment);
            console.log('   Trust Proxy:', response.body.trustProxy);
            console.log('   Firebase configured:', response.body.firebase.configured);
        } else {
            console.error('❌ Health endpoint failed:', response.status);
        }
    } catch (error) {
        console.error('❌ Health endpoint test failed:', error.message);
    }

    // Test 2: Test endpoint
    console.log('\n2. Testing Test Endpoint...');
    try {
        const response = await request(app).get('/api/test');
        if (response.status === 200) {
            console.log('✅ Test endpoint working');
            console.log('   Message:', response.body.message);
        } else {
            console.error('❌ Test endpoint failed:', response.status);
        }
    } catch (error) {
        console.error('❌ Test endpoint test failed:', error.message);
    }

    // Test 3: Schools endpoint
    console.log('\n3. Testing Schools Endpoint...');
    try {
        const response = await request(app).get('/api/schools');
        if (response.status === 200) {
            const data = response.body;
            const schools = data.schools || data || [];
            console.log('✅ Schools endpoint working');
            console.log(`   Found ${schools.length} schools`);
            
            // Check if schools have coordinates
            const schoolsWithCoords = schools.filter(school => school.latitude && school.longitude);
            console.log(`   Schools with coordinates: ${schoolsWithCoords.length}/${schools.length}`);
        } else {
            console.error('❌ Schools endpoint failed:', response.status);
        }
    } catch (error) {
        console.error('❌ Schools endpoint test failed:', error.message);
    }

    // Test 4: CORS headers
    console.log('\n4. Testing CORS Configuration...');
    try {
        const response = await request(app)
            .get('/api/health')
            .set('Origin', 'https://schoolzy-k8g7.onrender.com');
        
        if (response.headers['access-control-allow-origin']) {
            console.log('✅ CORS headers present');
            console.log('   Allow-Origin:', response.headers['access-control-allow-origin']);
        } else {
            console.log('⚠️  CORS headers not found');
        }
    } catch (error) {
        console.error('❌ CORS test failed:', error.message);
    }

    console.log('\n🎉 Backend endpoint tests completed!');
}

// Run the test
testBackendEndpoints().catch(console.error); 