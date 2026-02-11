// Prevent actual MongoDB connection
jest.mock('mongoose', () => {
  const m = jest.requireActual('mongoose');
  m.connect = jest.fn().mockResolvedValue(true);
  return m;
});

const mockSave = jest.fn();
jest.mock('../src/models/Usuario', () => {
  const MockUsuario = jest.fn().mockImplementation(function (data) {
    Object.assign(this, data);
    this._id = 'new-user-id';
    this.save = mockSave;
  });
  MockUsuario.findById = jest.fn();
  MockUsuario.findOne = jest.fn();
  return MockUsuario;
});

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const Usuario = require('../src/models/Usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSave.mockResolvedValue(true);
});

describe('Auth API', () => {
  // ─── POST /api/auth/register ───
  describe('POST /api/auth/register', () => {
    test('registers user successfully with default role', async () => {
      Usuario.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-pw');
      mockSave.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'pass123',
          email: 'test@test.com',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.msg).toBe('Usuario creado exitosamente');
      expect(res.body.rol).toBe('cliente'); // Default role
    });

    test('registers user with explicit role', async () => {
      Usuario.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-pw');
      mockSave.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'admin1',
          password: 'pass123',
          email: 'admin@test.com',
          rol: 'administrador',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.rol).toBe('administrador');
    });

    test('fails with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'only-username' });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Todos los campos son requeridos');
    });

    test('fails with missing password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'user', email: 'e@e.com' });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Todos los campos son requeridos');
    });

    test('fails with missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'user', password: 'pass' });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Todos los campos son requeridos');
    });

    test('fails with invalid role', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user',
          password: 'pass',
          email: 'e@e.com',
          rol: 'superadmin',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toMatch(/Rol inválido/);
    });

    test('fails when user or email already exists', async () => {
      Usuario.findOne.mockResolvedValue({
        _id: 'existing',
        username: 'testuser',
      });
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'pass123',
          email: 'test@test.com',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('El usuario o email ya existe');
    });

    test('returns 500 on server error', async () => {
      Usuario.findOne.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'user', password: 'pass', email: 'e@e.com' });
      expect(res.statusCode).toBe(500);
      expect(res.body.msg).toBe('Error al crear usuario');
    });
  });

  // ─── POST /api/auth/login ───
  describe('POST /api/auth/login', () => {
    test('logs in successfully', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        password: 'hashed-pw',
        email: 'test@test.com',
        rol: 'cliente',
      };
      Usuario.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock-jwt-token');

      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'pass123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBe('mock-jwt-token');
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user.rol).toBe('cliente');
    });

    test('fails with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'only-username' });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Username y contraseña son requeridos');
    });

    test('fails with missing username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'pass' });
      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Username y contraseña son requeridos');
    });

    test('fails when user not found (404)', async () => {
      Usuario.findOne.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'pass' });
      expect(res.statusCode).toBe(404);
      expect(res.body.msg).toBe('Usuario no encontrado');
    });

    test('fails with wrong password (401)', async () => {
      Usuario.findOne.mockResolvedValue({
        _id: 'user-id',
        username: 'testuser',
        password: 'hashed-pw',
      });
      bcrypt.compare.mockResolvedValue(false);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrong' });
      expect(res.statusCode).toBe(401);
      expect(res.body.msg).toBe('Contraseña incorrecta');
    });

    test('returns 500 on server error', async () => {
      Usuario.findOne.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'user', password: 'pass' });
      expect(res.statusCode).toBe(500);
      expect(res.body.msg).toBe('Error al iniciar sesión');
    });
  });
});

// ─── authMiddleware unit tests ───
describe('authMiddleware', () => {
  const authMiddleware = require('../src/middleware/authMiddleware');

  test('returns 401 if no token', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No autorizado' });
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next and sets req.user with valid token', () => {
    jwt.verify.mockReturnValue({ id: 'user-123' });
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 'user-123' });
  });

  test('returns 403 if token is invalid', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid');
    });
    const req = { headers: { authorization: 'Bearer bad-token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });
});

// ─── roleMiddleware unit tests ───
describe('roleMiddleware', () => {
  const checkRole = require('../src/middleware/roleMiddleware');

  test('returns 401 if no token', async () => {
    const middleware = checkRole(['administrador']);
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 if jwt.verify throws', async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('bad');
    });
    const middleware = checkRole(['administrador']);
    const req = { headers: { authorization: 'Bearer bad' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token inválido o expirado' });
  });

  test('returns 404 if user not found', async () => {
    jwt.verify.mockReturnValue({ id: 'x' });
    Usuario.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });
    const middleware = checkRole(['administrador']);
    const req = { headers: { authorization: 'Bearer t' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Usuario no encontrado' });
  });

  test('returns 403 if role not in allowed list', async () => {
    jwt.verify.mockReturnValue({ id: 'uid' });
    Usuario.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'uid', rol: 'cliente' }),
    });
    const middleware = checkRole(['administrador']);
    const req = { headers: { authorization: 'Bearer t' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('calls next if role is allowed', async () => {
    jwt.verify.mockReturnValue({ id: 'uid' });
    const mockUser = { _id: 'uid', rol: 'administrador' };
    Usuario.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });
    const middleware = checkRole(['administrador']);
    const req = { headers: { authorization: 'Bearer t' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBe(mockUser);
  });
});
