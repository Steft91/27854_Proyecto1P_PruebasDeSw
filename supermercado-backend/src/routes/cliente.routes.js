const express = require('express');

const { 
    getListClient, 
    createNewClient, 
    getClientByDni, 
    updateExistingClient, 
    deleteClient 
} = require('../controllers/cliente.controller');

const router = express.Router();

// GET /api/clients  (Get all clients)
router.get('/', getListClient);
// POST /api/clients (Create a new client)
router.post('/', createNewClient);

// GET /api/clients/:dni (Get a specific client)
router.get('/:dni', getClientByDni);

// PUT /api/clients/:dni (Update a specific client)
router.put('/:dni', updateExistingClient);

// DELETE /api/clients/:dni (Delete a specific client)
router.delete('/:dni', deleteClient);


module.exports = router;