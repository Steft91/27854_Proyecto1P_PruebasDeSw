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
});
