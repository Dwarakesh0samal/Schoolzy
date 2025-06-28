const validator = require('validator');

// Validate school data
const validateSchoolData = (req, res, next) => {
  const { name, location, category, type, description, address, phone, email, website } = req.body;
  const errors = [];

  // Required fields
  if (!name || !validator.isLength(name, { min: 2, max: 100 })) {
    errors.push('Name must be between 2 and 100 characters');
  }

  if (!location || !validator.isLength(location, { min: 2, max: 100 })) {
    errors.push('Location must be between 2 and 100 characters');
  }

  if (!category || !['Elementary', 'Middle', 'High', 'University'].includes(category)) {
    errors.push('Category must be Elementary, Middle, High, or University');
  }

  if (!type || !['Public', 'Private'].includes(type)) {
    errors.push('Type must be Public or Private');
  }

  // Optional fields with validation
  if (description && !validator.isLength(description, { max: 1000 })) {
    errors.push('Description must be less than 1000 characters');
  }

  if (address && !validator.isLength(address, { max: 200 })) {
    errors.push('Address must be less than 200 characters');
  }

  if (phone && !validator.isMobilePhone(phone)) {
    errors.push('Phone number must be valid');
  }

  if (email && !validator.isEmail(email)) {
    errors.push('Email must be valid');
  }

  if (website && !validator.isURL(website)) {
    errors.push('Website must be a valid URL');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors 
    });
  }

  // Sanitize data
  req.body.name = validator.escape(name);
  req.body.location = validator.escape(location);
  req.body.category = validator.escape(category);
  req.body.type = validator.escape(type);
  if (description) req.body.description = validator.escape(description);
  if (address) req.body.address = validator.escape(address);
  if (email) req.body.email = validator.normalizeEmail(email);
  if (website) req.body.website = validator.escape(website);

  next();
};

// Validate review data
const validateReviewData = (req, res, next) => {
  const { rating, review_text } = req.body;
  const errors = [];

  // Required fields
  if (!rating || !validator.isInt(rating, { min: 1, max: 5 })) {
    errors.push('Rating must be between 1 and 5');
  }

  if (!review_text || !validator.isLength(review_text, { min: 10, max: 1000 })) {
    errors.push('Review text must be between 10 and 1000 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors 
    });
  }

  // Sanitize data
  req.body.rating = parseInt(rating);
  req.body.review_text = validator.escape(review_text);

  next();
};

// Validate user registration data
const validateRegistrationData = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  // Required fields
  if (!name || !validator.isLength(name, { min: 2, max: 50 })) {
    errors.push('Name must be between 2 and 50 characters');
  }

  if (!email || !validator.isEmail(email)) {
    errors.push('Email must be valid');
  }

  if (!password || !validator.isLength(password, { min: 6, max: 100 })) {
    errors.push('Password must be between 6 and 100 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors 
    });
  }

  // Sanitize data
  req.body.name = validator.escape(name);
  req.body.email = validator.normalizeEmail(email);

  next();
};

// Validate user login data
const validateLoginData = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Email must be valid');
  }

  if (!password || !validator.isLength(password, { min: 1 })) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors 
    });
  }

  // Sanitize data
  req.body.email = validator.normalizeEmail(email);

  next();
};

module.exports = {
  validateSchoolData,
  validateReviewData,
  validateRegistrationData,
  validateLoginData
}; 