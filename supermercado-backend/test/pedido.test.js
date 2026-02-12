const pedidoController = require('../src/controllers/pedido.controller');

const Pedido = require('../src/models/Pedido');
const Producto = require('../src/models/Producto');

jest.mock('../src/models/Pedido');
jest.mock('../src/models/Producto');

describe('Pedido Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: { id: 'user1', rol: 'cliente' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('crearPedido', () => {
    test('should return 400 when no items', async () => {
      req.body = { items: [], datosEntrega: { direccion: 'x', telefono: '1' } };
      await pedidoController.crearPedido(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'El pedido debe contener al menos un producto' });
    });

    test('should return 400 when missing datosEntrega', async () => {
      req.body = { items: [{ producto: 'P1', cantidad: 1 }], datosEntrega: null };
      await pedidoController.crearPedido(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Los datos de entrega son obligatorios' });
    });

    test('should return 404 when producto not found', async () => {
      req.body = { items: [{ producto: 'P1', cantidad: 1 }], datosEntrega: { direccion: 'x', telefono: '1' } };
      Producto.findOne = jest.fn().mockResolvedValue(null);

      await pedidoController.crearPedido(req, res);
      expect(Producto.findOne).toHaveBeenCalledWith({ codeProduct: 'P1' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Producto P1 no encontrado' });
    });

    test('should return 400 when insufficient stock', async () => {
      req.body = { items: [{ producto: 'P1',cantidad: 5 }], datosEntrega: { direccion: 'x', telefono: '1' } };
      const producto = { codeProduct: 'P1', nameProduct: 'Prod', stockProduct: 2, priceProduct: 10 };
      Producto.findOne = jest.fn().mockResolvedValue(producto);

      await pedidoController.crearPedido(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Stock insuficiente para Prod. Disponible: 2' });
    });

    test('should create pedido and reduce stock on success', async () => {
      req.body = { items: [{ producto: 'P1', cantidad: 2 }], datosEntrega: { direccion: 'x', telefono: '1' } };
      req.user = { id: 'user1' };

      const producto = {
        codeProduct: 'P1',
        nameProduct: 'Prod',
        stockProduct: 5,
        priceProduct: 10,
        save: jest.fn().mockResolvedValue(true),
      };

      Producto.findOne = jest.fn().mockResolvedValue(producto);

      const saveMock = jest.fn().mockResolvedValue(true);
      Pedido.mockImplementation(() => ({ save: saveMock }));

      await pedidoController.crearPedido(req, res);

      expect(Producto.findOne).toHaveBeenCalledWith({ codeProduct: 'P1' });
      expect(producto.save).toHaveBeenCalled();
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('should return 500 on unexpected error', async () => {
      req.body = { items: [{ producto: 'P1', cantidad: 1 }], datosEntrega: { direccion: 'x', telefono: '1' } };
      Producto.findOne = jest.fn().mockRejectedValue(new Error('db fail'));

      await pedidoController.crearPedido(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Error al crear el pedido' }));
    });
  });

  describe('getMisPedidos', () => {
    test('should return pedidos for user', async () => {
      const pedidos = [{ _id: 'p1' }];
      Pedido.find = jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(pedidos) }) });

      await pedidoController.getMisPedidos(req, res);
      expect(Pedido.find).toHaveBeenCalledWith({ usuario: 'user1' });
      expect(res.json).toHaveBeenCalledWith(pedidos);
    });

    test('getMisPedidos handles error', async () => {
      Pedido.find = jest.fn().mockImplementation(() => { throw new Error('fail'); });
      await pedidoController.getMisPedidos(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getTodosPedidos', () => {
    test('should return all pedidos', async () => {
      const pedidos = [{ _id: 'p1' }];
      Pedido.find = jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(pedidos) }) });

      await pedidoController.getTodosPedidos(req, res);
      expect(Pedido.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(pedidos);
    });

    test('getTodosPedidos handles error', async () => {
      Pedido.find = jest.fn().mockImplementation(() => { throw new Error('fail'); });
      await pedidoController.getTodosPedidos(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getPedidoById', () => {
    test('returns 404 when not found', async () => {
      req.params.id = 'x';
      Pedido.findById = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
      await pedidoController.getPedidoById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('returns 403 when cliente requests other user pedido', async () => {
      req.params.id = 'x';
      // pedido with different user
      const pedido = { usuario: { _id: 'other' } };
      Pedido.findById = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(pedido) });
      req.user = { id: 'user1', rol: 'cliente' };
      await pedidoController.getPedidoById(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('returns pedido when allowed', async () => {
      req.params.id = 'x';
      const pedido = { usuario: { _id: 'user1' } };
      Pedido.findById = jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(pedido) });
      req.user = { id: 'user1', rol: 'cliente' };
      await pedidoController.getPedidoById(req, res);
      expect(res.json).toHaveBeenCalledWith(pedido);
    });

    test('getPedidoById handles error', async () => {
      req.params.id = 'x';
      Pedido.findById = jest.fn().mockImplementation(() => { throw new Error('fail'); });
      await pedidoController.getPedidoById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('actualizarEstadoPedido', () => {
    test('returns 400 for invalid estado', async () => {
      req.params.id = 'p';
      req.body = { estado: 'unknown' };
      await pedidoController.actualizarEstadoPedido(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('returns 404 for missing pedido', async () => {
      req.params.id = 'p';
      req.body = { estado: 'completado' };
      Pedido.findById = jest.fn().mockResolvedValue(null);
      await pedidoController.actualizarEstadoPedido(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('updates estado successfully', async () => {
      req.params.id = 'p';
      req.body = { estado: 'completado' };
      const pedido = { save: jest.fn().mockResolvedValue(true) };
      Pedido.findById = jest.fn().mockResolvedValue(pedido);
      await pedidoController.actualizarEstadoPedido(req, res);
      expect(pedido.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Estado del pedido actualizado' }));
    });

    test('actualizarEstadoPedido handles error', async () => {
      req.params.id = 'p';
      req.body = { estado: 'completado' };
      Pedido.findById = jest.fn().mockImplementation(() => { throw new Error('fail'); });
      await pedidoController.actualizarEstadoPedido(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('cancelarPedido', () => {
    test('404 when pedido not found', async () => {
      req.params.id = 'p';
      Pedido.findById = jest.fn().mockResolvedValue(null);
      await pedidoController.cancelarPedido(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('403 when user not owner', async () => {
      req.params.id = 'p';
      const pedido = { usuario: 'other', estado: 'pendiente' };
      Pedido.findById = jest.fn().mockResolvedValue(pedido);
      req.user = { id: 'user1' };
      await pedidoController.cancelarPedido(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('400 when not pendiente', async () => {
      req.params.id = 'p';
      const pedido = { usuario: 'user1', estado: 'completado' };
      Pedido.findById = jest.fn().mockResolvedValue(pedido);
      req.user = { id: 'user1' };
      await pedidoController.cancelarPedido(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Solo se pueden cancelar pedidos en estado pendiente' }));
    });

    test('successfully cancels and restores stock', async () => {
      req.params.id = 'p';
      req.user = { id: 'user1' };
      const pedido = {
        usuario: 'user1',
        estado: 'pendiente',
        items: [{ producto: 'P1', cantidad: 2 }],
        save: jest.fn().mockResolvedValue(true)
      };

      const producto = { codeProduct: 'P1', stockProduct: 3, save: jest.fn().mockResolvedValue(true) };

      Pedido.findById = jest.fn().mockResolvedValue(pedido);
      Producto.findOne = jest.fn().mockResolvedValue(producto);

      await pedidoController.cancelarPedido(req, res);

      expect(Producto.findOne).toHaveBeenCalledWith({ codeProduct: 'P1' });
      expect(producto.save).toHaveBeenCalled();
      expect(pedido.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Pedido cancelado exitosamente' }));
    });

    test('cancelarPedido handles error', async () => {
      req.params.id = 'p';
      Pedido.findById = jest.fn().mockImplementation(() => { throw new Error('fail'); });
      await pedidoController.cancelarPedido(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
