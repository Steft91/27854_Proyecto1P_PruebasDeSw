const request = require('supertest');
const app = require('../src/app');

const mockProduct = {
    codeProduct: 'PROD001',
    nameProduct: 'Leche',
    descriptionProduct: 'Leche descremada',
    priceProduct: 2.50,
    stockProduct: 100
};

const mockProduct2 = {
    codeProduct: 'PROD002',
    nameProduct: 'Pan',
    descriptionProduct: 'Pan integral',
    priceProduct: 1.50,
    stockProduct: 50
};

describe('Product API', () => {
    describe('GET /api/products', () => {
        test('should return an empty list initially', async () => {
            const response = await request(app).get('/api/products');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([]);
        });

        test('should find a product if product exist', async () => {
            await request(app).post('/api/products').send(mockProduct);

            const response = await request(app).get(`/api/products/${mockProduct.codeProduct}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.nameProduct).toBe(mockProduct.nameProduct);
        });

        test('should throw 404 if product code does not exist', async () => {
            const response = await request(app).get('/api/products/CODEFALSO123');

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Producto no encontrado');
        });

    });
});

describe('POST /api/products', () => {
    //Prueba POST crear nuevo producto correctamente
    test('should create a new product succesfully', async () => {
        const response = await request(app).post('/api/products').send(mockProduct2);
        expect(response.statusCode).toBe(201);
        expect(response.body.product).toBeDefined();
        expect(response.body.product).toHaveProperty('codeProduct');
        expect(response.body.product.nameProduct).toBe('Pan');
    });   
    //Prueba POST crear producto sin todos los parametros
    test('should fail cause data is missing', async () => {
        const incompleteProduct = {
            codeProduct: 'PROD003',
            nameProduct: 'Incompleto'
            // Faltan descriptionProduct, priceProduct, stockProduct
        };
        const response = await request(app).post('/api/products').send(incompleteProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Faltan datos obligatorios del producto');
    }); 

    //Prueba POST crear producto con código en formato incorrecto
    test('should fail cause code format is incorrect', async () => {
        const invalidCodeProduct = {    
            codeProduct: 'PROD', // Formato inválido
            nameProduct: 'Producto con código inválido',
            descriptionProduct: 'Descripción',
            priceProduct: 10.99,
            stockProduct: 50,
        };
        const response = await request(app).post('/api/products').send(invalidCodeProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Formato de código inválido (use LETRAS + NUMEROS, ej: PROD001)');
    });

    //Prueba POST crear producto con precio negativo
    test('should fail cause price is negative', async () => {
        const negativePriceProduct = {
            codeProduct: 'PROD004',
            nameProduct: 'Producto con precio negativo',
            descriptionProduct: 'Descripción',
            priceProduct: -10.99,
            stockProduct: 50,
        };
        const response = await request(app).post('/api/products').send(negativePriceProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Precio no puede ser negativo');
    });

    //Prueba POST crear producto con stock negativo
    test('should fail cause stock is negative', async () => {
        const negativeStockProduct = {
            codeProduct: 'PROD005',
            nameProduct: 'Producto con stock negativo',
            descriptionProduct: 'Descripción',
            priceProduct: 10.99,
            stockProduct: -50,
        };
        const response = await request(app).post('/api/products').send(negativeStockProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Stock no puede ser negativo');
    });

    //Prueba POST intentar crear un producto con el mismo código
    test('should fail cause code already exist', async () => {
        // Crear el primer producto
        await request(app).post('/api/products').send(mockProduct);

        // Intentar crear un producto con el mismo código
        const response = await request(app).post('/api/products').send(mockProduct2);

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe('Ya existe un producto con ese código');
    });

    //Prueba POST crear producto con nombre no texto
    test('should fail cause name is not text', async () => {
        const nonTextNameProduct = {    
            codeProduct: 'PROD006',
            nameProduct: 123, // No es texto
            descriptionProduct: 'Descripción',
            priceProduct: 10.99,
            stockProduct: 50,
        };
        const response = await request(app).post('/api/products').send(nonTextNameProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El nombre del producto debe ser texto');
    });

    //Prueba POST crear producto con descripción no texto
    test('should fail cause description is not text', async () => {
        const nonTextDescriptionProduct = {    
            codeProduct: 'PROD007',
            nameProduct: 'Producto con descripción no texto',
            descriptionProduct: 123, // No es texto
            priceProduct: 10.99,
            stockProduct: 50,
        };
        const response = await request(app).post('/api/products').send(nonTextDescriptionProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('La descripción del producto debe ser texto');
    });

    //Prueba POST crear producto con precio no numérico
    test('should fail cause price is not numeric', async () => {
        const nonNumericPriceProduct = {    
            codeProduct: 'PROD008',
            nameProduct: 'Producto con precio no numérico',
            descriptionProduct: 'Descripción',
            priceProduct: '10.99', // No es numérico
            stockProduct: 50,
        };
        const response = await request(app).post('/api/products').send(nonNumericPriceProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El precio del producto debe ser numérico');
    });

    //Prueba POST crear producto con stock no numérico
    test('should fail cause stock is not numeric', async () => {
        const nonNumericStockProduct = {    
            codeProduct: 'PROD009',
            nameProduct: 'Producto con stock no numérico',
            descriptionProduct: 'Descripción',
            priceProduct: 10.99,
            stockProduct: '50', // No es numérico
        };
        const response = await request(app).post('/api/products').send(nonNumericStockProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El stock del producto debe ser numérico');
    });

    //Prueba POST datos con strings vacíos
    test('should fail cause strings are empty', async () => {
        const emptyStringsProduct = {    
            codeProduct: 'PROD010',
            nameProduct: '',
            descriptionProduct: '',
            priceProduct: 0,
            stockProduct: 0,
        };
        const response = await request(app).post('/api/products').send(emptyStringsProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Los campos no pueden estar vacíos');
    });
});

describe('PUT /api/products/:codeProduct', () => {
    //Prueba PUT actualizar producto correctamente
    test('should update a product successfully', async () => {
        await request(app).post('/api/products').send(mockProduct); 
        const response = await request(app).put(`/api/products/${mockProduct.codeProduct}`).send(mockProduct2);
        expect(response.statusCode).toBe(200);
        expect(response.body.product).toBeDefined();
        expect(response.body.product).toHaveProperty('codeProduct');
        expect(response.body.product.nameProduct).toBe('Pan');
    });  
    
    //Prueba PUT intentar actualizar un producto que no existe
    test('should fail cause product does not exist', async () => {
        const response = await request(app).put('/api/products/CODEFALSO123').send(mockProduct2);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Producto no encontrado');
    });

    //Prueba PUT datos con strings vacíos
    test('should fail cause strings are empty', async () => {
        const emptyStringsProduct = {    
            codeProduct: 'PROD010',
            nameProduct: '',
            descriptionProduct: '',
            priceProduct: 0,
            stockProduct: 0,
        };
        const response = await request(app).put(`/api/products/${mockProduct.codeProduct}`).send(emptyStringsProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Los campos no pueden estar vacíos');
    });

    //Prueba PUT actualizar producto con nombre no texto
    test('should fail cause name is not text', async () => {
        const nonTextNameProduct = {    
            codeProduct: 'PROD007',
            nameProduct: 123, // No es texto
            descriptionProduct: 'Descripción',
            priceProduct: 10.99,
            stockProduct: 50,
        };
        const response = await request(app).put(`/api/products/${mockProduct.codeProduct}`).send(nonTextNameProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El nombre del producto debe ser texto');
    });

    //Prueba PUT actualizar producto con descripción no texto
    test('should fail cause description is not text', async () => {
        const nonTextDescriptionProduct = {    
            codeProduct: 'PROD007',
            nameProduct: 'Producto con descripción no texto',
            descriptionProduct: 123, // No es texto
            priceProduct: 10.99,
            stockProduct: 50,
        };
        const response = await request(app).put(`/api/products/${mockProduct.codeProduct}`).send(nonTextDescriptionProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('La descripción del producto debe ser texto');
    });

    //Prueba PUT actualizar producto con precio no numérico
    test('should fail cause price is not numeric', async () => {
        const nonNumericPriceProduct = {    
            codeProduct: 'PROD007',
            nameProduct: 'Producto con precio no numérico',
            descriptionProduct: 'Descripción',
            priceProduct: '10.99', // No es numérico
            stockProduct: 50,
        };        
        const response = await request(app).put(`/api/products/${mockProduct.codeProduct}`).send(nonNumericPriceProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El precio del producto debe ser numérico');
    });

    //Prueba PUT actualizar producto con stock no numérico
    test('should fail cause stock is not numeric', async () => {
        const nonNumericStockProduct = {    
            codeProduct: 'PROD007',
            nameProduct: 'Producto con stock no numérico',
            descriptionProduct: 'Descripción',
            priceProduct: 10.99,        
            stockProduct: '50', // No es numérico
        };        
        const response = await request(app).put(`/api/products/${mockProduct.codeProduct}`).send(nonNumericStockProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El stock del producto debe ser numérico');
    });
});

describe('DELETE /api/products/:codeProduct', () => {
    //Prueba DELETE eliminar producto correctamente
    test('should delete a product successfully', async () => {
        await request(app).post('/api/products').send(mockProduct); 
        const response = await request(app).delete(`/api/products/${mockProduct.codeProduct}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Producto eliminado con exito');
    });

    //Prueba DELETE intentar eliminar un producto que no existe
    test('should fail cause product does not exist', async () => {
        const response = await request(app).delete('/api/products/CODEFALSO123');
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Producto no encontrado');
    });
});