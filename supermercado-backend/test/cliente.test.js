jest.mock('mongoose', () => {
  const m = jest.requireActual('mongoose');
  m.connect = jest.fn().mockResolvedValue(true);
  return m;
});

jest.mock('../src/models/Cliente', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

jest.mock('../src/models/Usuario', () => {
  const MockUsuario = jest.fn().mockImplementation(function (data) {
    Object.assign(this, data);
    this._id = 'mock-user-id';
    this.save = jest.fn().mockResolvedValue(this);
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
const Cliente = require('../src/models/Cliente');
const Usuario = require('../src/models/Usuario');
const jwt = require('jsonwebtoken');
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

const CEDULA_1 = '1713175071';
const CEDULA_3 = '0601234560';

const mockClient = {
  _id: 'c1',
  dniClient: CEDULA_1,
  nameClient: 'Marcos',
  surnameClient: 'Escobar',
  addressClient: 'Av. Siempre Viva 742',
  emailClient: 'marcos@test.com',
  phoneClient: '0987654321',
};

function setupAuth(role = 'empleado') {
  jwt.verify.mockReturnValue({ id: 'uid' });
  Usuario.findById.mockReturnValue({
    select: jest
      .fn()
      .mockResolvedValue({ _id: 'uid', username: 'u', rol: role }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  setupAuth('empleado');
});

describe('Client API', () => {
  // ─── GET /api/clients ───
  describe('GET /api/clients', () => {
    test('returns list of clients', async () => {
      Cliente.find.mockResolvedValue([mockClient]);
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([mockClient]);
    });

    test('returns empty list', async () => {
      Cliente.find.mockResolvedValue([]);
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns 500 on DB error', async () => {
      Cliente.find.mockRejectedValue(new Error('DB fail'));
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('DB fail');
    });
  });

  // ─── GET /api/clients/:dni ───
  describe('GET /api/clients/:dni', () => {
    test('returns client by DNI', async () => {
      Cliente.findOne.mockResolvedValue(mockClient);
      const res = await request(app)
        .get(`/api/clients/${CEDULA_1}`)
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(200);
      expect(res.body.nameClient).toBe('Marcos');
    });

    test('returns 404 if not found', async () => {
      Cliente.findOne.mockResolvedValue(null);
      const res = await request(app)
        .get('/api/clients/0000000000')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Cliente no encontrado');
    });

    test('returns 500 on DB error', async () => {
      Cliente.findOne.mockRejectedValue(new Error('err'));
      const res = await request(app)
        .get(`/api/clients/${CEDULA_1}`)
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── POST /api/clients ───
  describe('POST /api/clients', () => {
    test('creates client successfully', async () => {
      Cliente.findOne.mockResolvedValue(null);
      Cliente.create.mockResolvedValue(mockClient);
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: CEDULA_1,
          nameClient: 'Marcos',
          surnameClient: 'Escobar',
          addressClient: 'Av. Siempre Viva 742',
          emailClient: 'marcos@test.com',
          phoneClient: '0987654321',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Cliente creado con exito');
      expect(res.body.client).toBeDefined();
    });

    test('creates client without optional fields', async () => {
      Cliente.findOne.mockResolvedValue(null);
      Cliente.create.mockResolvedValue({
        ...mockClient,
        emailClient: '',
        phoneClient: '',
      });
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: CEDULA_1,
          nameClient: 'A',
          surnameClient: 'B',
          addressClient: 'C',
        });
      expect(res.statusCode).toBe(201);
    });

    test('creates client with verifier=0 cedula (sum%10===0 branch)', async () => {
      Cliente.findOne.mockResolvedValue(null);
      Cliente.create.mockResolvedValue({ ...mockClient, dniClient: CEDULA_3 });
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: CEDULA_3,
          nameClient: 'A',
          surnameClient: 'B',
          addressClient: 'C',
        });
      expect(res.statusCode).toBe(201);
    });

    test('fails with missing required fields', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({ nameClient: 'Solo' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Campos obligatorios faltantes/);
    });

    test('fails with whitespace-only required fields', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: '   ',
          nameClient: 'V',
          surnameClient: 'V',
          addressClient: 'V',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain(
        'deben ser texto válido y no estar vacíos',
      );
    });

    test('fails with cedula not 10 digits', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: '12345',
          nameClient: 'A',
          surnameClient: 'B',
          addressClient: 'C',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cédula ecuatoriana inválida');
    });

    test('fails with province > 24', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: '2500000000',
          nameClient: 'A',
          surnameClient: 'B',
          addressClient: 'C',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cédula ecuatoriana inválida');
    });

    test('fails with province < 1', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: '0012345678',
          nameClient: 'A',
          surnameClient: 'B',
          addressClient: 'C',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cédula ecuatoriana inválida');
    });

    test('fails with third digit >= 6', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: '0160000000',
          nameClient: 'A',
          surnameClient: 'B',
          addressClient: 'C',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cédula ecuatoriana inválida');
    });

    test('fails with bad verifier digit', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: '1713175072',
          nameClient: 'A',
          surnameClient: 'B',
          addressClient: 'C',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cédula ecuatoriana inválida');
    });

    test('fails with invalid email', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: CEDULA_1,
          nameClient: 'A',
          surnameClient: 'B',
          addressClient: 'C',
          emailClient: 'bad',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El formato del email no es válido');
    });

    test('fails with invalid phone', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: CEDULA_1,
          nameClient: 'A',
          surnameClient: 'B',
          addressClient: 'C',
          phoneClient: '1234567890',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'Número de celular inválido. Debe empezar con 09 y tener 10 dígitos',
      );
    });

    test('fails when client already exists (409)', async () => {
      Cliente.findOne.mockResolvedValue(mockClient);
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: CEDULA_1,
          nameClient: 'A',
          surnameClient: 'B',
          addressClient: 'C',
        });
      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe('Ya existe un cliente con ese DNI');
    });

    test('trims whitespace from fields', async () => {
      Cliente.findOne.mockResolvedValue(null);
      Cliente.create.mockResolvedValue(mockClient);
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: `  ${CEDULA_1}  `,
          nameClient: '  Marcos  ',
          surnameClient: '  Escobar  ',
          addressClient: '  Addr  ',
          emailClient: '  marcos@test.com  ',
          phoneClient: '  0987654321  ',
        });
      expect(res.statusCode).toBe(201);
      expect(Cliente.create).toHaveBeenCalledWith(
        expect.objectContaining({ dniClient: CEDULA_1, nameClient: 'Marcos' }),
      );
    });

    test('returns 400 on create error (catch)', async () => {
      Cliente.findOne.mockResolvedValue(null);
      Cliente.create.mockRejectedValue(new Error('Create fail'));
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', 'Bearer t')
        .send({
          dniClient: CEDULA_1,
          nameClient: 'A',
          surnameClient: 'B',
          addressClient: 'C',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Create fail');
    });
  });

  // ─── PUT /api/clients/:dni ───
  describe('PUT /api/clients/:dni', () => {
    test('updates client successfully', async () => {
      const updated = { ...mockClient, nameClient: 'Updated' };
      Cliente.findOne.mockResolvedValue(mockClient);
      Cliente.findOneAndUpdate.mockResolvedValue(updated);
      const res = await request(app)
        .put(`/api/clients/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({ newNameClient: 'Updated' });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Cliente actualizado con exito');
      expect(res.body.client.nameClient).toBe('Updated');
    });

    test('returns 404 if not found', async () => {
      Cliente.findOne.mockResolvedValue(null);
      const res = await request(app)
        .put('/api/clients/0000000000')
        .set('Authorization', 'Bearer t')
        .send({ newNameClient: 'Ghost' });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Cliente no encontrado');
    });

    test('fails with invalid new email', async () => {
      Cliente.findOne.mockResolvedValue(mockClient);
      const res = await request(app)
        .put(`/api/clients/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({ newEmailClient: 'bad' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El nuevo email no tiene un formato válido',
      );
    });

    test('fails with invalid new phone', async () => {
      Cliente.findOne.mockResolvedValue(mockClient);
      const res = await request(app)
        .put(`/api/clients/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({ newPhoneClient: '1234567890' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'Número de celular inválido. Debe empezar con 09 y tener 10 dígitos',
      );
    });

    test('fails with empty name', async () => {
      Cliente.findOne.mockResolvedValue(mockClient);
      const res = await request(app)
        .put(`/api/clients/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({ newNameClient: '' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El nombre o apellido no pueden quedar vacíos',
      );
    });

    test('fails with empty surname', async () => {
      Cliente.findOne.mockResolvedValue(mockClient);
      const res = await request(app)
        .put(`/api/clients/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({ newSurnameClient: '' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El nombre o apellido no pueden quedar vacíos',
      );
    });

    test('trims update fields', async () => {
      Cliente.findOne.mockResolvedValue(mockClient);
      Cliente.findOneAndUpdate.mockResolvedValue(mockClient);
      const res = await request(app)
        .put(`/api/clients/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({
          newNameClient: '  Ana  ',
          newSurnameClient: '  Pérez  ',
          newEmailClient: '  a@b.com  ',
          newPhoneClient: '  0987654321  ',
          newAddressClient: '  Dir  ',
        });
      expect(res.statusCode).toBe(200);
    });

    test('allows clearing email with empty string', async () => {
      Cliente.findOne.mockResolvedValue(mockClient);
      Cliente.findOneAndUpdate.mockResolvedValue({
        ...mockClient,
        emailClient: '',
      });
      const res = await request(app)
        .put(`/api/clients/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({ newEmailClient: '' });
      expect(res.statusCode).toBe(200);
    });

    test('allows clearing phone with empty string', async () => {
      Cliente.findOne.mockResolvedValue(mockClient);
      Cliente.findOneAndUpdate.mockResolvedValue({
        ...mockClient,
        phoneClient: '',
      });
      const res = await request(app)
        .put(`/api/clients/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({ newPhoneClient: '' });
      expect(res.statusCode).toBe(200);
    });

    test('returns 500 on DB error (catch)', async () => {
      Cliente.findOne.mockRejectedValue(new Error('err'));
      const res = await request(app)
        .put(`/api/clients/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({ newNameClient: 'X' });
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── DELETE /api/clients/:dni ───
  describe('DELETE /api/clients/:dni', () => {
    test('deletes client successfully', async () => {
      Cliente.findOneAndDelete.mockResolvedValue(mockClient);
      const res = await request(app)
        .delete(`/api/clients/${CEDULA_1}`)
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Cliente eliminado con exito');
    });

    test('returns 404 if not found', async () => {
      Cliente.findOneAndDelete.mockResolvedValue(null);
      const res = await request(app)
        .delete('/api/clients/0000000000')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Cliente no encontrado');
    });

    test('returns 500 on DB error (catch)', async () => {
      Cliente.findOneAndDelete.mockRejectedValue(new Error('err'));
      const res = await request(app)
        .delete(`/api/clients/${CEDULA_1}`)
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── Auth middleware coverage via client routes ───
  describe('roleMiddleware coverage', () => {
    test('returns 401 without token', async () => {
      const res = await request(app).get('/api/clients');
      expect(res.statusCode).toBe(401);
      expect(res.body.msg).toBe('No autorizado - Token no proporcionado');
    });

    test('returns 403 with invalid/expired token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('bad');
      });
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', 'Bearer bad');
      expect(res.statusCode).toBe(403);
      expect(res.body.msg).toBe('Token inválido o expirado');
    });

    test('returns 404 if user from token not found', async () => {
      jwt.verify.mockReturnValue({ id: 'x' });
      Usuario.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(404);
      expect(res.body.msg).toBe('Usuario no encontrado');
    });

    test('returns 403 if user role not allowed', async () => {
      jwt.verify.mockReturnValue({ id: 'x' });
      Usuario.findById.mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue({ _id: 'x', username: 'u', rol: 'cliente' }),
      });
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(403);
      expect(res.body.msg).toMatch(/Acceso denegado/);
    });
  });
});

describe('App 404 Handler', () => {
  test('returns 404 for non-existent route', async () => {
    const res = await request(app).get('/api/ruta-inventada');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Ruta no encontrada');
  });
});
