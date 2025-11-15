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

    // VALIDACIONES DE TIPOS DE DATOS
    if (typeof codeProduct !== 'string') {
        return res.status(400).json({ message: 'El código del producto debe ser texto' });
    }
    // Validar formato LETRAS + NÚMEROS (ej: PROD001)
    if (!/^[A-Za-z]{3,10}[0-9]{1,10}$/.test(codeProduct.trim())) {
    return res.status(400).json({
        message: 'El código del producto debe tener el formato LETRAS + NUMEROS (ej: PROD001)',
    });
    }
    if (typeof nameProduct !== 'string') {
        return res.status(400).json({ message: 'El nombre del producto debe ser texto' });
    }
    if (typeof descriptionProduct !== 'string') {
        return res.status(400).json({ message: 'La descripción del producto debe ser texto' });
    }
    if (typeof priceProduct !== 'number' || isNaN(priceProduct) || priceProduct <= 0) {
        return res.status(400).json({ message: 'El precio del producto debe ser un número válido mayor a 0' });
    }
    if (! Number.isInteger(stockProduct) || typeof stockProduct !== 'number' || isNaN(stockProduct) || stockProduct < 0) {
        return res.status(400).json({ message: 'El stock del producto debe ser un número entero mayor o igual a 0' });
    }

    // VALIDACIONES DE STRINGS VACÍOS
    if (!codeProduct.trim()) {
        return res.status(400).json({ message: 'El código del producto no puede estar vacío' });
    }
    if (!nameProduct.trim()) {
        return res.status(400).json({ message: 'El nombre del producto no puede estar vacío' });
    }

    // VALIDACIONES DE LONGITUD MÁXIMA
    if (nameProduct.length > 100) {
        return res.status(400).json({ message: 'El nombre del producto no puede exceder los 100 caracteres' });
    }
    if (descriptionProduct && descriptionProduct.trim().length > 300) {
        return res.status(400).json({ message: 'La descripción del producto no puede exceder los 300 caracteres' });
    }

    // VALIDAR SI EL PRODUCTO YA EXISTE
    const existingProduct = products.find(
        (producto) => producto.codeProduct === codeProduct.trim()
    );
    if (existingProduct) {
        return res.status(409).json({ message: 'Ya existe un producto con ese código' });
    }

    // CREAR EL NUEVO PRODUCTO
    const newProduct = {
        codeProduct: codeProduct.trim(),
        nameProduct: nameProduct.trim(),
        descriptionProduct: descriptionProduct && typeof descriptionProduct === 'string' 
            ? descriptionProduct.trim()
            : '',
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

    if (newCodeProduct !== undefined) {
        if (typeof newCodeProduct !== 'string' || !/^[A-Za-z]{3,10}[0-9]{1,10}$/.test(newCodeProduct.trim())) {
            return res.status(400).json({
            message: 'Formato de código inválido (use LETRAS + NUMEROS, ej: PROD001)',
            });
        }
        }


    if (newNameProduct !== undefined && typeof newNameProduct !== 'string' ){
        return res.status(400).json({ message: 'El nombre del producto debe ser texto' });
    }
    
    if (newDescriptionProduct !== undefined && typeof newDescriptionProduct !== 'string' ) {
        return res.status(400).json({ message: 'La descripción del producto debe ser texto' });
    }

    if (newPriceProduct !== undefined && 
        (typeof newPriceProduct !== 'number' || isNaN(newPriceProduct) || newPriceProduct <= 0) 
    ){
        return res.status(400).json({ message: 'El precio del producto debe ser un número válido mayor a 0' });
    }

    if (newStockProduct !== undefined && 
        (! Number.isInteger(newStockProduct) || typeof newStockProduct !== 'number' || isNaN(newStockProduct) || newStockProduct < 0) 
    ){
        return res.status(400).json({ message: 'El stock del producto debe ser un número entero mayor o igual a 0' });
    }

    //Validar strings vacíos
    if (newNameProduct !== undefined && !newNameProduct.trim()) {
        return res.status(400).json({ message: 'El nombre del producto no puede estar vacío' });
    }
    if (newDescriptionProduct !== undefined && !newDescriptionProduct.trim()) {
        return res.status(400).json({ message: 'La descripción del producto no puede estar vacía' });
    }

    //Validar longitudes máximas
    if (newNameProduct !== undefined && newNameProduct.length > 100) {
        return res.status(400).json({ message: 'El nombre del producto no puede exceder los 100 caracteres' });
    }
    if (newDescriptionProduct !== undefined && newDescriptionProduct.length > 300) {
        return res.status(400).json({ message: 'La descripción del producto no puede exceder los 300 caracteres' });
    }

    // ACTUALIZACIÓN

    const oldProduct = products[productIndex];
    const updatedProduct = {
        ...oldProduct,
        nameProduct: 
        newNameProduct !== undefined 
        ? newNameProduct.trim() 
        : oldProduct.nameProduct,

        descriptionProduct: 
        newDescriptionProduct !== undefined 
        ? newDescriptionProduct.trim() 
        : oldProduct.descriptionProduct,

        priceProduct: 
        newPriceProduct !== undefined 
        ? newPriceProduct 
        : oldProduct.priceProduct,

        stockProduct: 
        newStockProduct !== undefined 
        ? newStockProduct 
        : oldProduct.stockProduct
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
    res.status(200).json({message: 'Producto eliminado con exito'});
}

module.exports = { getListProduct, getProductByCode, createNewProduct, updateExistingProduct, deleteProduct };