jest.mock('mongoose', () => {
  const m = jest.requireActual('mongoose');
  m.connect = jest.fn().mockResolvedValue(true);
  return m;
});

jest.mock('../src/models/Producto', () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

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
const Producto = require('../src/models/Producto');
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

const mockProduct = {
  _id: 'p1',
  codeProduct: 'PROD001',
  nameProduct: 'Leche',
  descriptionProduct: 'Leche descremada',
  priceProduct: 2.5,
  stockProduct: 100,
  proveedor: null,
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

describe('Product API', () => {
  // ─── GET /api/products (public) ───
  describe('GET /api/products', () => {
    test('returns list of products', async () => {
      Producto.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([mockProduct]),
      });
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([mockProduct]);
    });

    test('returns empty list', async () => {
      Producto.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('returns 500 on DB error', async () => {
      Producto.find.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('DB fail')),
      });
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('DB fail');
    });
  });

  // ─── GET /api/products/:code (public) ───
  describe('GET /api/products/:code', () => {
    test('returns product by code', async () => {
      Producto.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProduct),
      });
      const res = await request(app).get('/api/products/PROD001');
      expect(res.statusCode).toBe(200);
      expect(res.body.nameProduct).toBe('Leche');
    });

    test('returns 404 if not found', async () => {
      Producto.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      const res = await request(app).get('/api/products/FAKE999');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Producto no encontrado');
    });

    test('returns 500 on DB error', async () => {
      Producto.findOne.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('err')),
      });
      const res = await request(app).get('/api/products/PROD001');
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── POST /api/products ───
  describe('POST /api/products', () => {
    test('creates product successfully (without proveedor)', async () => {
      Producto.findOne.mockResolvedValue(null);
      Producto.create.mockResolvedValue(mockProduct);
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'Leche',
          descriptionProduct: 'Leche descremada',
          priceProduct: 2.5,
          stockProduct: 100,
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Producto creado con exito');
      expect(res.body.product).toBeDefined();
    });

    test('creates product with proveedor', async () => {
      Proveedor.findById.mockResolvedValue({
        _id: 'prov1',
        nombreFiscal: 'Prov',
      });
      Producto.findOne.mockResolvedValue(null);
      Producto.create.mockResolvedValue({ ...mockProduct, proveedor: 'prov1' });
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'Leche',
          descriptionProduct: 'Leche descremada',
          priceProduct: 2.5,
          stockProduct: 100,
          proveedor: 'prov1',
        });
      expect(res.statusCode).toBe(201);
    });

    test('creates product with stock = 0 (boundary)', async () => {
      Producto.findOne.mockResolvedValue(null);
      Producto.create.mockResolvedValue({ ...mockProduct, stockProduct: 0 });
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'Leche',
          descriptionProduct: 'Leche descremada',
          priceProduct: 1,
          stockProduct: 0,
        });
      expect(res.statusCode).toBe(201);
    });

    test('fails with missing required fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({ codeProduct: 'PROD003', nameProduct: 'Incompleto' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Faltan datos obligatorios del producto');
    });

    test('fails with empty string fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD003',
          nameProduct: '   ',
          descriptionProduct: 'Valid',
          priceProduct: 10,
          stockProduct: 10,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Los campos no pueden estar vacíos');
    });

    test('fails when code is not string', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 12345,
          nameProduct: 'A',
          descriptionProduct: 'B',
          priceProduct: 1,
          stockProduct: 1,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El código del producto debe ser texto');
    });

    test('fails when name is not string', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 123,
          descriptionProduct: 'B',
          priceProduct: 1,
          stockProduct: 1,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El nombre del producto debe ser texto');
    });

    test('fails when description is not string', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'A',
          descriptionProduct: 123,
          priceProduct: 1,
          stockProduct: 1,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'La descripción del producto debe ser texto',
      );
    });

    test('fails when price is not number', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'A',
          descriptionProduct: 'B',
          priceProduct: '10',
          stockProduct: 1,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El precio del producto debe ser numérico');
    });

    test('fails when stock is not number', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'A',
          descriptionProduct: 'B',
          priceProduct: 10,
          stockProduct: '50',
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El stock del producto debe ser numérico entero',
      );
    });

    test('fails when stock is not integer', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'A',
          descriptionProduct: 'B',
          priceProduct: 10,
          stockProduct: 10.5,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El stock del producto debe ser numérico entero',
      );
    });

    test('fails with invalid code format (no numbers)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD',
          nameProduct: 'A',
          descriptionProduct: 'B',
          priceProduct: 10,
          stockProduct: 10,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'Formato de código inválido (use LETRAS + NUMEROS, ej: PROD001)',
      );
    });

    test('fails with price <= 0', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'A',
          descriptionProduct: 'B',
          priceProduct: -5,
          stockProduct: 10,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El precio debe ser mayor a 0');
    });

    test('fails with price = 0', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'A',
          descriptionProduct: 'B',
          priceProduct: 0,
          stockProduct: 10,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El precio debe ser mayor a 0');
    });

    test('fails with stock < 0', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'A',
          descriptionProduct: 'B',
          priceProduct: 10,
          stockProduct: -1,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El stock no puede ser negativo');
    });

    test('fails when name too long (>100)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'a'.repeat(101),
          descriptionProduct: 'B',
          priceProduct: 10,
          stockProduct: 10,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El nombre del producto no puede exceder los 100 caracteres',
      );
    });

    test('fails when description too long (>300)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'A',
          descriptionProduct: 'a'.repeat(301),
          priceProduct: 10,
          stockProduct: 10,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'La descripción del producto no puede exceder los 300 caracteres',
      );
    });

    test('fails when proveedor does not exist (404)', async () => {
      Proveedor.findById.mockResolvedValue(null);
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'A',
          descriptionProduct: 'B',
          priceProduct: 10,
          stockProduct: 10,
          proveedor: 'bad-id',
        });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('El proveedor especificado no existe');
    });

    test('fails when product already exists (409)', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'A',
          descriptionProduct: 'B',
          priceProduct: 10,
          stockProduct: 10,
        });
      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe('Ya existe un producto con ese código');
    });

    test('returns 400 on create error (catch)', async () => {
      Producto.findOne.mockResolvedValue(null);
      Producto.create.mockRejectedValue(new Error('fail'));
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send({
          codeProduct: 'PROD001',
          nameProduct: 'A',
          descriptionProduct: 'B',
          priceProduct: 10,
          stockProduct: 10,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('fail');
    });
  });

  // ─── PUT /api/products/:code ───
  describe('PUT /api/products/:code', () => {
    test('updates product successfully', async () => {
      const updated = { ...mockProduct, nameProduct: 'Pan' };
      Producto.findOne.mockResolvedValue(mockProduct);
      Producto.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(updated),
      });
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({
          newNameProduct: 'Pan',
          newDescriptionProduct: 'Pan integral',
          newPriceProduct: 1.5,
          newStockProduct: 50,
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Producto actualizado con exito');
      expect(res.body.product.nameProduct).toBe('Pan');
    });

    test('returns 404 if product not found', async () => {
      Producto.findOne.mockResolvedValue(null);
      const res = await request(app)
        .put('/api/products/FAKE999')
        .set('Authorization', 'Bearer t')
        .send({ newNameProduct: 'X' });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Producto no encontrado');
    });

    test('fails with name not string', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newNameProduct: 123 });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El nombre del producto debe ser texto');
    });

    test('fails with empty name', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newNameProduct: '   ' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Los campos no pueden estar vacíos');
    });

    test('fails with name too long', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newNameProduct: 'a'.repeat(101) });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El nombre del producto no puede exceder los 100 caracteres',
      );
    });

    test('fails with description not string', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newDescriptionProduct: 123 });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'La descripción del producto debe ser texto',
      );
    });

    test('fails with empty description', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newDescriptionProduct: '   ' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Los campos no pueden estar vacíos');
    });

    test('fails with description too long', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newDescriptionProduct: 'a'.repeat(301) });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'La descripción del producto no puede exceder los 300 caracteres',
      );
    });

    test('fails with price not number', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newPriceProduct: '10' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('El precio del producto debe ser numérico');
    });

    test('fails with price <= 0', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newPriceProduct: 0 });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El precio del producto debe ser mayor a 0',
      );
    });

    test('fails with stock not number', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newStockProduct: '50' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El stock del producto debe ser un número entero',
      );
    });

    test('fails with stock not integer', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newStockProduct: 10.5 });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El stock del producto debe ser un número entero',
      );
    });

    test('fails with stock < 0', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newStockProduct: -1 });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El stock del producto no puede ser negativo',
      );
    });

    test('fails when proveedor does not exist', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      Proveedor.findById.mockResolvedValue(null);
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newProveedor: 'bad-id' });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('El proveedor especificado no existe');
    });

    test('allows setting proveedor to null', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      Producto.findOneAndUpdate.mockReturnValue({
        populate: jest
          .fn()
          .mockResolvedValue({ ...mockProduct, proveedor: null }),
      });
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newProveedor: null });
      expect(res.statusCode).toBe(200);
    });

    test('allows updating proveedor to valid one', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      Proveedor.findById.mockResolvedValue({ _id: 'prov1' });
      Producto.findOneAndUpdate.mockReturnValue({
        populate: jest
          .fn()
          .mockResolvedValue({ ...mockProduct, proveedor: { _id: 'prov1' } }),
      });
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newProveedor: 'prov1' });
      expect(res.statusCode).toBe(200);
    });

    test('updates only name preserving others', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      Producto.findOneAndUpdate.mockReturnValue({
        populate: jest
          .fn()
          .mockResolvedValue({ ...mockProduct, nameProduct: 'Updated' }),
      });
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newNameProduct: 'Updated' });
      expect(res.statusCode).toBe(200);
      expect(res.body.product.nameProduct).toBe('Updated');
      expect(res.body.product.priceProduct).toBe(2.5);
    });

    test('updates price <= 0 boundary (negative)', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newPriceProduct: -1 });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        'El precio del producto debe ser mayor a 0',
      );
    });

    test('updates stock = 0 (allowed boundary)', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      Producto.findOneAndUpdate.mockReturnValue({
        populate: jest
          .fn()
          .mockResolvedValue({ ...mockProduct, stockProduct: 0 }),
      });
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newStockProduct: 0 });
      expect(res.statusCode).toBe(200);
    });

    test('updates description only preserving others', async () => {
      Producto.findOne.mockResolvedValue(mockProduct);
      Producto.findOneAndUpdate.mockReturnValue({
        populate: jest
          .fn()
          .mockResolvedValue({
            ...mockProduct,
            descriptionProduct: 'New desc',
          }),
      });
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newDescriptionProduct: 'New desc' });
      expect(res.statusCode).toBe(200);
      expect(res.body.product.descriptionProduct).toBe('New desc');
    });

    test('returns 500 on DB error (catch)', async () => {
      Producto.findOne.mockRejectedValue(new Error('err'));
      const res = await request(app)
        .put('/api/products/PROD001')
        .set('Authorization', 'Bearer t')
        .send({ newNameProduct: 'X' });
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── DELETE /api/products/:code ───
  describe('DELETE /api/products/:code', () => {
    test('deletes product successfully', async () => {
      Producto.findOneAndDelete.mockResolvedValue(mockProduct);
      const res = await request(app)
        .delete('/api/products/PROD001')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Producto eliminado con exito');
    });

    test('returns 404 if not found', async () => {
      Producto.findOneAndDelete.mockResolvedValue(null);
      const res = await request(app)
        .delete('/api/products/FAKE999')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Producto no encontrado');
    });

    test('returns 500 on DB error (catch)', async () => {
      Producto.findOneAndDelete.mockRejectedValue(new Error('err'));
      const res = await request(app)
        .delete('/api/products/PROD001')
        .set('Authorization', 'Bearer t');
      expect(res.statusCode).toBe(500);
    });
  });

  // ─── Auth for products ───
  describe('Auth for products', () => {
    test('GET /api/products is public (no auth required)', async () => {
      Producto.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
    });

    test('POST /api/products returns 401 without token', async () => {
      const res = await request(app).post('/api/products').send(mockProduct);
      expect(res.statusCode).toBe(401);
    });

    test('POST /api/products returns 403 for cliente role', async () => {
      setupAuth('cliente');
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer t')
        .send(mockProduct);
      expect(res.statusCode).toBe(403);
    });
  });
});
