const db = require('./firestore');

async function checkSchoolData() {
  try {
    const snapshot = await db.collection('schools').get();
    if (snapshot.empty) {
      console.log('No schools found in the database.');
      return;
    }
    const schools = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    let issues = [];
    let nameLocationSet = new Set();

    schools.forEach(school => {
      const errors = [];
      // Check required fields
      if (!school.name || typeof school.name !== 'string' || !school.name.trim()) {
        errors.push('Missing or empty name');
      }
      if (!school.location || typeof school.location !== 'string' || !school.location.trim()) {
        errors.push('Missing or empty location');
      }
      if (typeof school.latitude !== 'number' || isNaN(school.latitude)) {
        errors.push('Invalid latitude');
      }
      if (typeof school.longitude !== 'number' || isNaN(school.longitude)) {
        errors.push('Invalid longitude');
      }
      if (school.averageRating < 0 || school.averageRating > 5) {
        errors.push('Average rating out of range (0-5)');
      }
      if (school.reviewCount < 0) {
        errors.push('Negative review count');
      }
      // Check for duplicates
      const nameLocKey = `${school.name.trim().toLowerCase()}|${school.location.trim().toLowerCase()}`;
      if (nameLocationSet.has(nameLocKey)) {
        errors.push('Duplicate name/location');
      } else {
        nameLocationSet.add(nameLocKey);
      }
      // Report errors
      if (errors.length > 0) {
        issues.push({ id: school.id, name: school.name, errors });
      }
    });

    if (issues.length === 0) {
      console.log('No data issues found. All schools are valid!');
    } else {
      console.log('Data issues found:');
      issues.forEach(issue => {
        console.log(`- [${issue.id}] ${issue.name}: ${issue.errors.join('; ')}`);
      });
    }
  } catch (error) {
    console.error('Error checking school data:', error);
  }
}

if (require.main === module) {
  checkSchoolData();
}

module.exports = { checkSchoolData }; 