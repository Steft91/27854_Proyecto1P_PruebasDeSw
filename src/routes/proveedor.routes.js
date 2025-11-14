const express = require('express');

const {
  getListProvider,
  createNewProvider,
  getProviderById,
  updateExistingProvider,
  deleteProvider,
} = require('../controllers/proveedor.controller');

const router = express.Router();

// GET /api/providers  (Get all providers)
router.get('/', getListProvider);
// POST /api/providers (Create a new provider)
router.post('/', createNewProvider);

// GET /api/providers/:id (Get a specific provider)
router.get('/:id', getProviderById);

// PUT /api/providers/:id (Update a specific provider)
router.put('/:id', updateExistingProvider);

// DELETE /api/providers/:id (Delete a specific provider)
router.delete('/:id', deleteProvider);

module.exports = router;
