jest.mock('mongoose', () => {
  const m = jest.requireActual('mongoose');
  m.connect = jest.fn().mockResolvedValue(true);
  return m;
});

jest.mock('../src/models/Empleado', () => ({
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
const Empleado = require('../src/models/Empleado');
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

const mockEmpleado = {
  _id: 'e1',
  cedulaEmpleado: CEDULA_1,
  nombreEmpleado: 'Carlos Pérez',
  emailEmpleado: 'carlos@test.com',
  celularEmpleado: '0987654321',
  direccionEmpleado: 'Calle 1',
  sueldoEmpleado: 1500,
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

describe('Empleado API', () => {
  describe('GET /api/empleados', () => {
    test('returns list of empleados', async () => {
      // Arrange
      Empleado.find.mockResolvedValue([mockEmpleado]);

      // Act
      const res = await request(app)
        .get('/api/empleados')
        .set('Authorization', 'Bearer t');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([mockEmpleado]);
    });

    test('returns empty list', async () => {
      // Arrange
      Empleado.find.mockResolvedValue([]);

      // Act
      const res = await request(app)
        .get('/api/empleados')
        .set('Authorization', 'Bearer t');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns 500 on DB error', async () => {
      // Arrange
      Empleado.find.mockRejectedValue(new Error('DB fail'));

      // Act
      const res = await request(app)
        .get('/api/empleados')
        .set('Authorization', 'Bearer t');

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('DB fail');
    });
  });

  // ─── GET /api/empleados/:cedula ───
  describe('GET /api/empleados/:cedula', () => {
    test('returns empleado by cedula', async () => {
      // Arrange
      Empleado.findOne.mockResolvedValue(mockEmpleado);

      // Act
      const res = await request(app)
        .get(`/api/empleados/${CEDULA_1}`)
        .set('Authorization', 'Bearer t');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.nombreEmpleado).toBe('Carlos Pérez');
    });

    test('returns 404 if not found', async () => {
      // Arrange
      Empleado.findOne.mockResolvedValue(null);

      // Act
      const res = await request(app)
        .get('/api/empleados/0000000000')
        .set('Authorization', 'Bearer t');

      // Assert
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Empleado no encontrado');
    });

    test('returns 500 on DB error', async () => {
      // Arrange
      Empleado.findOne.mockRejectedValue(new Error('err'));

      // Act
      const res = await request(app)
        .get(`/api/empleados/${CEDULA_1}`)
        .set('Authorization', 'Bearer t');

      // Assert
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── POST /api/empleados ───
  describe('POST /api/empleados', () => {
    test('creates empleado successfully', async () => {
      // Arrange
      Empleado.findOne.mockResolvedValue(null);
      Empleado.create.mockResolvedValue(mockEmpleado);

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({
          cedulaEmpleado: CEDULA_1,
          nombreEmpleado: 'Carlos Pérez',
          celularEmpleado: '0987654321',
          sueldoEmpleado: 1500,
          emailEmpleado: 'carlos@test.com',
          direccionEmpleado: 'Calle 1',
        });

      // Assert
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Empleado creado con éxito');
      expect(res.body.empleado).toBeDefined();
    });

    test('creates empleado without optional fields', async () => {
      // Arrange
      Empleado.findOne.mockResolvedValue(null);
      Empleado.create.mockResolvedValue({
        ...mockEmpleado,
        emailEmpleado: '',
        direccionEmpleado: '',
      });

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({
          cedulaEmpleado: CEDULA_1,
          nombreEmpleado: 'Test',
          celularEmpleado: '0987654321',
          sueldoEmpleado: 1000,
        });

      // Assert
      expect(res.statusCode).toBe(201);
    });

    test('creates empleado with verifier=0 cedula', async () => {
      // Arrange
      Empleado.findOne.mockResolvedValue(null);
      Empleado.create.mockResolvedValue({
        ...mockEmpleado,
        cedulaEmpleado: CEDULA_3,
      });

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({
          cedulaEmpleado: CEDULA_3,
          nombreEmpleado: 'Test',
          celularEmpleado: '0912345678',
          sueldoEmpleado: 1000,
        });

      // Assert
      expect(res.statusCode).toBe(201);
    });

    test('fails with missing required fields', async () => {
      // Arrange
      // No setup needed - testing validation

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({ nombreEmpleado: 'Incompleto' });

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'Campos obligatorios faltantes (cédula, nombre, celular o sueldo)',
      );
    });

    test('fails with invalid cedula (not 10 digits)', async () => {
      // Arrange
      // Testing validation

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({
          cedulaEmpleado: '12345',
          nombreEmpleado: 'T',
          celularEmpleado: '0987654321',
          sueldoEmpleado: 1000,
        });

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cédula ecuatoriana inválida');
    });

    test('fails with invalid cedula (province > 24)', async () => {
      // Arrange
      // Testing validation

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({
          cedulaEmpleado: '2500000000',
          nombreEmpleado: 'T',
          celularEmpleado: '0987654321',
          sueldoEmpleado: 1000,
        });

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cédula ecuatoriana inválida');
    });

    test('fails with invalid cedula (province < 1)', async () => {
      // Arrange
      // Testing validation

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({
          cedulaEmpleado: '0012345678',
          nombreEmpleado: 'T',
          celularEmpleado: '0987654321',
          sueldoEmpleado: 1000,
        });

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cédula ecuatoriana inválida');
    });

    test('fails with invalid cedula (3rd digit >= 6)', async () => {
      // Arrange
      // Testing validation

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({
          cedulaEmpleado: '0160000000',
          nombreEmpleado: 'T',
          celularEmpleado: '0987654321',
          sueldoEmpleado: 1000,
        });

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cédula ecuatoriana inválida');
    });

    test('fails with invalid cedula (bad verifier)', async () => {
      // Arrange
      // Testing validation

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({
          cedulaEmpleado: '1713175072',
          nombreEmpleado: 'T',
          celularEmpleado: '0987654321',
          sueldoEmpleado: 1000,
        });

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cédula ecuatoriana inválida');
    });

    test('fails with invalid celular', async () => {
      // Arrange
      // Testing validation

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({
          cedulaEmpleado: CEDULA_1,
          nombreEmpleado: 'T',
          celularEmpleado: '1234567890',
          sueldoEmpleado: 1000,
        });

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'Número de celular inválido. Debe empezar con 09 y tener 10 dígitos',
      );
    });

    test('fails when empleado already exists (409)', async () => {
      // Arrange
      Empleado.findOne.mockResolvedValue(mockEmpleado);

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({
          cedulaEmpleado: CEDULA_1,
          nombreEmpleado: 'T',
          celularEmpleado: '0987654321',
          sueldoEmpleado: 1000,
        });

      // Assert
      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe('Ya existe un empleado con esa cédula');
    });

    test('fails with sueldo <= 0', async () => {
      // Arrange
      Empleado.findOne.mockResolvedValue(null);

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({
          cedulaEmpleado: CEDULA_1,
          nombreEmpleado: 'T',
          celularEmpleado: '0987654321',
          sueldoEmpleado: -100,
        });

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El sueldo debe ser mayor a 0');
    });

    test('fails with sueldo = 0', async () => {
      // Arrange
      Empleado.findOne.mockResolvedValue(null);

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({
          cedulaEmpleado: CEDULA_1,
          nombreEmpleado: 'T',
          celularEmpleado: '0987654321',
          sueldoEmpleado: 0,
        });

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El sueldo debe ser mayor a 0');
    });

    test('returns 400 on create error (catch)', async () => {
      // Arrange
      Empleado.findOne.mockResolvedValue(null);
      Empleado.create.mockRejectedValue(new Error('Create fail'));

      // Act
      const res = await request(app)
        .post('/api/empleados')
        .set('Authorization', 'Bearer t')
        .send({
          cedulaEmpleado: CEDULA_1,
          nombreEmpleado: 'T',
          celularEmpleado: '0987654321',
          sueldoEmpleado: 1000,
        });

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Create fail');
    });
  });

  // ─── PUT /api/empleados/:cedula ───
  describe('PUT /api/empleados/:cedula', () => {
    test('updates empleado successfully', async () => {
      // Arrange
      const updated = { ...mockEmpleado, nombreEmpleado: 'Updated' };
      Empleado.findOne.mockResolvedValue(mockEmpleado);
      Empleado.findOneAndUpdate.mockResolvedValue(updated);

      // Act
      const res = await request(app)
        .put(`/api/empleados/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({ newNombreEmpleado: 'Updated', newSueldoEmpleado: 2500 });

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Empleado actualizado con éxito');
      expect(res.body.empleado.nombreEmpleado).toBe('Updated');
    });

    test('returns 404 if not found', async () => {
      // Arrange
      Empleado.findOne.mockResolvedValue(null);

      // Act
      const res = await request(app)
        .put('/api/empleados/0000000000')
        .set('Authorization', 'Bearer t')
        .send({ newNombreEmpleado: 'Ghost' });

      // Assert
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Empleado no encontrado');
    });

    test('fails with invalid new sueldo (<= 0)', async () => {
      // Arrange
      Empleado.findOne.mockResolvedValue(mockEmpleado);

      // Act
      const res = await request(app)
        .put(`/api/empleados/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({ newSueldoEmpleado: -500 });

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El sueldo debe ser mayor a 0');
    });

    test('fails with invalid new celular', async () => {
      // Arrange
      Empleado.findOne.mockResolvedValue(mockEmpleado);

      // Act
      const res = await request(app)
        .put(`/api/empleados/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({ newCelularEmpleado: '1234567890' });

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'Número de celular inválido. Debe empezar con 09 y tener 10 dígitos',
      );
    });

    test('updates partial fields preserving others', async () => {
      // Arrange
      const updated = {
        ...mockEmpleado,
        emailEmpleado: 'new@test.com',
        sueldoEmpleado: 3000,
      };
      Empleado.findOne.mockResolvedValue(mockEmpleado);
      Empleado.findOneAndUpdate.mockResolvedValue(updated);

      // Act
      const res = await request(app)
        .put(`/api/empleados/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({ newEmailEmpleado: 'new@test.com', newSueldoEmpleado: 3000 });

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.empleado.emailEmpleado).toBe('new@test.com');
      expect(res.body.empleado.sueldoEmpleado).toBe(3000);
      expect(res.body.empleado.nombreEmpleado).toBe(
        mockEmpleado.nombreEmpleado,
      );
    });

    test('updates all fields', async () => {
      // Arrange
      const updated = {
        ...mockEmpleado,
        nombreEmpleado: 'New',
        emailEmpleado: 'e@e.com',
        celularEmpleado: '0912345678',
        direccionEmpleado: 'New Dir',
        sueldoEmpleado: 5000,
      };
      Empleado.findOne.mockResolvedValue(mockEmpleado);
      Empleado.findOneAndUpdate.mockResolvedValue(updated);

      // Act
      const res = await request(app)
        .put(`/api/empleados/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({
          newNombreEmpleado: 'New',
          newEmailEmpleado: 'e@e.com',
          newCelularEmpleado: '0912345678',
          newDireccionEmpleado: 'New Dir',
          newSueldoEmpleado: 5000,
        });

      // Assert
      expect(res.statusCode).toBe(200);
    });

    test('returns 500 on DB error (catch)', async () => {
      // Arrange
      Empleado.findOne.mockRejectedValue(new Error('err'));

      // Act
      const res = await request(app)
        .put(`/api/empleados/${CEDULA_1}`)
        .set('Authorization', 'Bearer t')
        .send({ newNombreEmpleado: 'X' });

      // Assert
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── DELETE /api/empleados/:cedula ───
  describe('DELETE /api/empleados/:cedula', () => {
    test('deletes empleado successfully', async () => {
      // Arrange
      Empleado.findOneAndDelete.mockResolvedValue(mockEmpleado);

      // Act
      const res = await request(app)
        .delete(`/api/empleados/${CEDULA_1}`)
        .set('Authorization', 'Bearer t');

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Empleado eliminado con éxito');
    });

    test('returns 404 if not found', async () => {
      // Arrange
      Empleado.findOneAndDelete.mockResolvedValue(null);

      // Act
      const res = await request(app)
        .delete('/api/empleados/0000000000')
        .set('Authorization', 'Bearer t');

      // Assert
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Empleado no encontrado');
    });

    test('returns 500 on DB error (catch)', async () => {
      // Arrange
      Empleado.findOneAndDelete.mockRejectedValue(new Error('err'));

      // Act
      const res = await request(app)
        .delete(`/api/empleados/${CEDULA_1}`)
        .set('Authorization', 'Bearer t');

      // Assert
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── Auth: only administrador can access empleados ───
  describe('Auth for empleados (admin-only)', () => {
    test('returns 403 if role is empleado (not admin)', async () => {
      // Arrange
      setupAuth('empleado');
      Empleado.find.mockResolvedValue([]);

      // Act
      const res = await request(app)
        .get('/api/empleados')
        .set('Authorization', 'Bearer t');

      // Assert
      expect(res.statusCode).toBe(403);
      expect(res.body.msg).toMatch(/Acceso denegado/);
    });

    test('returns 403 if role is cliente', async () => {
      // Arrange
      setupAuth('cliente');

      // Act
      const res = await request(app)
        .get('/api/empleados')
        .set('Authorization', 'Bearer t');

      // Assert
      expect(res.statusCode).toBe(403);
    });
  });
});
