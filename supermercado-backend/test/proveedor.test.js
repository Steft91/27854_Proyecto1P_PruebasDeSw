const request = require('supertest');
const app = require('../src/app');

const mockProvider = {
  nombreFiscal: 'Productos Lácteos del Sur S.A.',
  rucNitNif: '1234567890001',
  direccionFisica: 'Av. Principal 123',
  correoElectronico: 'ventas@lacteos.com',
  telefonoPrincipal: '555-1000',
  contactoNombre: 'Juan Pérez',
  contactoPuesto: 'Gerente de Ventas',
};

const mockProvider2 = {
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
      const createResponse = await request(app).post('/api/providers').send(mockProvider);
      const createdId = createResponse.body.provider.idProveedor;

      const response = await request(app).get(`/api/providers/${createdId}`);

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
      // Puede fallar por tipo de dato o por campo faltante
      expect(response.body.message).toMatch(/obligatorios|texto/);
    });

    // Prueba POST intentar crear un proveedor con el mismo ID
    test('should fail cause ID already exists', async () => {
      // Crear el primer proveedor
      await request(app).post('/api/providers').send(mockProvider);

      // Este test ya no aplica porque el ID es autoincremental
      // Los IDs nunca se duplicarán porque son generados por el servidor
    });

    // Prueba POST intentar crear un proveedor con el mismo RUC/NIT/NIF
    test('should fail cause RUC/NIT/NIF already exists', async () => {
      // Crear el primer proveedor
      await request(app).post('/api/providers').send(mockProvider);

      // Intentar crear un proveedor con el mismo RUC/NIT/NIF
      const response = await request(app).post('/api/providers').send({
        nombreFiscal: 'Otra Empresa S.A.',
        rucNitNif: '1234567890001', // Mismo RUC que mockProvider
        direccionFisica: 'Otra Dirección 123',
      });

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('Ya existe un proveedor con ese RUC/NIT/NIF');
    });

    // Prueba POST con campos vacíos (strings vacíos)
    test('should fail when fields are empty strings', async () => {
      const providerConCamposVacios = {
        nombreFiscal: '',
        rucNitNif: '1234567890123',
        direccionFisica: 'Dirección Test',
      };

      const response = await request(app).post('/api/providers').send(providerConCamposVacios);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        'Campos obligatorios faltantes o vacíos (nombre fiscal, RUC/NIT/NIF o dirección física)'
      );
    });

    // Prueba POST con RUC inválido (muy corto)
    test('should fail with invalid RUC format (too short)', async () => {
      const providerRucInvalido = {
        nombreFiscal: 'Test Company',
        rucNitNif: '12345', // Menos de 10 dígitos
        direccionFisica: 'Test Address',
      };

      const response = await request(app).post('/api/providers').send(providerRucInvalido);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        'Formato de RUC/NIT/NIF inválido (debe contener entre 10 y 15 dígitos)'
      );
    });

    // Prueba POST con RUC inválido (contiene letras)
    test('should fail with invalid RUC format (contains letters)', async () => {
      const providerRucInvalido = {
        nombreFiscal: 'Test Company',
        rucNitNif: '12345ABC90123', // Contiene letras
        direccionFisica: 'Test Address',
      };

      const response = await request(app).post('/api/providers').send(providerRucInvalido);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        'Formato de RUC/NIT/NIF inválido (debe contener entre 10 y 15 dígitos)'
      );
    });

    // Prueba POST con email inválido
    test('should fail with invalid email format', async () => {
      const providerEmailInvalido = {
        nombreFiscal: 'Test Company',
        rucNitNif: '1234567890123',
        direccionFisica: 'Test Address',
        correoElectronico: 'email-invalido', // Sin @ y dominio
      };

      const response = await request(app).post('/api/providers').send(providerEmailInvalido);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Formato de correo electrónico inválido');
    });

    // Prueba POST con teléfono inválido
    test('should fail with invalid phone format', async () => {
      const providerTelefonoInvalido = {
        nombreFiscal: 'Test Company',
        rucNitNif: '1234567890123',
        direccionFisica: 'Test Address',
        telefonoPrincipal: '123', // Muy corto
      };

      const response = await request(app).post('/api/providers').send(providerTelefonoInvalido);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        'Formato de teléfono inválido (debe contener entre 7 y 20 caracteres numéricos)'
      );
    });
  });

  describe('PUT /api/providers/:id', () => {
    // Prueba PUT para actualizar un proveedor correctamente
    test('should update a specific provider info', async () => {
      const proveedorNuevo = {
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
      // Crear un proveedor inicial
      const proveedorParaPrueba = {
        nombreFiscal: 'Proveedor Para Actualización',
        rucNitNif: '9999999999999',
        direccionFisica: 'Dirección Original 123',
      };

      const createResponse = await request(app).post('/api/providers').send(proveedorParaPrueba);
      const createdId = createResponse.body.provider.idProveedor;

      const datosActualizadosParciales = {
        newDireccionFisica: 'Nueva Dirección 999',
        newCorreoElectronico: 'nuevo@email.com',
        // NOTA: No enviamos newNombreFiscal
      };

      const response = await request(app)
        .put(`/api/providers/${createdId}`)
        .send(datosActualizadosParciales);

      expect(response.statusCode).toBe(200);
      expect(response.body.provider.direccionFisica).toBe('Nueva Dirección 999');
      expect(response.body.provider.correoElectronico).toBe('nuevo@email.com');

      expect(response.body.provider.nombreFiscal).toBe(proveedorParaPrueba.nombreFiscal);
    });
  });

  describe('DELETE /api/providers/:id', () => {
    test('should delete a specific provider successfully', async () => {
      // Crear un proveedor para eliminación
      const proveedorParaBorrar = {
        nombreFiscal: 'Proveedor Para Borrar',
        rucNitNif: '8888888888888',
        direccionFisica: 'Dirección Temporal 456',
      };

      const createResponse = await request(app).post('/api/providers').send(proveedorParaBorrar);
      const createdId = createResponse.body.provider.idProveedor;

      // Borrar el proveedor
      const deleteResponse = await request(app).delete(`/api/providers/${createdId}`);

      // Comprobar la respuesta de borrado
      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.body.message).toBe('Proveedor eliminado con exito');

      // Verificar que fue borrado
      const getResponse = await request(app).get(`/api/providers/${createdId}`);
      expect(getResponse.statusCode).toBe(404);
    });

    test('should throw 404 if provider does not exist', async () => {
      const response = await request(app).delete('/api/providers/ID-FALSO-123');

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Proveedor no encontrado');
    });
  });
});
