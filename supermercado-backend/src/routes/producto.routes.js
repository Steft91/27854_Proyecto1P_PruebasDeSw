const express = require('express');
const checkRole = require('../middleware/roleMiddleware');
const {
  getListProduct,
  getProductByCode,
  createNewProduct,
  updateExistingProduct,
  deleteProduct,
} = require('../controllers/producto.controller');

const router = express.Router();

// GET /api/products  (Get all products) - Todos pueden ver productos
router.get('/', getListProduct);

// POST /api/products (Create a new product) - Administrador y empleado pueden crear
router.post('/', checkRole(['administrador', 'empleado']), createNewProduct);

// GET /api/products/:code (Get a specific product) - Todos pueden ver
router.get('/:code', getProductByCode);

// PUT /api/products/:code (Update a specific product) - Administrador y empleado pueden actualizar
router.put(
  '/:code',
  checkRole(['administrador', 'empleado']),
  updateExistingProduct
);

// DELETE /api/products/:code (Delete a specific product) - Administrador y empleado pueden eliminar
router.delete(
  '/:code',
  checkRole(['administrador', 'empleado']),
  deleteProduct
);

module.exports = router;
