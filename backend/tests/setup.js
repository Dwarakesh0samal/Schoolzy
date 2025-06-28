// Ensure JWT secret is consistent for tests
process.env.JWT_SECRET = 'schoolzy_jwt_secret';

// Test setup file
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock Firebase for testing
jest.mock('../firestore', () => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    })),
    add: jest.fn(),
    where: jest.fn(() => ({
      get: jest.fn(),
      orderBy: jest.fn(() => ({
        get: jest.fn()
      }))
    })),
    get: jest.fn(),
    orderBy: jest.fn(() => ({
      get: jest.fn()
    }))
  }))
}));

// Global test utilities
global.testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    profile_picture: '',
    ...overrides
  }),
  
  createMockSchool: (overrides = {}) => ({
    id: 'test-school-id',
    name: 'Test School',
    location: 'Test City',
    category: 'High',
    type: 'Public',
    averageRating: 4.0,
    reviewCount: 10,
    coordinates: { lat: 20.2961, lng: 85.8245 },
    ...overrides
  }),
  
  createMockReview: (overrides = {}) => ({
    id: 'test-review-id',
    schoolId: 'test-school-id',
    userId: 'test-user-id',
    user_name: 'Test User',
    rating: 4,
    review_text: 'Great school!',
    createdAt: new Date().toISOString(),
    ...overrides
  })
};

// Global test timeout
jest.setTimeout(10000);

// Suppress console logs during tests unless explicitly needed
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.error = jest.fn();
} 