const express = require('express');

const { 
    getListEmpleado, 
    createNewEmpleado, 
    getEmpleadoByCedula, 
    updateExistingEmpleado, 
    deleteEmpleado 
} = require('../controllers/empleado.controller');

const router = express.Router();

// GET /api/empleados  (Get all empleados)
router.get('/', getListEmpleado);
// POST /api/empleados (Create a new empleado)
router.post('/', createNewEmpleado);

// GET /api/empleados/:cedula (Get a specific empleado)
router.get('/:cedula', getEmpleadoByCedula);

// PUT /api/empleados/:cedula (Update a specific empleado)
router.put('/:cedula', updateExistingEmpleado);

// DELETE /api/empleados/:cedula (Delete a specific empleado)
router.delete('/:cedula', deleteEmpleado);


module.exports = router;
