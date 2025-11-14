const request = require('supertest');
const app = require('../src/app');

const mockProvider = {
  idProveedor: 'PROV001',
  nombreFiscal: 'Productos Lácteos del Sur S.A.',
  rucNitNif: '1234567890001',
  direccionFisica: 'Av. Principal 123',
  correoElectronico: 'ventas@lacteos.com',
  telefonoPrincipal: '555-1000',
  contactoNombre: 'Juan Pérez',
  contactoPuesto: 'Gerente de Ventas',
};

const mockProvider2 = {
  idProveedor: 'PROV002',
  nombreFiscal: 'Distribuidora Nacional de Alimentos',
  rucNitNif: '9876543210001',
  direccionFisica: 'Calle Secundaria 456',
  correoElectronico: 'contacto@distrinacional.com',
};

describe('Provider API', () => {
  describe('GET /api/providers', () => {
    test('should return an empty list initially', async () => {
      const response = await request(app).get('/api/providers');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('should find a provider if provider exists', async () => {
      await request(app).post('/api/providers').send(mockProvider);

      const response = await request(app).get(`/api/providers/${mockProvider.idProveedor}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.nombreFiscal).toBe(mockProvider.nombreFiscal);
    });

    test('should throw 404 if provider ID does not exist', async () => {
      const response = await request(app).get('/api/providers/ID-FALSO-123');

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Proveedor no encontrado');
    });
  });

  describe('POST /api/providers', () => {
    // Prueba POST crear nuevo proveedor correctamente
    test('should create a new provider successfully', async () => {
      const response = await request(app).post('/api/providers').send(mockProvider2);
      expect(response.statusCode).toBe(201);
      expect(response.body.provider).toBeDefined();
      expect(response.body.provider).toHaveProperty('idProveedor');
      expect(response.body.provider.nombreFiscal).toBe('Distribuidora Nacional de Alimentos');
    });

    // Prueba POST crear proveedor sin todos los parámetros
    test('should fail cause data is missing', async () => {
      const providerIncompleto = {
        nombreFiscal: 'Incompleto',
        // Faltan idProveedor, rucNitNif, direccionFisica
      };

      const response = await request(app).post('/api/providers').send(providerIncompleto);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        'Campos obligatorios faltantes (ID, nombre fiscal, RUC/NIT/NIF o dirección física)'
      );
    });

    // Prueba POST intentar crear un proveedor con el mismo ID
    test('should fail cause ID already exists', async () => {
      // Crear el primer proveedor
      await request(app).post('/api/providers').send(mockProvider);

      // Intentar crear un proveedor con el mismo ID
      const response = await request(app)
        .post('/api/providers')
        .send({
          ...mockProvider2,
          idProveedor: 'PROV001',
        });

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('Ya existe un proveedor con ese ID');
    });

    // Prueba POST intentar crear un proveedor con el mismo RUC/NIT/NIF
    test('should fail cause RUC/NIT/NIF already exists', async () => {
      // Crear el primer proveedor
      await request(app).post('/api/providers').send(mockProvider);

      // Intentar crear un proveedor con el mismo RUC/NIT/NIF
      const response = await request(app)
        .post('/api/providers')
        .send({
          ...mockProvider2,
          rucNitNif: '1234567890001',
        });

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('Ya existe un proveedor con ese RUC/NIT/NIF');
    });
  });

  describe('PUT /api/providers/:id', () => {
    // Prueba PUT para actualizar un proveedor correctamente
    test('should update a specific provider info', async () => {
      const proveedorNuevo = {
        idProveedor: 'PROV003',
        nombreFiscal: 'Empresa de Prueba S.A.',
        rucNitNif: '5555555555001',
        direccionFisica: 'Calle Test 789',
      };

      const postRes = await request(app).post('/api/providers').send(proveedorNuevo);

      const id = postRes.body.provider.idProveedor;

      const datosActualizados = {
        newNombreFiscal: 'Empresa de Prueba Actualizada S.A.',
        newTelefonoPrincipal: '555-2000',
      };

      const response = await request(app).put(`/api/providers/${id}`).send(datosActualizados);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Proveedor actualizado con exito');
      expect(response.body.provider.nombreFiscal).toBe('Empresa de Prueba Actualizada S.A.');
      expect(response.body.provider.telefonoPrincipal).toBe('555-2000');
      expect(response.body.provider.rucNitNif).toBe('5555555555001');
    });

    // Prueba PUT intento de actualizar un proveedor inexistente
    test('should throw 404 if provider does not exist', async () => {
      const idInexistente = 'PROV-NO-EXISTE';
      const datosActualizados = {
        newNombreFiscal: 'Proveedor Fantasma',
      };

      const res = await request(app).put(`/api/providers/${idInexistente}`).send(datosActualizados);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Proveedor no encontrado');
    });

    test('should update only new data and preserve the old ones', async () => {
      // Crear el proveedor original
      await request(app).post('/api/providers').send(mockProvider);

      const datosActualizadosParciales = {
        newDireccionFisica: 'Nueva Dirección 999',
        newCorreoElectronico: 'nuevo@email.com',
        // NOTA: No enviamos newNombreFiscal
      };

      const response = await request(app)
        .put(`/api/providers/${mockProvider.idProveedor}`)
        .send(datosActualizadosParciales);

      expect(response.statusCode).toBe(200);
      expect(response.body.provider.direccionFisica).toBe('Nueva Dirección 999');
      expect(response.body.provider.correoElectronico).toBe('nuevo@email.com');

      expect(response.body.provider.nombreFiscal).toBe(mockProvider.nombreFiscal);
    });
  });

  describe('DELETE /api/providers/:id', () => {
    test('should delete a specific provider successfully', async () => {
      // Crear el proveedor
      await request(app).post('/api/providers').send(mockProvider);

      // Borrar el proveedor
      const deleteResponse = await request(app).delete(
        `/api/providers/${mockProvider.idProveedor}`
      );

      // Comprobar la respuesta de borrado
      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.body.message).toBe('Proveedor eliminado con exito');

      // Verificar que fue borrado
      const getResponse = await request(app).get(`/api/providers/${mockProvider.idProveedor}`);
      expect(getResponse.statusCode).toBe(404);
    });

    test('should throw 404 if provider does not exist', async () => {
      const response = await request(app).delete('/api/providers/ID-FALSO-123');

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Proveedor no encontrado');
    });
  });
});
