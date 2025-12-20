const express = require('express');
const checkRole = require('../middleware/roleMiddleware');

const {
  getListClient,
  createNewClient,
  getClientByDni,
  updateExistingClient,
  deleteClient,
} = require('../controllers/cliente.controller');

const router = express.Router();

// GET /api/clients  (Get all clients) - Administrador y empleado pueden ver
router.get('/', checkRole(['administrador', 'empleado']), getListClient);
// POST /api/clients (Create a new client) - Administrador y empleado pueden crear
router.post('/', checkRole(['administrador', 'empleado']), createNewClient);

// GET /api/clients/:dni (Get a specific client) - Administrador y empleado pueden ver
router.get('/:dni', checkRole(['administrador', 'empleado']), getClientByDni);

// PUT /api/clients/:dni (Update a specific client) - Administrador y empleado pueden actualizar
router.put(
  '/:dni',
  checkRole(['administrador', 'empleado']),
  updateExistingClient
);

// DELETE /api/clients/:dni (Delete a specific client) - Administrador y empleado pueden eliminar
router.delete('/:dni', checkRole(['administrador', 'empleado']), deleteClient);

module.exports = router;
