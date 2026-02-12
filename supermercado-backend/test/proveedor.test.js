// Prevent actual MongoDB connection
jest.mock('mongoose', () => {
  const m = jest.requireActual('mongoose');
  m.connect = jest.fn().mockResolvedValue(true);
  return m;
});

jest.mock('../src/models/Proveedor', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
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
const Proveedor = require('../src/models/Proveedor');
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

const PROV_ID = '507f1f77bcf86cd799439011'; // Valid ObjectId format

const mockProvider = {
  _id: PROV_ID,
  nombreFiscal: 'Lácteos del Sur S.A.',
  rucNitNif: '1234567890001',
  direccionFisica: 'Av. Principal 123',
  correoElectronico: 'ventas@lacteos.com',
  telefonoPrincipal: '555-1000',
  contactoNombre: 'Juan Pérez',
  contactoPuesto: 'Gerente',
};

function setupAuth(role = 'administrador') {
  jwt.verify.mockReturnValue({ id: 'uid' });
  Usuario.findById.mockReturnValue({
    select: jest
      .fn()
      .mockResolvedValue({ _id: 'uid', username: 'admin', rol: role }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  setupAuth('administrador');
});

describe('Provider API', () => {
  // ─── GET /api/providers ───
  describe('GET /api/providers', () => {
    test('returns list of providers', async () => {
      Proveedor.find.mockResolvedValue([mockProvider]);
      const res = await request(app)
        .get('/api/providers')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([mockProvider]);
    });

    test('returns empty list', async () => {
      Proveedor.find.mockResolvedValue([]);
      const res = await request(app)
        .get('/api/providers')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns 500 on DB error', async () => {
      Proveedor.find.mockRejectedValue(new Error('DB fail'));
      const res = await request(app)
        .get('/api/providers')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('DB fail');
    });
  });

  // ─── GET /api/providers/:id ───
  describe('GET /api/providers/:id', () => {
    test('returns provider by id', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      const res = await request(app)
        .get(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(200);
      expect(res.body.nombreFiscal).toBe('Lácteos del Sur S.A.');
    });

    test('returns 404 if not found', async () => {
      Proveedor.findById.mockResolvedValue(null);
      const res = await request(app)
        .get(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Proveedor no encontrado');
    });

    test('returns 500 on DB error', async () => {
      Proveedor.findById.mockRejectedValue(new Error('err'));
      const res = await request(app)
        .get(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── POST /api/providers ───
  describe('POST /api/providers', () => {
    test('creates provider successfully', async () => {
      Proveedor.findOne.mockResolvedValue(null);
      Proveedor.create.mockResolvedValue(mockProvider);
      const res = await request(app)
        .post('/api/providers')
        .set('Authorization', 'Bearer t')
        .send({
          nombreFiscal: 'Lácteos del Sur S.A.',
          rucNitNif: '1234567890001',
          direccionFisica: 'Av. Principal 123',
          correoElectronico: 'ventas@lacteos.com',
          telefonoPrincipal: '555-1000',
          contactoNombre: 'Juan Pérez',
          contactoPuesto: 'Gerente',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Proveedor creado con exito');
      expect(res.body.provider).toBeDefined();
    });

    test('creates provider with only required fields', async () => {
      Proveedor.findOne.mockResolvedValue(null);
      Proveedor.create.mockResolvedValue({
        ...mockProvider,
        telefonoPrincipal: '',
        correoElectronico: '',
        contactoNombre: '',
        contactoPuesto: '',
      });
      const res = await request(app)
        .post('/api/providers')
        .set('Authorization', 'Bearer t')
        .send({
          nombreFiscal: 'Test',
          rucNitNif: '1234567890001',
          direccionFisica: 'Dir',
        });
      expect(res.statusCode).toBe(201);
    });

    test('fails with missing required fields', async () => {
      const res = await request(app)
        .post('/api/providers')
        .set('Authorization', 'Bearer t')
        .send({ nombreFiscal: 'Solo nombre' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Campos obligatorios faltantes/);
    });

    test('fails with empty nombreFiscal', async () => {
      const res = await request(app)
        .post('/api/providers')
        .set('Authorization', 'Bearer t')
        .send({
          nombreFiscal: '',
          rucNitNif: '1234567890001',
          direccionFisica: 'Dir',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Campos obligatorios faltantes/);
    });

    test('fails with invalid RUC (too short)', async () => {
      const res = await request(app)
        .post('/api/providers')
        .set('Authorization', 'Bearer t')
        .send({
          nombreFiscal: 'Test',
          rucNitNif: '12345',
          direccionFisica: 'Dir',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'Formato de RUC/NIT/NIF inválido (debe contener entre 10 y 15 dígitos)',
      );
    });

    test('fails with invalid RUC (contains letters)', async () => {
      const res = await request(app)
        .post('/api/providers')
        .set('Authorization', 'Bearer t')
        .send({
          nombreFiscal: 'Test',
          rucNitNif: '12345ABC90001',
          direccionFisica: 'Dir',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'Formato de RUC/NIT/NIF inválido (debe contener entre 10 y 15 dígitos)',
      );
    });

    test('fails with invalid email format', async () => {
      const res = await request(app)
        .post('/api/providers')
        .set('Authorization', 'Bearer t')
        .send({
          nombreFiscal: 'Test',
          rucNitNif: '1234567890001',
          direccionFisica: 'Dir',
          correoElectronico: 'bad-email',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Formato de correo electrónico inválido');
    });

    test('fails with invalid phone format (too short)', async () => {
      const res = await request(app)
        .post('/api/providers')
        .set('Authorization', 'Bearer t')
        .send({
          nombreFiscal: 'Test',
          rucNitNif: '1234567890001',
          direccionFisica: 'Dir',
          telefonoPrincipal: '123',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'Formato de teléfono inválido (debe contener entre 7 y 20 caracteres numéricos)',
      );
    });

    test('fails with contactoNombre too long (>100)', async () => {
      const res = await request(app)
        .post('/api/providers')
        .set('Authorization', 'Bearer t')
        .send({
          nombreFiscal: 'Test',
          rucNitNif: '1234567890001',
          direccionFisica: 'Dir',
          contactoNombre: 'a'.repeat(101),
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El nombre de contacto no puede exceder 100 caracteres',
      );
    });

    test('fails with contactoPuesto too long (>100)', async () => {
      const res = await request(app)
        .post('/api/providers')
        .set('Authorization', 'Bearer t')
        .send({
          nombreFiscal: 'Test',
          rucNitNif: '1234567890002',
          direccionFisica: 'Dir',
          contactoPuesto: 'a'.repeat(101),
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El puesto de contacto no puede exceder 100 caracteres',
      );
    });

    test('fails when RUC already exists (409)', async () => {
      Proveedor.findOne.mockResolvedValue(mockProvider);
      const res = await request(app)
        .post('/api/providers')
        .set('Authorization', 'Bearer t')
        .send({
          nombreFiscal: 'Other',
          rucNitNif: '1234567890001',
          direccionFisica: 'Dir',
        });
      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe(
        'Ya existe un proveedor con ese RUC/NIT/NIF',
      );
    });

    test('returns 400 on create error (catch)', async () => {
      Proveedor.findOne.mockResolvedValue(null);
      Proveedor.create.mockRejectedValue(new Error('fail'));
      const res = await request(app)
        .post('/api/providers')
        .set('Authorization', 'Bearer t')
        .send({
          nombreFiscal: 'Test',
          rucNitNif: '1234567890001',
          direccionFisica: 'Dir',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('fail');
    });
  });

  // ─── PUT /api/providers/:id ───
  describe('PUT /api/providers/:id', () => {
    test('updates provider successfully', async () => {
      const updated = { ...mockProvider, nombreFiscal: 'Updated' };
      Proveedor.findById.mockResolvedValue(mockProvider);
      Proveedor.findByIdAndUpdate.mockResolvedValue(updated);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newNombreFiscal: 'Updated', newTelefonoPrincipal: '555-2000' });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Proveedor actualizado con exito');
      expect(res.body.provider.nombreFiscal).toBe('Updated');
    });

    test('returns 404 if provider not found', async () => {
      Proveedor.findById.mockResolvedValue(null);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newNombreFiscal: 'Ghost' });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Proveedor no encontrado');
    });

    test('fails with newNombreFiscal not string', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newNombreFiscal: 123 });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El nombre fiscal debe ser texto');
    });

    test('fails with newRucNitNif not string', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newRucNitNif: 123 });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El RUC/NIT/NIF debe ser texto');
    });

    test('fails with newDireccionFisica not string', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newDireccionFisica: 123 });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('La dirección física debe ser texto');
    });

    test('fails with empty newNombreFiscal', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newNombreFiscal: '   ' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El nombre fiscal no puede estar vacío');
    });

    test('fails with empty newDireccionFisica', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newDireccionFisica: '   ' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('La dirección física no puede estar vacía');
    });

    test('fails with empty newRucNitNif', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newRucNitNif: '   ' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El RUC/NIT/NIF no puede estar vacío');
    });

    test('fails with invalid newRucNitNif format', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newRucNitNif: '123' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'Formato de RUC/NIT/NIF inválido (debe contener entre 10 y 15 dígitos)',
      );
    });

    test('fails with invalid newCorreoElectronico', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newCorreoElectronico: 'bad-email' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Formato de correo electrónico inválido');
    });

    test('fails with invalid newTelefonoPrincipal', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newTelefonoPrincipal: '123' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'Formato de teléfono inválido (debe contener entre 7 y 20 caracteres numéricos)',
      );
    });

    test('fails with newContactoNombre too long', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newContactoNombre: 'a'.repeat(101) });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El nombre de contacto no puede exceder 100 caracteres',
      );
    });

    test('fails with newContactoPuesto too long', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newContactoPuesto: 'a'.repeat(101) });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El puesto de contacto no puede exceder 100 caracteres',
      );
    });

    test('updates partial fields preserving others', async () => {
      const updated = {
        ...mockProvider,
        direccionFisica: 'New Dir',
        correoElectronico: 'new@test.com',
      };
      Proveedor.findById.mockResolvedValue(mockProvider);
      Proveedor.findByIdAndUpdate.mockResolvedValue(updated);
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({
          newDireccionFisica: 'New Dir',
          newCorreoElectronico: 'new@test.com',
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.provider.direccionFisica).toBe('New Dir');
      expect(res.body.provider.nombreFiscal).toBe(mockProvider.nombreFiscal);
    });

    test('sets non-string telefonoPrincipal to empty string', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      Proveedor.findByIdAndUpdate.mockResolvedValue({
        ...mockProvider,
        telefonoPrincipal: '',
      });
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newTelefonoPrincipal: 1234567 });
      expect(res.statusCode).toBe(200);
      expect(res.body.provider.telefonoPrincipal).toBe('');
    });

    test('sets non-string correoElectronico to empty string', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      Proveedor.findByIdAndUpdate.mockResolvedValue({
        ...mockProvider,
        correoElectronico: '',
      });
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newCorreoElectronico: 12345 });
      expect(res.statusCode).toBe(200);
    });

    test('sets non-string contactoNombre to empty string', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      Proveedor.findByIdAndUpdate.mockResolvedValue({
        ...mockProvider,
        contactoNombre: '',
      });
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newContactoNombre: 12345 });
      expect(res.statusCode).toBe(200);
    });

    test('sets non-string contactoPuesto to empty string', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      Proveedor.findByIdAndUpdate.mockResolvedValue({
        ...mockProvider,
        contactoPuesto: '',
      });
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newContactoPuesto: 12345 });
      expect(res.statusCode).toBe(200);
    });

    test('updates with valid RUC format (covers RUC regex pass branch)', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      Proveedor.findByIdAndUpdate.mockResolvedValue({
        ...mockProvider,
        rucNitNif: '9876543210001',
      });
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newRucNitNif: '9876543210001' });
      expect(res.statusCode).toBe(200);
    });

    test('updates contactoNombre and contactoPuesto as strings', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      Proveedor.findByIdAndUpdate.mockResolvedValue({
        ...mockProvider,
        contactoNombre: 'New Contact',
        contactoPuesto: 'New Position',
      });
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({
          newContactoNombre: 'New Contact',
          newContactoPuesto: 'New Position',
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.provider.contactoNombre).toBe('New Contact');
      expect(res.body.provider.contactoPuesto).toBe('New Position');
    });

    test('updates correoElectronico with valid string', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      Proveedor.findByIdAndUpdate.mockResolvedValue({
        ...mockProvider,
        correoElectronico: 'valid@email.com',
      });
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newCorreoElectronico: 'valid@email.com' });
      expect(res.statusCode).toBe(200);
    });

    test('updates telefonoPrincipal with valid string', async () => {
      Proveedor.findById.mockResolvedValue(mockProvider);
      Proveedor.findByIdAndUpdate.mockResolvedValue({
        ...mockProvider,
        telefonoPrincipal: '555-9999',
      });
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newTelefonoPrincipal: '555-9999' });
      expect(res.statusCode).toBe(200);
    });

    test('returns 500 on DB error (catch)', async () => {
      Proveedor.findById.mockRejectedValue(new Error('err'));
      const res = await request(app)
        .put(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t')
        .send({ newNombreFiscal: 'X' });
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── DELETE /api/providers/:id ───
  describe('DELETE /api/providers/:id', () => {
    test('deletes provider successfully', async () => {
      Proveedor.findByIdAndDelete.mockResolvedValue(mockProvider);
      const res = await request(app)
        .delete(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Proveedor eliminado con exito');
    });

    test('returns 404 if not found', async () => {
      Proveedor.findByIdAndDelete.mockResolvedValue(null);
      const res = await request(app)
        .delete(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Proveedor no encontrado');
    });

    test('returns 500 on DB error (catch)', async () => {
      Proveedor.findByIdAndDelete.mockRejectedValue(new Error('err'));
      const res = await request(app)
        .delete(`/api/providers/${PROV_ID}`)
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── Auth for providers (admin-only) ───
  describe('Auth for providers (admin-only)', () => {
    test('returns 200 if role is empleado', async () => {
      setupAuth('empleado');
      Proveedor.find.mockResolvedValue([]);
      const res = await request(app)
        .get('/api/providers')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(200);
    });

    test('returns 403 if role is cliente', async () => {
      setupAuth('cliente');
      const res = await request(app)
        .get('/api/providers')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(403);
    });

    test('returns 401 without token', async () => {
      const res = await request(app).get('/api/providers');
      expect(res.statusCode).toBe(401);
    });
  });
});
