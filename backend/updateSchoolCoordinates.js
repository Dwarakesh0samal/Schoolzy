const db = require('./firestore');

// School coordinates for Bhubaneswar
const schoolCoordinates = [
  { name: "St. Mary's High School", latitude: 20.2961, longitude: 85.8245 },
  { name: "Delhi Public School", latitude: 20.3000, longitude: 85.8200 },
  { name: "Kendriya Vidyalaya No. 1", latitude: 20.3100, longitude: 85.8300 },
  { name: "Mother's Public School", latitude: 20.2900, longitude: 85.8100 },
  { name: "DAV Public School", latitude: 20.3050, longitude: 85.8150 },
  { name: "ODM Public School", latitude: 20.2950, longitude: 85.8250 },
  { name: "KIIT International School", latitude: 20.3150, longitude: 85.8350 },
  { name: "Sai International School", latitude: 20.2850, longitude: 85.8050 },
  { name: "Bhubaneswar Public School", latitude: 20.2970, longitude: 85.8230 },
  { name: "St. Xavier's High School", latitude: 20.3080, longitude: 85.8180 }
];

async function updateSchoolCoordinates() {
  try {
    console.log('Updating school coordinates in Firebase...');
    
    const schoolsSnapshot = await db.collection('schools').get();
    console.log(`Found ${schoolsSnapshot.size} schools to update`);
    
    let updatedCount = 0;
    
    for (const doc of schoolsSnapshot.docs) {
      const school = doc.data();
      const schoolName = school.name;
      
      // Find matching coordinates
      const coordinates = schoolCoordinates.find(coord => 
        coord.name.toLowerCase().includes(schoolName.toLowerCase()) ||
        schoolName.toLowerCase().includes(coord.name.toLowerCase())
      );
      
      if (coordinates) {
        await db.collection('schools').doc(doc.id).update({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          updatedAt: new Date().toISOString()
        });
        console.log(`✅ Updated: ${schoolName} - Lat: ${coordinates.latitude}, Lng: ${coordinates.longitude}`);
        updatedCount++;
      } else {
        // Use default coordinates for schools not in our list
        const defaultCoords = { latitude: 20.2961, longitude: 85.8245 };
        await db.collection('schools').doc(doc.id).update({
          latitude: defaultCoords.latitude,
          longitude: defaultCoords.longitude,
          updatedAt: new Date().toISOString()
        });
        console.log(`📍 Default coords for: ${schoolName} - Lat: ${defaultCoords.latitude}, Lng: ${defaultCoords.longitude}`);
        updatedCount++;
      }
    }
    
    console.log(`🎉 Successfully updated ${updatedCount} schools with coordinates!`);
    
  } catch (error) {
    console.error('❌ Error updating school coordinates:', error.message);
  }
}

updateSchoolCoordinates(); 