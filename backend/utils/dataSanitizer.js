/**
 * Data sanitization utilities for school data
 */

// Helper function to trim and clean string fields
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/[\n\t\r]/g, '');
};

// Helper function to ensure consistent field names
const normalizeFieldName = (fieldName) => {
  if (typeof fieldName !== 'string') return fieldName;
  return fieldName.trim().replace(/[\t\n\r]/g, '');
};

// Standard school fields that should always be present
const standardSchoolFields = {
  name: '',
  location: '',
  category: '',
  type: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  averageRating: 0,
  reviewCount: 0,
  latitude: 0,
  longitude: 0,
  facilities: [],
  established: null,
  createdAt: null,
  updatedAt: null
};

/**
 * Sanitize a single school object
 * @param {Object} school - Raw school data from database
 * @returns {Object} - Sanitized school object with consistent structure
 */
const sanitizeSchool = (school) => {
  if (!school || typeof school !== 'object') {
    return null;
  }

  const sanitized = { ...standardSchoolFields };

  // Process each field in the school object
  Object.keys(school).forEach(key => {
    const normalizedKey = normalizeFieldName(key);
    let value = school[key];

    // Handle different field types
    switch (normalizedKey) {
      case 'name':
      case 'location':
      case 'category':
      case 'type':
      case 'description':
      case 'address':
      case 'phone':
      case 'email':
      case 'website':
        sanitized[normalizedKey] = sanitizeString(value);
        break;

      case 'averageRating':
      case 'reviewCount':
      case 'latitude':
      case 'longitude':
      case 'established':
        sanitized[normalizedKey] = typeof value === 'number' ? value : parseFloat(value) || 0;
        break;

      case 'facilities':
        if (Array.isArray(value)) {
          sanitized.facilities = value.map(facility => sanitizeString(facility)).filter(Boolean);
        } else if (typeof value === 'string') {
          // If facilities is a string, try to parse it as JSON or split by comma
          try {
            const parsed = JSON.parse(value);
            sanitized.facilities = Array.isArray(parsed) ? parsed.map(f => sanitizeString(f)).filter(Boolean) : [];
          } catch {
            sanitized.facilities = value.split(',').map(f => sanitizeString(f)).filter(Boolean);
          }
        } else {
          sanitized.facilities = [];
        }
        break;

      case 'createdAt':
      case 'updatedAt':
        sanitized[normalizedKey] = value || new Date().toISOString();
        break;

      default:
        // For any other fields, try to sanitize them
        if (typeof value === 'string') {
          sanitized[normalizedKey] = sanitizeString(value);
        } else {
          sanitized[normalizedKey] = value;
        }
    }
  });

  return sanitized;
};

/**
 * Sanitize an array of school objects
 * @param {Array} schools - Array of raw school data
 * @returns {Array} - Array of sanitized school objects
 */
const sanitizeSchools = (schools) => {
  if (!Array.isArray(schools)) {
    return [];
  }

  return schools
    .map(school => sanitizeSchool(school))
    .filter(school => school !== null);
};

module.exports = {
  sanitizeSchool,
  sanitizeSchools,
  sanitizeString,
  normalizeFieldName
}; 