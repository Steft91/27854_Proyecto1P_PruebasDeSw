const request = require('supertest');
const app = require('../src/app');

const mockProduct = {
    codeProduct: 'PROD001',
    nameProduct: 'Leche',
    descriptionProduct: 'Leche descremada',
    priceProduct: 2.5,
    stockProduct: 100
};

const mockProduct2 = {
    codeProduct: 'PROD002',
    nameProduct: 'Pan',
    descriptionProduct: 'Pan integral de 2 kg',
    priceProduct: 1.5,
    stockProduct: 50
};

describe('Product API', () => {
    describe('GET /api/products', () => {
        //Prueba GET lista vacía
        test('should return an empty list initially', async () => {
            const response = await request(app).get('/api/products');
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual([]);
        });

        //Prueba GET encontrar un producto por código
        test('should find a product if product exist', async () => {
            await request(app).post('/api/products').send(mockProduct);

            const response = await request(app).get(`/api/products/${mockProduct.codeProduct}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.nameProduct).toBe(mockProduct.nameProduct);
        });

        //Prueba GET producto no encontrado (404)
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
        const response = await request(app).post('/api/products').send(mockProduct);

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
        expect(response.body.message).toBe('Faltan datos obligatorios del producto');
    });

    //Prueba POST crear producto con stock no entero
    test('should fail cause stock is not integer', async () => {
            const floatStockProduct = {
                codeProduct: 'PROD011',
                nameProduct: 'Producto con stock flotante',
                descriptionProduct: 'Descripción',
                priceProduct: 10.99,
                stockProduct: 10.5, // No es entero
            };
            const response = await request(app).post('/api/products').send(floatStockProduct);
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('El stock del producto debe ser numérico');
        });

    //Prueba POST crear producto con codigo no texto
    test('should fail cause code is not text', async () => {
        const nonTextCodeProduct = {
            codeProduct: 12345, // No es texto
            nameProduct: 'Producto con código no texto',
            descriptionProduct: 'Descripción',
            priceProduct: 10.99,
            stockProduct: 50,
        };
        const response = await request(app).post('/api/products').send(nonTextCodeProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El código del producto debe ser texto');
    });

    //Prueba POST crear producto con nombre muy largo
    test('should fail cause name is too long', async () => {
        const longNameProduct = {
            codeProduct: 'PROD012',
            nameProduct: 'a'.repeat(101), // > 100 caracteres
            descriptionProduct: 'Descripción',
            priceProduct: 10.99,
            stockProduct: 50,
        };
        const response = await request(app).post('/api/products').send(longNameProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El nombre del producto no puede exceder los 100 caracteres');
    });

    //Prueba POST crear producto con descripcion muy larga
    test('should fail cause description is too long', async () => {
        const longDescProduct = {
            codeProduct: 'PROD013',
            nameProduct: 'Producto con descripción larga',
            descriptionProduct: 'a'.repeat(301), // > 300 caracteres
            priceProduct: 10.99,
            stockProduct: 50,
        };
        const response = await request(app).post('/api/products').send(longDescProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('La descripción del producto no puede exceder los 300 caracteres');
    });    

    //Prueba POST datos con solo espacios
    test('should fail cause strings are empty spaces', async () => {
        const emptyStringsProduct = {    
            codeProduct: 'PROD010',
            nameProduct: ' ',
            descriptionProduct: 'Descripción válida',
            priceProduct: 10,
            stockProduct: 10,
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
        const response = await request(app).put(`/api/products/${mockProduct.codeProduct}`)
        .send({
            newNameProduct: mockProduct2.nameProduct,
            newDescriptionProduct: mockProduct2.descriptionProduct,
            newPriceProduct: mockProduct2.priceProduct,
            newStockProduct: mockProduct2.stockProduct
        });        
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
        await request(app).post('/api/products').send(mockProduct);
        const emptyStringsProduct = {    
            codeProduct: 'PROD010',
            newNameProduct: '',
            newDescriptionProduct: '',
            newPriceProduct: 0,
            newStockProduct: 0,
        };
        const response = await request(app).put(`/api/products/${mockProduct.codeProduct}`).send(emptyStringsProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Los campos no pueden estar vacíos');
    });

    //Prueba PUT actualizar producto con nombre no texto
    test('should fail cause name is not text', async () => {
        await request(app).post('/api/products').send(mockProduct);
        const nonTextNameProduct = {    
            codeProduct: 'PROD007',
            newNameProduct: 123, // No es texto
            newDescriptionProduct: 'Descripción',
            newPriceProduct: 10.99,
            newStockProduct: 50,
        };
        const response = await request(app).put(`/api/products/${mockProduct.codeProduct}`).send(nonTextNameProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El nombre del producto debe ser texto');
    });

    //Prueba PUT actualizar producto con nombre muy largo
    test('should fail cause new name is too long', async () => {
        await request(app).post('/api/products').send(mockProduct);
        const response = await request(app)
            .put(`/api/products/${mockProduct.codeProduct}`)
            .send({
                newNameProduct: 'a'.repeat(101) // > 100 caracteres
            });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El nombre del producto no puede exceder los 100 caracteres');
    });

    //Prueba PUT actualizar producto con descripción no texto
    test('should fail cause description is not text', async () => {
        await request(app).post('/api/products').send(mockProduct);
        const nonTextDescriptionProduct = {    
            codeProduct: 'PROD007',
            newNameProduct: 'Producto con descripción no texto',
            newDescriptionProduct: 123, // No es texto
            newPriceProduct: 10.99,
            newStockProduct: 50,
        };
        const response = await request(app).put(`/api/products/${mockProduct.codeProduct}`).send(nonTextDescriptionProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('La descripción del producto debe ser texto');
    });

    //Prueba PUT actualizar producto con precio no numérico
    test('should fail cause price is not numeric', async () => {
        await request(app).post('/api/products').send(mockProduct);
        const nonNumericPriceProduct = {    
            codeProduct: 'PROD007',
            newNameProduct: 'Producto con precio no numérico',
            newDescriptionProduct: 'Descripción',
            newPriceProduct: '10.99', // No es numérico
            newStockProduct: 50,
        };        
        const response = await request(app).put(`/api/products/${mockProduct.codeProduct}`).send(nonNumericPriceProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El precio del producto debe ser numérico');
    });

    //Prueba PUT actualizar producto con stock no numérico
    test('should fail cause stock is not numeric', async () => {
        await request(app).post('/api/products').send(mockProduct);
        const nonNumericStockProduct = {    
            codeProduct: 'PROD007',
            newNameProduct: 'Producto con stock no numérico',
            newDescriptionProduct: 'Descripción',
            newPriceProduct: 10.99,        
            newStockProduct: '50', // No es numérico
        };        
        const response = await request(app).put(`/api/products/${mockProduct.codeProduct}`).send(nonNumericStockProduct);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El stock del producto debe ser numérico');
    });

    //Prueba PUT actualizar solo nombre
    test('should update only name and preserve price/stock', async () => {
            const testProduct = {
                codeProduct: 'PROD999',
                nameProduct: 'Test Original',
                descriptionProduct: 'Original',
                priceProduct: 50,
                stockProduct: 50
            };
            await request(app).post('/api/products').send(testProduct);

            const response = await request(app)
                .put(`/api/products/${testProduct.codeProduct}`)
                .send({
                    newNameProduct: 'Nombre Actualizado'
                    // Omitimos newPriceProduct y newStockProduct a propósito
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.product.nameProduct).toBe('Nombre Actualizado');
            // Verifica que los valores antiguos se preservaron
            expect(response.body.product.priceProduct).toBe(50);
            expect(response.body.product.stockProduct).toBe(50);
        });

    //Prueba PUT actualizar con descripcion muy larga
    test('should fail cause new description is too long', async () => {
        await request(app).post('/api/products').send(mockProduct);
        const response = await request(app)
            .put(`/api/products/${mockProduct.codeProduct}`)
            .send({
                newDescriptionProduct: 'a'.repeat(301) // > 300 caracteres
            });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('La descripción del producto no puede exceder los 300 caracteres');
    });

    //Prueba PUT actualizar con stock no entero
    test('should fail cause new stock is not integer', async () => {
        await request(app).post('/api/products').send(mockProduct);
        const response = await request(app)
            .put(`/api/products/${mockProduct.codeProduct}`)
            .send({
                newStockProduct: 10.5 // No es entero
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('El stock del producto debe ser numérico');
    });

    //Prueba PUT actualizar con descripcion de solo espacios
    test('should fail cause new description is empty spaces', async () => {
        await request(app).post('/api/products').send(mockProduct);

        const response = await request(app)
            .put(`/api/products/${mockProduct.codeProduct}`)
            .send({
                newDescriptionProduct: '   '
            });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Los campos no pueden estar vacíos');
    });

    //Prueba PUT actualizar solo precio
    test('should update only price and preserve name', async () => {
        const testProduct = {
            codeProduct: 'PROD777',
            nameProduct: 'Test Original',
            descriptionProduct: 'Original',
            priceProduct: 50,
            stockProduct: 50
        };
        await request(app).post('/api/products').send(testProduct);
        const response = await request(app)
            .put(`/api/products/${testProduct.codeProduct}`)
            .send({
                newPriceProduct: 99.99
                // Omitimos newNameProduct a proposito
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.product.priceProduct).toBe(99.99);
        expect(response.body.product.nameProduct).toBe('Test Original');
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