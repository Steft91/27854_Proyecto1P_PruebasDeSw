const express = require('express');
const checkRole = require('../middleware/roleMiddleware');

const {
  getListEmpleado,
  createNewEmpleado,
  getEmpleadoByCedula,
  updateExistingEmpleado,
  deleteEmpleado,
} = require('../controllers/empleado.controller');

const router = express.Router();

// Solo administradores pueden gestionar empleados
// GET /api/empleados  (Get all empleados)
router.get('/', checkRole(['administrador']), getListEmpleado);
// POST /api/empleados (Create a new empleado)
router.post('/', checkRole(['administrador']), createNewEmpleado);

// GET /api/empleados/:cedula (Get a specific empleado)
router.get('/:cedula', checkRole(['administrador']), getEmpleadoByCedula);

// PUT /api/empleados/:cedula (Update a specific empleado)
router.put('/:cedula', checkRole(['administrador']), updateExistingEmpleado);

// DELETE /api/empleados/:cedula (Delete a specific empleado)
router.delete('/:cedula', checkRole(['administrador']), deleteEmpleado);

module.exports = router;
