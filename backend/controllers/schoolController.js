const db = require('../firestore');

// Get all schools with pagination and filtering
const getAllSchools = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type, rating } = req.query;
    let query = db.collection('schools');

    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }
    if (type) {
      query = query.where('type', '==', type);
    }
    if (rating) {
      query = query.where('averageRating', '>=', parseFloat(rating));
    }

    const snapshot = await query.get();
    const schools = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedSchools = schools.slice(startIndex, endIndex);

    res.json({
      schools: paginatedSchools,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(schools.length / limit),
        totalSchools: schools.length,
        hasNext: endIndex < schools.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error loading schools',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get school by ID
const getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('schools').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'School not found' });
    }
    
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error loading school details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get reviews for a school
const getSchoolReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const snapshot = await db.collection('reviews')
      .where('schoolId', '==', id)
      .orderBy('createdAt', 'desc')
      .get();
    
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedReviews = reviews.slice(startIndex, endIndex);

    res.json({
      reviews: paginatedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(reviews.length / limit),
        totalReviews: reviews.length,
        hasNext: endIndex < reviews.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error loading reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new school
const createSchool = async (req, res) => {
  try {
    const schoolData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      averageRating: 0,
      reviewCount: 0
    };

    const docRef = await db.collection('schools').add(schoolData);
    res.status(201).json({ 
      message: 'School created successfully',
      id: docRef.id,
      school: { id: docRef.id, ...schoolData }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating school',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update school
const updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const docRef = db.collection('schools').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'School not found' });
    }

    await docRef.update(updateData);
    res.json({ 
      message: 'School updated successfully',
      id,
      school: { id, ...updateData }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating school',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete school
const deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('schools').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ message: 'School not found' });
    }

    await docRef.delete();
    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting school',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Search schools by location
const searchByLocation = async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ message: 'Location parameter is required' });
    }

    const snapshot = await db.collection('schools')
      .where('location', '>=', location)
      .where('location', '<=', location + '\uf8ff')
      .get();

    const schools = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ schools });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error searching schools',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Search schools by name
const searchByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: 'Name parameter is required' });
    }

    const snapshot = await db.collection('schools')
      .where('name', '>=', name)
      .where('name', '<=', name + '\uf8ff')
      .get();

    const schools = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ schools });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error searching schools',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Filter schools by category
const filterByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const snapshot = await db.collection('schools')
      .where('category', '==', category)
      .get();

    const schools = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ schools });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error filtering schools',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Filter schools by type
const filterByType = async (req, res) => {
  try {
    const { type } = req.params;
    const snapshot = await db.collection('schools')
      .where('type', '==', type)
      .get();

    const schools = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ schools });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error filtering schools',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllSchools,
  getSchoolById,
  getSchoolReviews,
  createSchool,
  updateSchool,
  deleteSchool,
  searchByLocation,
  searchByName,
  filterByCategory,
  filterByType
}; 