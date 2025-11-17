const request = require('supertest');
const app = require('../src/app');

const mockEmpleado = {
  cedulaEmpleado: '1234567890',
  nombreEmpleado: 'Carlos Pérez',
  emailEmpleado: 'carlos@test.com',
  celularEmpleado: '0987654321',
  sueldoEmpleado: 1500.5,
};

const mockEmpleado2 = {
  cedulaEmpleado: '0987654321',
  nombreEmpleado: 'María González',
  celularEmpleado: '0912345678',
  sueldoEmpleado: 2000.0,
};

describe('Empleado API', () => {
  describe('GET /api/empleados', () => {
    test('should return an empty list initially', async () => {
      const response = await request(app).get('/api/empleados');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('should find an empleado if empleado exists', async () => {
      await request(app).post('/api/empleados').send(mockEmpleado);

      const response = await request(app).get(`/api/empleados/${mockEmpleado.cedulaEmpleado}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.nombreEmpleado).toBe(mockEmpleado.nombreEmpleado);
    });

    test('should throw 404 if empleado cedula does not exist', async () => {
      const response = await request(app).get('/api/empleados/9999999999');

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Empleado no encontrado');
    });
  });

  describe('POST /api/empleados', () => {
    test('should create a new empleado successfully', async () => {
      const response = await request(app).post('/api/empleados').send(mockEmpleado2);
      expect(response.statusCode).toBe(201);
      expect(response.body.empleado).toBeDefined();
      expect(response.body.empleado).toHaveProperty('cedulaEmpleado');
      expect(response.body.empleado.nombreEmpleado).toBe('María González');
    });

    test('should fail because data is missing', async () => {
      const empleadoIncompleto = {
        nombreEmpleado: 'Incompleto',
      };

      const response = await request(app).post('/api/empleados').send(empleadoIncompleto);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        'Campos obligatorios faltantes (cédula, nombre, celular o sueldo)'
      );
    });

    test('should fail because cedula already exists', async () => {
      await request(app).post('/api/empleados').send(mockEmpleado);

      const response = await request(app)
        .post('/api/empleados')
        .send({
          ...mockEmpleado2,
          cedulaEmpleado: '1234567890',
        });

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('Ya existe un empleado con esa cédula');
    });

    test('should fail because cedula is invalid', async () => {
      const empleadoCedulaInvalida = {
        cedulaEmpleado: '12345',
        nombreEmpleado: 'Test',
        celularEmpleado: '0987654321',
        sueldoEmpleado: 1500,
      };

      const response = await request(app).post('/api/empleados').send(empleadoCedulaInvalida);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Cédula ecuatoriana inválida (debe tener 10 dígitos)');
    });

    test('should fail because salary is negative', async () => {
      const empleadoSueldoNegativo = {
        cedulaEmpleado: '1111111111',
        nombreEmpleado: 'Test',
        celularEmpleado: '0987654321',
        sueldoEmpleado: -100,
      };

      const response = await request(app).post('/api/empleados').send(empleadoSueldoNegativo);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('El sueldo debe ser mayor a 0');
    });
  });

  describe('PUT /api/empleados/:cedula', () => {
    test('should update a specific empleado info', async () => {
      const empleadoNuevo = {
        cedulaEmpleado: '1717171717',
        nombreEmpleado: 'Ana Prueba',
        celularEmpleado: '0998877665',
        sueldoEmpleado: 1800,
      };

      const postRes = await request(app).post('/api/empleados').send(empleadoNuevo);
      const cedula = postRes.body.empleado.cedulaEmpleado;

      const datosActualizados = {
        newNombreEmpleado: 'Ana Actualizada',
        newSueldoEmpleado: 2500,
      };

      const response = await request(app).put(`/api/empleados/${cedula}`).send(datosActualizados);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Empleado actualizado con éxito');
      expect(response.body.empleado.nombreEmpleado).toBe('Ana Actualizada');
      expect(response.body.empleado.sueldoEmpleado).toBe(2500);
    });

    test('should throw 404 if empleado does not exist', async () => {
      const cedulaInexistente = '9999999999';
      const datosActualizados = {
        newNombreEmpleado: 'Empleado Fantasma',
      };

      const res = await request(app)
        .put(`/api/empleados/${cedulaInexistente}`)
        .send(datosActualizados);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Empleado no encontrado');
    });

    test('should update only new data and preserve the old ones', async () => {
      await request(app).post('/api/empleados').send(mockEmpleado);

      const datosActualizadosParciales = {
        newEmailEmpleado: 'nuevo@email.com',
        newSueldoEmpleado: 3000,
      };

      const response = await request(app)
        .put(`/api/empleados/${mockEmpleado.cedulaEmpleado}`)
        .send(datosActualizadosParciales);

      expect(response.statusCode).toBe(200);
      expect(response.body.empleado.emailEmpleado).toBe('nuevo@email.com');
      expect(response.body.empleado.sueldoEmpleado).toBe(3000);
      expect(response.body.empleado.nombreEmpleado).toBe(mockEmpleado.nombreEmpleado);
    });

    test('should fail when updating with negative salary', async () => {
      await request(app).post('/api/empleados').send(mockEmpleado);

      const datosInvalidos = {
        newSueldoEmpleado: -500,
      };

      const response = await request(app)
        .put(`/api/empleados/${mockEmpleado.cedulaEmpleado}`)
        .send(datosInvalidos);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('El sueldo debe ser mayor a 0');
    });

    test('should update only celular and preserve salary', async () => {
      const empleadoPrueba = {
        cedulaEmpleado: '1919191919',
        nombreEmpleado: 'Test Celular',
        celularEmpleado: '0900000001',
        sueldoEmpleado: 1000,
      };
      await request(app).post('/api/empleados').send(empleadoPrueba);

      const datosActualizados = {
        newCelularEmpleado: '0911111111',
      };

      const response = await request(app)
        .put(`/api/empleados/${empleadoPrueba.cedulaEmpleado}`)
        .send(datosActualizados);

      expect(response.statusCode).toBe(200);
      expect(response.body.empleado.celularEmpleado).toBe('0911111111');
      expect(response.body.empleado.sueldoEmpleado).toBe(1000); 
      expect(response.body.empleado.nombreEmpleado).toBe('Test Celular');
    });

  });

  describe('DELETE /api/empleados/:cedula', () => {
    test('should delete a specific empleado successfully', async () => {
      await request(app).post('/api/empleados').send(mockEmpleado);

      const deleteResponse = await request(app).delete(
        `/api/empleados/${mockEmpleado.cedulaEmpleado}`
      );

      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.body.message).toBe('Empleado eliminado con éxito');

      const getResponse = await request(app).get(`/api/empleados/${mockEmpleado.cedulaEmpleado}`);
      expect(getResponse.statusCode).toBe(404);
    });

    test('should throw 404 if empleado does not exist', async () => {
      const response = await request(app).delete('/api/empleados/9999999999');

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Empleado no encontrado');
    });

    test('should verify empleado list is updated after deletion', async () => {
      // Obtener la cantidad inicial de empleados
      const initialResponse = await request(app).get('/api/empleados');
      const initialCount = initialResponse.body.length;

      // Crear dos nuevos empleados con cédulas únicas para este test
      const empleadoTest1 = {
        cedulaEmpleado: '1111111111',
        nombreEmpleado: 'Test Uno',
        celularEmpleado: '0999999991',
        sueldoEmpleado: 1000.0,
      };
      const empleadoTest2 = {
        cedulaEmpleado: '2222222222',
        nombreEmpleado: 'Test Dos',
        celularEmpleado: '0999999992',
        sueldoEmpleado: 1000.0,
      };

      await request(app).post('/api/empleados').send(empleadoTest1);
      await request(app).post('/api/empleados').send(empleadoTest2);

      let listResponse = await request(app).get('/api/empleados');
      expect(listResponse.body.length).toBe(initialCount + 2);

      // Eliminar uno de los empleados de prueba
      await request(app).delete(`/api/empleados/${empleadoTest1.cedulaEmpleado}`);

      listResponse = await request(app).get('/api/empleados');
      expect(listResponse.body.length).toBe(initialCount + 1);

      // Verificar que el empleado correcto sigue existiendo
      const remainingEmpleado = listResponse.body.find(
        (e) => e.cedulaEmpleado === empleadoTest2.cedulaEmpleado
      );
      expect(remainingEmpleado).toBeDefined();
      expect(remainingEmpleado.cedulaEmpleado).toBe(empleadoTest2.cedulaEmpleado);
    });
  });
});
