const db = require('./firestore');
const { sanitizeSchool } = require('./utils/dataSanitizer');

/**
 * Script to clean up existing school data in the database
 * This will fix field names with special characters and ensure consistent structure
 */
async function cleanupSchoolData() {
  try {
    console.log('Starting school data cleanup...');
    
    // Get all schools from the database
    const snapshot = await db.collection('schools').get();
    
    if (snapshot.empty) {
      console.log('No schools found in the database.');
      return;
    }
    
    console.log(`Found ${snapshot.docs.length} schools to process.`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // Process each school
    for (const doc of snapshot.docs) {
      try {
        const schoolId = doc.id;
        const rawData = doc.data();
        
        console.log(`Processing school: ${rawData.name || schoolId}`);
        
        // Sanitize the school data
        const sanitizedData = sanitizeSchool(rawData);
        
        if (!sanitizedData) {
          console.log(`Skipping invalid school data for ID: ${schoolId}`);
          errorCount++;
          continue;
        }
        
        // Check if the data actually needs updating
        const needsUpdate = Object.keys(rawData).some(key => {
          const normalizedKey = key.trim().replace(/[\t\n\r]/g, '');
          return key !== normalizedKey || 
                 (typeof rawData[key] === 'string' && rawData[key] !== rawData[key].trim().replace(/[\n\t\r]/g, ''));
        });
        
        if (needsUpdate) {
          // Update the document with sanitized data
          await db.collection('schools').doc(schoolId).update(sanitizedData);
          console.log(`✓ Updated school: ${sanitizedData.name}`);
          updatedCount++;
        } else {
          console.log(`- No changes needed for: ${sanitizedData.name}`);
        }
        
      } catch (error) {
        console.error(`Error processing school ${doc.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n=== Cleanup Summary ===');
    console.log(`Total schools processed: ${snapshot.docs.length}`);
    console.log(`Schools updated: ${updatedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    console.log('School data cleanup completed!');
    
  } catch (error) {
    console.error('Error during school data cleanup:', error);
  }
}

/**
 * Update all schools to have location 'Bhubaneswar' if their location contains 'bhubaneswar',
 * and remove any schools whose location does not mention 'bhubaneswar'.
 */
async function normalizeBhubaneswarSchools() {
  try {
    console.log('Starting normalization of Bhubaneswar schools...');
    const snapshot = await db.collection('schools').get();
    let updatedCount = 0;
    let removedCount = 0;
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const location = (data.location || '').toLowerCase();
      if (location.includes('bhubaneswar')) {
        if (data.location !== 'Bhubaneswar') {
          await db.collection('schools').doc(doc.id).update({ location: 'Bhubaneswar' });
          console.log(`Updated location for: ${data.name}`);
          updatedCount++;
        }
      } else {
        await db.collection('schools').doc(doc.id).delete();
        console.log(`Removed school: ${data.name} (location: ${data.location})`);
        removedCount++;
      }
    }
    console.log(`Normalization complete. Schools updated: ${updatedCount}, removed: ${removedCount}`);
  } catch (error) {
    console.error('Error normalizing Bhubaneswar schools:', error);
  }
}

/**
 * Keep only the fields used by the frontend for each school, removing all others.
 * Required/displayed fields: id, name, location, category, description, averageRating, reviewCount, latitude, longitude
 * Optional: phone, website (keep if present and non-empty)
 */
async function keepFrontendFieldsOnly() {
  try {
    console.log('Starting to clean up school fields for frontend...');
    const snapshot = await db.collection('schools').get();
    let updatedCount = 0;
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const cleaned = {
        name: data.name || '',
        location: data.location || '',
        category: data.category || '',
        description: data.description || '',
        averageRating: typeof data.averageRating === 'number' ? data.averageRating : 0,
        reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0,
        latitude: typeof data.latitude === 'number' ? data.latitude : 0,
        longitude: typeof data.longitude === 'number' ? data.longitude : 0,
      };
      // Optionally add phone and website if present and non-empty
      if (data.phone && data.phone.trim() !== '') cleaned.phone = data.phone;
      if (data.website && data.website.trim() !== '') cleaned.website = data.website;
      await db.collection('schools').doc(doc.id).set(cleaned, { merge: false });
      updatedCount++;
    }
    console.log(`Frontend field cleanup complete. Schools updated: ${updatedCount}`);
  } catch (error) {
    console.error('Error cleaning up school fields:', error);
  }
}

/**
 * Remove all fields from each school document that are either empty ("", null, empty array)
 * or not used by the frontend (as seen in school.html and schools.html).
 * Only keep: id, name, location, category, description, averageRating, reviewCount, latitude, longitude, phone, website.
 */
async function removeEmptyAndUnusedFields() {
  const allowedFields = [
    'name', 'location', 'category', 'description',
    'averageRating', 'reviewCount', 'latitude', 'longitude',
    'phone', 'website', 'id'
  ];
  try {
    console.log('Starting to remove empty and unused fields from school documents...');
    const snapshot = await db.collection('schools').get();
    let updatedCount = 0;
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const cleaned = {};
      for (const key of allowedFields) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];
          // Remove if empty string, null, or empty array
          if (
            value === null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0)
          ) {
            continue;
          }
          cleaned[key] = value;
        }
      }
      await db.collection('schools').doc(doc.id).set(cleaned, { merge: false });
      updatedCount++;
    }
    console.log(`Empty and unused field cleanup complete. Schools updated: ${updatedCount}`);
  } catch (error) {
    console.error('Error cleaning up school fields:', error);
  }
}

// Run the cleanup if this file is executed directly
if (require.main === module) {
  // cleanupSchoolData(); // Uncomment if you want to run the cleanup as well
  normalizeBhubaneswarSchools()
    .then(() => {
      console.log('Normalization script finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Normalization script failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupSchoolData, normalizeBhubaneswarSchools, keepFrontendFieldsOnly, removeEmptyAndUnusedFields }; 