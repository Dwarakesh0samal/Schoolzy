const request = require('supertest');
const app = require('../app');
const db = require('../firestore');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Authentication Endpoints', () => {
  let server;

  // Setup server before tests
  beforeAll(() => {
    // Create a test server on a random port
    server = app.listen(0); // Port 0 lets the OS assign a random available port
  });

  // Cleanup server after tests
  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock Firebase responses
      const mockSnapshot = {
        empty: true
      };
      const mockAdd = jest.fn().mockResolvedValue({ id: 'new-user-id' });
      
      db.collection.mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockSnapshot)
        }),
        add: mockAdd
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(200);

      expect(response.body.message).toBe('User registered');
      expect(response.body.id).toBe('new-user-id');
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: userData.name,
          email: userData.email,
          role: 'user'
        })
      );
    });

    it('should return error if user already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Mock Firebase to return existing user
      const mockSnapshot = {
        empty: false,
        docs: [{ id: 'existing-id', data: () => ({ email: 'existing@example.com' }) }]
      };
      
      db.collection.mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockSnapshot)
        })
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test' })
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Email must be valid');
      expect(response.body.errors).toContain('Password must be between 6 and 100 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user'
      };

      // Mock Firebase responses
      const mockSnapshot = {
        empty: false,
        docs: [{ id: 'user-id', data: () => mockUser }]
      };
      
      db.collection.mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockSnapshot)
        })
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Mock Firebase to return user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockSnapshot = {
        empty: false,
        docs: [{ id: 'user-id', data: () => ({ email: 'test@example.com', password: hashedPassword }) }]
      };
      
      db.collection.mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockSnapshot)
        })
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email', password: 'password123' })
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Email must be valid');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const mockUser = testUtils.createMockUser();
      const token = jwt.sign(mockUser, process.env.JWT_SECRET || 'schoolzy_jwt_secret');

      const mockDoc = {
        exists: true,
        id: mockUser.id,
        data: () => mockUser
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc)
        })
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.id).toBe(mockUser.id);
      expect(response.body.name).toBe(mockUser.name);
      expect(response.body.email).toBe(mockUser.email);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });

    it('should return 403 with invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const mockUser = testUtils.createMockUser();
      const token = jwt.sign(mockUser, process.env.JWT_SECRET || 'schoolzy_jwt_secret');

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');
    });
  });
}); 