let products = [];

/**
 * @route GET /products
 * @description Obtiene todos los productos
 */
function getListProduct(req, res) {
    res.json(products);
}

/**
 * @route GET /products/:code
 * @description Obtiene un solo producto por su código
 */     
function getProductByCode(req, res) {
    const { code } = req.params;
    const product = products.find(p => p.codeProduct === code); 
    if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(product);
}

/**
 * @route POST /products
 * @description Crea un nuevo producto
 */
function createNewProduct(req, res) {
    const { 
        codeProduct, 
        nameProduct, 
        descriptionProduct, 
        priceProduct, 
        stockProduct 
    } = req.body;

    // 1. VALIDAR CAMPOS OBLIGATORIOS
    if (!codeProduct || !nameProduct || priceProduct == undefined || stockProduct == undefined) {
        return res.status(400).json({ message: 'Faltan datos obligatorios del producto' });
    }

    // 2. VALIDACIONES DE STRINGS VACÍOS
    if (
        typeof codeProduct === 'string' && !codeProduct.trim() ||
        typeof nameProduct === 'string' && !nameProduct.trim() ||
        typeof descriptionProduct === 'string' && !descriptionProduct.trim()
    ) {
        return res.status(400).json({ message: 'Los campos no pueden estar vacíos' });
    }


    // 3. VALIDACIONES DE TIPOS DE DATOS
    if (typeof codeProduct !== 'string') {
        return res.status(400).json({ message: 'El código del producto debe ser texto' });
    }
    if (typeof nameProduct !== 'string') {
        return res.status(400).json({ message: 'El nombre del producto debe ser texto' });
    }
    if (typeof descriptionProduct !== 'string') {
        return res.status(400).json({ message: 'La descripción del producto debe ser texto' });
    }
    if (typeof priceProduct !== 'number') {
        return res.status(400).json({ message: 'El precio del producto debe ser numérico' });
    }
    if (typeof  stockProduct !== 'number' || !Number.isInteger(stockProduct)) {
        return res.status(400).json({ message: 'El stock del producto debe ser numérico' });
    }

    // 4. VALIDAR FORMATO DEL CÓDIGO (LETRAS + NÚMEROS)
    if (!/^[A-Za-z]{3,10}[0-9]{1,10}$/.test(codeProduct.trim())) {
        return res.status(400).json({
            message: 'Formato de código inválido (use LETRAS + NUMEROS, ej: PROD001)'
        });
    }

    // 5. VALIDACIÓN DE PRECIO NO NEGATIVO
    if (priceProduct <= 0) {
        return res.status(400).json({ message: 'Precio no puede ser negativo' });
    }
    // 6. VALIDACIÓN DE STOCK NO NEGATIVO
    if (stockProduct < 0) {
        return res.status(400).json({ message: 'Stock no puede ser negativo' });
    }


    // 7. VALIDACIONES DE LONGITUD MÁXIMA
    if (nameProduct.length > 100) {
        return res.status(400).json({ message: 'El nombre del producto no puede exceder los 100 caracteres' });
    }
    if (descriptionProduct.trim().length > 300) {
        return res.status(400).json({ message: 'La descripción del producto no puede exceder los 300 caracteres' });
    }

    // 8. VALIDAR SI EL PRODUCTO YA EXISTE
    if (products.some(p => p.codeProduct === codeProduct.trim())) {
        return res.status(409).json({ message: 'Ya existe un producto con ese código' });
    }

    // CREAR EL NUEVO PRODUCTO
    const newProduct = {
        codeProduct: codeProduct.trim(),
        nameProduct: nameProduct.trim(),
        descriptionProduct: descriptionProduct.trim(),
        priceProduct,
        stockProduct
};
    products.push(newProduct);
    res.status(201).json({
        message: 'Producto creado con exito',
        product: newProduct
    });
}

/**
 * @route PUT /products/:code
 * @description Actualiza un producto por su código
 */
function updateExistingProduct(req, res) {
    //El ID viene de req.params
    const { code } = req.params;    
    const { 
        newNameProduct, 
        newDescriptionProduct, 
        newPriceProduct, 
        newStockProduct 
    } = req.body;

    //Usar findIndex para encontrar al producto
    const productIndex = products.findIndex(
        p => p.codeProduct === code
    );

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // VALIDACIONES

    // Validar strings vacíos solo si NO es número u otro tipo
    if (newNameProduct !== undefined) {
        if (typeof newNameProduct !== 'string') {
            return res.status(400).json({ message: 'El nombre del producto debe ser texto' });
        }
        if (!newNameProduct.trim()) {
            return res.status(400).json({ message: 'Los campos no pueden estar vacíos' });
        }
        if (newNameProduct.length > 100) {
            return res.status(400).json({ message: 'El nombre del producto no puede exceder los 100 caracteres' });
        }
    }

    if (newDescriptionProduct !== undefined) {
        if (typeof newDescriptionProduct !== 'string') {
            return res.status(400).json({ message: 'La descripción del producto debe ser texto' });
        }
        if (!newDescriptionProduct.trim()) {
            return res.status(400).json({ message: 'Los campos no pueden estar vacíos' });
        }
        if (newDescriptionProduct.length > 300) {
            return res.status(400).json({ message: 'La descripción del producto no puede exceder los 300 caracteres' });
        }
    }

        // Validación de precio si se proporciona
    if (newPriceProduct !== undefined) {
        if (typeof newPriceProduct !== 'number') {
            return res.status(400).json({ message: 'El precio del producto debe ser numérico' });
        }
    }
    if (newStockProduct !== undefined){
        if (typeof newStockProduct !== 'number' || !Number.isInteger(newStockProduct)) {
            return res.status(400).json({ message: 'El stock del producto debe ser numérico' });
        }
    }


    // ACTUALIZACIÓN

    const oldProduct = products[productIndex];
    const updatedProduct = {
        ...oldProduct,
        nameProduct: newNameProduct ?? oldProduct.nameProduct,
        descriptionProduct: newDescriptionProduct ?? oldProduct.descriptionProduct,
        priceProduct: newPriceProduct ?? oldProduct.priceProduct,
        stockProduct: newStockProduct ?? oldProduct.stockProduct
    };

    products[productIndex] = updatedProduct;

    //Devolver 200 OK y el objeto actualizado
    res.status(200).json({
        message: 'Producto actualizado con exito',
        product: updatedProduct
    });
}   



/** 
 * @route DELETE /products/:code
 * @description Elimina un producto por su código
 */
function deleteProduct(req, res) {
    const { code } = req.params;

    //Comprobar si el producto existe
    const productIndex = products.findIndex(p => p.codeProduct === code);

    //Manejar el error 404
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Producto no encontrado' });
    }

    //Eliminar usando splice
    products.splice(productIndex, 1);
    
    //Devolver 200 OK
    res.status(200).json({
        message: 'Producto eliminado con exito'
    });
}

module.exports = { 
    getListProduct, 
    getProductByCode, 
    createNewProduct, 
    updateExistingProduct, 
    deleteProduct 
};