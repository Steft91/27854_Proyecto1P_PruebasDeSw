const request = require('supertest');
const app = require('../src/app');

const mockClient = {
    dniClient: '12345678Z',
    nameClient: 'Marcos',
    surnameClient: 'Escobar',
    addressClient: 'Avenida Siempre Viva 742',
    emailClient: 'marcos@test.com',
    phoneClient: '555-0101'
};

const mockClient2 = {
    dniClient: '87654321G',
    nameClient: 'Stefany',
    surnameClient: 'Díaz',
    addressClient: 'Calle Falsa 123',
    emailClient: 'stefy@test.com'
};

describe('Client API', () => {
    describe('GET /api/clients', () => {
        test('should return an empty list initially', async () => {
            const response = await request(app).get('/api/clients');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([]);
        });

        test('should find a client if client exist', async () => {
            await request(app).post('/api/clients').send(mockClient);

            const response = await request(app).get(`/api/clients/${mockClient.dniClient}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.nameClient).toBe(mockClient.nameClient);
        });

        test('should throw 404 if client DNI does not exist', async () => {
            const response = await request(app).get('/api/clients/DNI-FALSO-123');

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Cliente no encontrado');
        });
    });

    describe('POST /api/clients', () => {
        //Prueba POST crear nuevo cliente correctamente
        test('should create a new client succesfully', async () => {
            const response = await request(app).post('/api/clients').send(mockClient2);
            expect(response.statusCode).toBe(201);
            expect(response.body.client).toBeDefined();
            expect(response.body.client).toHaveProperty('dniClient');
            expect(response.body.client.nameClient).toBe('Stefany');
        });
    
        //Prueba POST crear cliente sin todos los parametros
        test('should fail cause data is missing', async () => {
            const clientIncompleto = {
                nameClient: 'Incompleto'
                // Faltan dniClient, surnameClient, addressClient
            };
    
            const response = await request(app)
                .post('/api/clients')
                .send(clientIncompleto);
            
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toMatch(/Campos obligatorios faltantes/);
        });
    
        //Prueba POST intentar crear un cliente con el mismo DNI
        test('should fail cause DNI already exist', async () => {
            // Intentamos crearlo, si falla es que ya existe, si no, se crea.
            await request(app).post('/api/clients').send(mockClient).catch(e => {}); 

            //Intentar crear un cliente con el mismo DNI
            const response = await request(app).post('/api/clients').send({ ...mockClient2, dniClient: '12345678Z' });
            
            expect(response.statusCode).toBe(409);
            expect(response.body.message).toBe('Ya existe un cliente con ese DNI');
        });

        test('should fail if email format is invalid', async () => {
            const invalidEmailClient = { 
                ...mockClient, 
                dniClient: 'EMAIL-FAIL-1', 
                emailClient: 'esto-no-es-un-email' 
            };

            const response = await request(app).post('/api/clients').send(invalidEmailClient);
            
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('El formato del email no es válido');
        });

        test('should fail if phone format is invalid', async () => {
            const invalidPhoneClient = { 
                ...mockClient, 
                dniClient: 'PHONE-FAIL-1', 
                phoneClient: 'solo-letras-aqui' 
            };

            const response = await request(app).post('/api/clients').send(invalidPhoneClient);
            
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('El formato del teléfono no es válido');
        });

        test('should fail if required fields contain only whitespace', async () => {
            const emptySpaceClient = {
                dniClient: 'SPACE-TEST',
                nameClient: '   ', // Solo espacios
                surnameClient: 'Valid',
                addressClient: 'Valid'
            };

            const response = await request(app).post('/api/clients').send(emptySpaceClient);

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toContain('deben ser texto válido y no estar vacíos');
        });

        test('should trim whitespace from input fields automatically', async () => {
            const messyClient = {
                dniClient: '  TRIM-TEST  ',
                nameClient: '  Juan  ',
                surnameClient: '  Perez  ',
                addressClient: ' Calle 1 ',
                emailClient: ' juan@test.com '
            };

            const response = await request(app).post('/api/clients').send(messyClient);

            expect(response.statusCode).toBe(201);
            expect(response.body.client.dniClient).toBe('TRIM-TEST'); // Sin espacios
            expect(response.body.client.nameClient).toBe('Juan');       // Sin espacios
            expect(response.body.client.emailClient).toBe('juan@test.com');
        });
    });

    describe('PUT /api/clients/:dni', () => {
        //Prueba PUT para actualizar un cliente correctamente
        test('PUT /api/clients should update a specific client info', async () => {
            const clienteNuevo = {
                dniClient: '98765432A',
                nameClient: 'Ana',
                surnameClient: 'Prueba',
                addressClient: 'Calle Falsa 123'
            };
    
            const postRes = await request(app).post('/api/clients').send(clienteNuevo);
            const dni = postRes.body.client.dniClient;
    
            const datosActualizados = {
                newNameClient: 'Ana Actualizada',
                newPhoneClient: '555-1234'
            };
    
            const response = await request(app).put(`/api/clients/${dni}`).send(datosActualizados);
    
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Cliente actualizado con exito');
            expect(response.body.client.nameClient).toBe('Ana Actualizada');
            expect(response.body.client.phoneClient).toBe('555-1234');
            expect(response.body.client.surnameClient).toBe('Prueba');
        });
    
        //Prueba PUT intento de actualizar un cliente inexistente
        test('should throw 404 if client does not exist', async () => {
            const dniInexistente = '111111-NO-EXISTE';
            const datosActualizados = {
                newNameClient: 'Cliente Fantasma'
            };
    
            const res = await request(app)
                .put(`/api/clients/${dniInexistente}`)
                .send(datosActualizados);
    
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Cliente no encontrado');
        });

        test('should update only new data and perserve the old ones', async () => {
            // Crear el cliente original
            const clientForUpdate = { ...mockClient, dniClient: 'UPDATE-TEST-1' };
            await request(app).post('/api/clients').send(clientForUpdate);
            
            const datosActualizadosParciales = {
                newSurnameClient: 'Test Actualizado',
                newEmailClient: 'nuevo@email.com'
                // No enviamos newNameClient
            };

            const response = await request(app)
                .put(`/api/clients/${clientForUpdate.dniClient}`)
                .send(datosActualizadosParciales);

            expect(response.statusCode).toBe(200);
            expect(response.body.client.surnameClient).toBe('Test Actualizado');
            expect(response.body.client.emailClient).toBe('nuevo@email.com');
            expect(response.body.client.nameClient).toBe(clientForUpdate.nameClient); 
        });

        test('should fail update if new email format is invalid', async () => {
            // Usamos un cliente existente
            const dni = '98765432A';
            
            const badUpdate = { newEmailClient: 'correo-malo' };

            const response = await request(app).put(`/api/clients/${dni}`).send(badUpdate);

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('El nuevo email no tiene un formato válido');
        });

        test('should fail update if name becomes empty string', async () => {
            const dni = '98765432A';
            
            const badUpdate = { newNameClient: '   ' }; // Solo espacios

            const response = await request(app).put(`/api/clients/${dni}`).send(badUpdate);

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('El nombre o apellido no pueden quedar vacíos');
        });

        test('should trim data on update', async () => {
            const dni = '98765432A';
            const messyUpdate = { newNameClient: '  Ana Limpia  ' };

            const response = await request(app).put(`/api/clients/${dni}`).send(messyUpdate);

            expect(response.statusCode).toBe(200);
            expect(response.body.client.nameClient).toBe('Ana Limpia'); // Sin espacios extra
        });
    });

    describe('DELETE /api/clients/:dni', () => {
        test('should delete a specific client successfully', async () => {
            // Crear cliente especifico para borrar
            const deleteTarget = { ...mockClient, dniClient: 'TO-DELETE-1' };
            await request(app).post('/api/clients').send(deleteTarget);

            // Borrar el cliente
            const deleteResponse = await request(app)
                .delete(`/api/clients/${deleteTarget.dniClient}`);

            // Comprobar la respuesta de borrado
            expect(deleteResponse.statusCode).toBe(200);
            expect(deleteResponse.body.message).toBe('Cliente eliminado con exito');

            // Verificar que fue borrado
            const getResponse = await request(app).get(`/api/clients/${deleteTarget.dniClient}`);
            expect(getResponse.statusCode).toBe(404);
        });

        test('should throw 404 if client does not exist', async () => {
            const response = await request(app).delete('/api/clients/DNI-FALSO-123');

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Cliente no encontrado');
        });
    });
});

describe('app 404 Handler', () => {
    test('should return 404 for a non-existent route', async () => {
        const response = await request(app).get('/api/ruta-inventada-que-no-existe'); 

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Ruta no encontrada');
    });
});