const express = require('express');
const router = express.Router();
const {
  crearPedido,
  getMisPedidos,
  getTodosPedidos,
  getPedidoById,
  actualizarEstadoPedido,
  cancelarPedido,
} = require('../controllers/pedido.controller');

const checkRole = require('../middleware/roleMiddleware');
/**
 * Rutas para pedidos
 * Base: /api/pedidos
 */

// Rutas para CLIENTES
// POST /api/pedidos - Crear un nuevo pedido
router.post('/', checkRole(['cliente']), crearPedido);

// GET /api/pedidos/mis-pedidos - Obtener mis pedidos
router.get('/mis-pedidos', checkRole(['cliente']), getMisPedidos);

// PUT /api/pedidos/:id/cancelar - Cancelar un pedido
router.put('/:id/cancelar', checkRole(['cliente']), cancelarPedido);

// Rutas para ADMIN y EMPLEADO
// GET /api/pedidos - Obtener todos los pedidos
router.get('/', checkRole(['administrador', 'empleado']), getTodosPedidos);

// PUT /api/pedidos/:id/estado - Actualizar estado de un pedido
router.put('/:id/estado', checkRole(['administrador', 'empleado']), actualizarEstadoPedido);

// Rutas COMPARTIDAS (con validación de permisos en el controlador)
// GET /api/pedidos/:id - Obtener un pedido por ID
// Cliente: solo sus propios pedidos
// Admin/Empleado: cualquier pedido
router.get('/:id', checkRole(['cliente', 'administrador', 'empleado']), getPedidoById);

module.exports = router;
