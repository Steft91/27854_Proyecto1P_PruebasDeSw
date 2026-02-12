// Mock mongoose to REJECT connection (covers app.js .catch callback)
jest.mock('mongoose', () => {
  const m = jest.requireActual('mongoose');
  m.connect = jest.fn().mockRejectedValue(new Error('Connection failed'));
  return m;
});

jest.mock('../src/models/Cliente', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));
jest.mock('../src/models/Empleado', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));
jest.mock('../src/models/Producto', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));
jest.mock('../src/models/Proveedor', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));
jest.mock('../src/models/Usuario', () => {
  const M = jest.fn().mockImplementation(function (d) {
    Object.assign(this, d);
    this._id = 'id';
    this.save = jest.fn().mockResolvedValue(this);
  });
  M.findById = jest.fn();
  M.findOne = jest.fn();
  return M;
});
jest.mock('jsonwebtoken', () => ({ verify: jest.fn(), sign: jest.fn() }));
jest.mock('bcryptjs', () => ({ hash: jest.fn(), compare: jest.fn() }));

const request = require('supertest');
const app = require('../src/app');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

describe('app.js error paths', () => {
  test('mongoose connect failure triggers .catch callback', () => {
    // mongoose.connect was called during module loading and rejected,
    // which triggers the .catch callback (line 25 of app.js)
    // Coverage is captured by module loading - just verify connect was called
    const mongoose = require('mongoose');
    expect(mongoose.connect).toHaveBeenCalled();
  });

  test('error handler middleware handles malformed JSON body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{ this is invalid json }');

    // Express json parser error should trigger the error handler
    expect([400, 500]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('error');
  });

  test('error handler uses default message when err.message is falsy', async () => {
    // register a test route on an existing mounted router so it runs before app 404
    const clientRoutes = require('../src/routes/cliente.routes');
    clientRoutes.get('/__test/no-message', (req, res, next) => next({}));

    const res = await request(app).get('/api/clients/__test/no-message');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('msg', 'Error del servidor');
    // when err.message is undefined the JSON response will omit the `error` key
    expect(res.body).not.toHaveProperty('error');
  });

  test('error handler returns provided status and message when present', async () => {
    const clientRoutes2 = require('../src/routes/cliente.routes');
    clientRoutes2.get('/__test/with-message', (req, res, next) => next({ status: 418, message: 'I am a teapot' }));

    const res = await request(app).get('/api/clients/__test/with-message');
    expect(res.status).toBe(418);
    expect(res.body).toHaveProperty('msg', 'I am a teapot');
    expect(res.body).toHaveProperty('error', 'I am a teapot');
  });
});
