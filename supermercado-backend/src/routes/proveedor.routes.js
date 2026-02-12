const express = require('express');
const checkRole = require('../middleware/roleMiddleware');

const {
  getListProvider,
  createNewProvider,
  getProviderById,
  updateExistingProvider,
  deleteProvider,
} = require('../controllers/proveedor.controller');

const router = express.Router();

// GET /api/providers  (Get all providers) - Administrador y empleado (solo lectura)
router.get('/', checkRole(['administrador', 'empleado']), getListProvider);
// POST /api/providers (Create a new provider) - Solo administrador
router.post('/', checkRole(['administrador']), createNewProvider);

// GET /api/providers/:id (Get a specific provider) - Administrador y empleado (solo lectura)
router.get('/:id', checkRole(['administrador', 'empleado']), getProviderById);

// PUT /api/providers/:id (Update a specific provider) - Solo administrador
router.put('/:id', checkRole(['administrador']), updateExistingProvider);

// DELETE /api/providers/:id (Delete a specific provider) - Solo administrador
router.delete('/:id', checkRole(['administrador']), deleteProvider);

module.exports = router;
