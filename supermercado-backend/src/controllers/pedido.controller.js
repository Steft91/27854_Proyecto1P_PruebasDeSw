const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');

/**
 * Crear un nuevo pedido
 * POST /api/pedidos
 * Rol: cliente
 */
exports.crearPedido = async (req, res) => {
  try {
    const { items, datosEntrega } = req.body;
    const usuarioId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ msg: 'El pedido debe contener al menos un producto' });
    }

    if (!datosEntrega || !datosEntrega.direccion || !datosEntrega.telefono) {
      return res.status(400).json({ msg: 'Los datos de entrega son obligatorios' });
    }

    const itemsProcesados = [];
    let totalPedido = 0;

    for (const item of items) {
      const producto = await Producto.findOne({ codeProduct: item.producto });

      if (!producto) {
        return res.status(404).json({ msg: `Producto ${item.producto} no encontrado` });
      }

      if (producto.stockProduct < item.cantidad) {
        return res.status(400).json({
          msg: `Stock insuficiente para ${producto.nameProduct}. Disponible: ${producto.stockProduct}`,
        });
      }

      const subtotal = producto.priceProduct * item.cantidad;

      itemsProcesados.push({
        producto: producto.codeProduct,
        nombreProducto: producto.nameProduct,
        cantidad: item.cantidad,
        precioUnitario: producto.priceProduct,
        subtotal,
      });

      totalPedido += subtotal;

      producto.stockProduct -= item.cantidad;
      await producto.save();
    }
    const nuevoPedido = new Pedido({
      usuario: usuarioId,
      items: itemsProcesados,
      total: totalPedido,
      datosEntrega,
      estado: 'pendiente',
    });

    await nuevoPedido.save();

    res.status(201).json({
      msg: 'Pedido creado exitosamente',
      pedido: nuevoPedido,
    });
  } catch (error) {
    console.error('Error en crearPedido:', error);
    res.status(500).json({ msg: 'Error al crear el pedido', error: error.message });
  }
};

/**
 * Obtener pedidos del usuario autenticado
 * GET /api/pedidos/mis-pedidos
 * Rol: cliente
 */
exports.getMisPedidos = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const pedidos = await Pedido.find({ usuario: usuarioId })
      .sort({ createdAt: -1 }) // Más recientes primero
      .populate('usuario', 'username email');

    res.json(pedidos);
  } catch (error) {
    console.error('Error en getMisPedidos:', error);
    res.status(500).json({ msg: 'Error al obtener pedidos', error: error.message });
  }
};

/**
 * Obtener todos los pedidos (admin/empleado)
 * GET /api/pedidos
 * Rol: administrador, empleado
 */
exports.getTodosPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .sort({ createdAt: -1 })
      .populate('usuario', 'username email rol');

    res.json(pedidos);
  } catch (error) {
    console.error('Error en getTodosPedidos:', error);
    res.status(500).json({ msg: 'Error al obtener pedidos', error: error.message });
  }
};

/**
 * Obtener un pedido por ID
 * GET /api/pedidos/:id
 * Rol: cliente (solo sus pedidos), administrador, empleado
 */
exports.getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const usuarioRol = req.user.rol;

    const pedido = await Pedido.findById(id).populate('usuario', 'username email rol');

    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }

    if (usuarioRol === 'cliente' && pedido.usuario._id.toString() !== usuarioId) {
      return res.status(403).json({ msg: 'No tienes permiso para ver este pedido' });
    }

    res.json(pedido);
  } catch (error) {
    console.error('Error en getPedidoById:', error);
    res.status(500).json({ msg: 'Error al obtener el pedido', error: error.message });
  }
};

/**
 * Actualizar el estado de un pedido
 * PUT /api/pedidos/:id/estado
 * Rol: administrador, empleado
 */
exports.actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar estado
    const estadosValidos = ['pendiente', 'procesando', 'completado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ msg: 'Estado no válido' });
    }

    const pedido = await Pedido.findById(id);

    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }

    pedido.estado = estado;
    pedido.updatedAt = Date.now();
    await pedido.save();

    res.json({
      msg: 'Estado del pedido actualizado',
      pedido,
    });
  } catch (error) {
    console.error('Error en actualizarEstadoPedido:', error);
    res.status(500).json({ msg: 'Error al actualizar el estado', error: error.message });
  }
};

/**
 * Cancelar un pedido (cliente)
 * PUT /api/pedidos/:id/cancelar
 * Rol: cliente (solo sus propios pedidos)
 */
exports.cancelarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;

    const pedido = await Pedido.findById(id);

    if (!pedido) {
      return res.status(404).json({ msg: 'Pedido no encontrado' });
    }

    if (pedido.usuario.toString() !== usuarioId) {
      return res.status(403).json({ msg: 'No tienes permiso para cancelar este pedido' });
    }

    if (pedido.estado !== 'pendiente') {
      return res.status(400).json({
        msg: 'Solo se pueden cancelar pedidos en estado pendiente',
      });
    }

    for (const item of pedido.items) {
      const producto = await Producto.findOne({ codeProduct: item.producto });
      if (producto) {
        producto.stockProduct += item.cantidad;
        await producto.save();
      }
    }

    pedido.estado = 'cancelado';
    pedido.updatedAt = Date.now();
    await pedido.save();

    res.json({
      msg: 'Pedido cancelado exitosamente',
      pedido,
    });
  } catch (error) {
    console.error('Error en cancelarPedido:', error);
    res.status(500).json({ msg: 'Error al cancelar el pedido', error: error.message });
  }
};
