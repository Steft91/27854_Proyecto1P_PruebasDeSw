const express = require('express');
const {
    getListProduct,
    getProductByCode,
    createNewProduct,
    updateExistingProduct,
    deleteProduct
} = require('../controllers/producto.controller');

const router = express.Router();    

// GET /api/products  (Get all products)
router.get('/', getListProduct);

// POST /api/products (Create a new product)
router.post('/', createNewProduct);

// GET /api/products/:code (Get a specific product)
router.get('/:code', getProductByCode);

// PUT /api/products/:code (Update a specific product)
router.put('/:code', updateExistingProduct);

// DELETE /api/products/:code (Delete a specific product)
router.delete('/:code', deleteProduct);

module.exports = router;