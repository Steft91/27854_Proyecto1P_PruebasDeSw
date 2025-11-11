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
    dniClient: '87654321A',
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
            expect(response.body.message).toBe('Campos obligatorios faltantes (DNI, nombre, apellido o dirección)');
        });
    
        //Prueba POST intentar crear un cliente con el mismo DNI
        test('should fail cause DNI already exist', async () => {
            // Crear el primer cliente
            await request(app).post('/api/clients').send(mockClient);

            //Intentar crear un cliente con el mismo DNI
            const response = await request(app).post('/api/clients').send({ ...mockClient2, dniClient: '12345678Z' });
            
            expect(response.statusCode).toBe(409);
            expect(response.body.message).toBe('Ya existe un cliente con ese DNI');
        });

        
    });

    describe('PUT /api/clients:dni', () => {
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
            await request(app).post('/api/clients').send(mockClient);
            
            const datosActualizadosParciales = {
                newSurnameClient: 'Test Actualizado',
                newEmailClient: 'nuevo@email.com'
                // NOTA: No enviamos newNameClient
            };

            const response = await request(app)
                .put(`/api/clients/${mockClient.dniClient}`)
                .send(datosActualizadosParciales);

            expect(response.statusCode).toBe(200);
            expect(response.body.client.surnameClient).toBe('Test Actualizado');
            expect(response.body.client.emailClient).toBe('nuevo@email.com');

            expect(response.body.client.nameClient).toBe(mockClient.nameClient); 
        });
    });

    describe('DELETE /api/clients/:dni', () => {
        test('should delete a specific client successfully', async () => {
            // Crear el cliente
            await request(app).post('/api/clients').send(mockClient);

            // Borrar el cliente
            const deleteResponse = await request(app)
                .delete(`/api/clients/${mockClient.dniClient}`);

            // Comprobar la respuesta de borrado
            expect(deleteResponse.statusCode).toBe(200);
            expect(deleteResponse.body.message).toBe('Cliente eliminado con exito');

            // Verificar que fue borrado
            const getResponse = await request(app).get(`/api/clients/${mockClient.dniClient}`);
            expect(getResponse.statusCode).toBe(404);
        });

        test('should throw 404 if client does not exist', async () => {
            const response = await request(app).delete('/api/clients/DNI-FALSO-123');

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Cliente no encontrado');
        });
    });
});

describe('App 404 Handler', () => {
    test('should return 404 for a non-existent route', async () => {
        // Hacemos una petición a una ruta que sabemos que no existe
        const response = await request(app).get('/api/ruta-inventada-que-no-existe'); 

        // Verificamos que la respuesta sea el 404
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Ruta no encontrada');
    });
});