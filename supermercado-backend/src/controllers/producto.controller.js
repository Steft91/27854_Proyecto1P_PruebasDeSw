const Producto = require('../models/Producto');
const Proveedor = require('../models/Proveedor');

/**
 * @route GET /products
 * @description Obtiene todos los productos con información del proveedor
 */
async function getListProduct(req, res) {
  try {
    const products = await Producto.find().populate(
      'proveedor',
      'nombreFiscal rucNitNif'
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @route GET /products/:code
 * @description Obtiene un solo producto por su código
 */
async function getProductByCode(req, res) {
  try {
    const { code } = req.params;
    const product = await Producto.findOne({ codeProduct: code }).populate(
      'proveedor',
      'nombreFiscal rucNitNif direccionFisica'
    );
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @route POST /products
 * @description Crea un nuevo producto
 */
async function createNewProduct(req, res) {
  try {
    const {
      codeProduct,
      nameProduct,
      descriptionProduct,
      priceProduct,
      stockProduct,
      proveedor,
    } = req.body;

    // 1. VALIDAR CAMPOS OBLIGATORIOS
    if (
      !codeProduct ||
      !nameProduct ||
      !descriptionProduct ||
      priceProduct === undefined ||
      stockProduct === undefined
    ) {
      return res
        .status(400)
        .json({ message: 'Faltan datos obligatorios del producto' });
    }

    // 2. VALIDACIONES DE STRINGS VACÍOS
    if (
      (typeof codeProduct === 'string' && !codeProduct.trim()) ||
      (typeof nameProduct === 'string' && !nameProduct.trim()) ||
      (typeof descriptionProduct === 'string' && !descriptionProduct.trim())
    ) {
      return res
        .status(400)
        .json({ message: 'Los campos no pueden estar vacíos' });
    }

    // 3. VALIDACIONES DE TIPOS DE DATOS
    if (typeof codeProduct !== 'string') {
      return res
        .status(400)
        .json({ message: 'El código del producto debe ser texto' });
    }
    if (typeof nameProduct !== 'string') {
      return res
        .status(400)
        .json({ message: 'El nombre del producto debe ser texto' });
    }
    if (typeof descriptionProduct !== 'string') {
      return res
        .status(400)
        .json({ message: 'La descripción del producto debe ser texto' });
    }
    if (typeof priceProduct !== 'number') {
      return res
        .status(400)
        .json({ message: 'El precio del producto debe ser numérico' });
    }
    if (typeof stockProduct !== 'number' || !Number.isInteger(stockProduct)) {
      return res
        .status(400)
        .json({ message: 'El stock del producto debe ser numérico entero' });
    }

    // 4. VALIDAR FORMATO DEL CÓDIGO (LETRAS + NÚMEROS)
    if (!/^[A-Za-z]{3,10}[0-9]{1,10}$/.test(codeProduct.trim())) {
      return res.status(400).json({
        message:
          'Formato de código inválido (use LETRAS + NUMEROS, ej: PROD001)',
      });
    }

    //Error (regresión)
    // 5. VALIDACIÓN DE PRECIO NO NEGATIVO
    if (priceProduct <= 0) {
      return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
    }
    // 6. VALIDACIÓN DE STOCK NO NEGATIVO
    if (stockProduct < 0) {
      return res
        .status(400)
        .json({ message: 'El stock no puede ser negativo' });
    }

    // 7. VALIDACIONES DE LONGITUD MÁXIMA
    if (nameProduct.length > 100) {
      return res.status(400).json({
        message: 'El nombre del producto no puede exceder los 100 caracteres',
      });
    }
    if (descriptionProduct.trim().length > 300) {
      return res.status(400).json({
        message:
          'La descripción del producto no puede exceder los 300 caracteres',
      });
    }

    // 8. VALIDAR SI EL PROVEEDOR EXISTE (si se proporciona)
    if (proveedor) {
      const proveedorExiste = await Proveedor.findById(proveedor);
      if (!proveedorExiste) {
        return res
          .status(404)
          .json({ message: 'El proveedor especificado no existe' });
      }
    }

    // 9. VALIDAR SI EL PRODUCTO YA EXISTE
    const existingProduct = await Producto.findOne({
      codeProduct: codeProduct.trim(),
    });
    //error (regresión)
    if (existingProduct) {
      return res
        .status(409)
        .json({ message: 'Ya existe un producto con ese código' });
    }

    // CREAR EL NUEVO PRODUCTO
    const newProduct = await Producto.create({
      codeProduct: codeProduct.trim(),
      nameProduct: nameProduct.trim(),
      descriptionProduct: descriptionProduct.trim(),
      priceProduct,
      stockProduct,
      proveedor: proveedor || null,
    });

    res.status(201).json({
      message: 'Producto creado con exito',
      product: newProduct,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * @route PUT /products/:code
 * @description Actualiza un producto por su código
 */
async function updateExistingProduct(req, res) {
  try {
    //El ID viene de req.params
    const { code } = req.params;
    const {
      newNameProduct,
      newDescriptionProduct,
      newPriceProduct,
      newStockProduct,
      newProveedor,
    } = req.body;

    //Usar findOne para encontrar al producto
    const product = await Producto.findOne({ codeProduct: code });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // VALIDACIONES

    // Validar strings vacíos solo si NO es número u otro tipo
    if (newNameProduct !== undefined) {
      if (typeof newNameProduct !== 'string') {
        return res
          .status(400)
          .json({ message: 'El nombre del producto debe ser texto' });
      }
      if (!newNameProduct.trim()) {
        return res
          .status(400)
          .json({ message: 'Los campos no pueden estar vacíos' });
      }
      if (newNameProduct.length > 100) {
        return res.status(400).json({
          message: 'El nombre del producto no puede exceder los 100 caracteres',
        });
      }
    }

    if (newDescriptionProduct !== undefined) {
      if (typeof newDescriptionProduct !== 'string') {
        return res
          .status(400)
          .json({ message: 'La descripción del producto debe ser texto' });
      }
      if (!newDescriptionProduct.trim()) {
        return res
          .status(400)
          .json({ message: 'Los campos no pueden estar vacíos' });
      }
      if (newDescriptionProduct.length > 300) {
        return res.status(400).json({
          message:
            'La descripción del producto no puede exceder los 300 caracteres',
        });
      }
    }

    // Validación de precio si se proporciona
    if (newPriceProduct !== undefined) {
      if (typeof newPriceProduct !== 'number') {
        return res
          .status(400)
          .json({ message: 'El precio del producto debe ser numérico' });
      }
      if (newPriceProduct <= 0) {
        return res
          .status(400)
          .json({ message: 'El precio del producto debe ser mayor a 0' });
      }
    }

    if (newStockProduct !== undefined) {
      if (
        typeof newStockProduct !== 'number' ||
        !Number.isInteger(newStockProduct)
      ) {
        return res
          .status(400)
          .json({ message: 'El stock del producto debe ser un número entero' });
      }
      if (newStockProduct < 0) {
        return res
          .status(400)
          .json({ message: 'El stock del producto no puede ser negativo' });
      }
    }

    // Validar que el proveedor existe si se proporciona
    if (newProveedor !== undefined) {
      if (newProveedor !== null) {
        const proveedorExiste = await Proveedor.findById(newProveedor);
        if (!proveedorExiste) {
          return res
            .status(404)
            .json({ message: 'El proveedor especificado no existe' });
        }
      }
    }

    // ACTUALIZACIÓN
    const updateData = {};
    if (newNameProduct) updateData.nameProduct = newNameProduct.trim();
    if (newDescriptionProduct)
      updateData.descriptionProduct = newDescriptionProduct.trim();
    if (newPriceProduct !== undefined)
      updateData.priceProduct = newPriceProduct;
    if (newStockProduct !== undefined)
      updateData.stockProduct = newStockProduct;
    if (newProveedor !== undefined) updateData.proveedor = newProveedor;

    const updatedProduct = await Producto.findOneAndUpdate(
      { codeProduct: code },
      updateData,
      { new: true }
    ).populate('proveedor', 'nombreFiscal rucNitNif');

    //Devolver 200 OK y el objeto actualizado
    res.status(200).json({
      message: 'Producto actualizado con exito',
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @route DELETE /products/:code
 * @description Elimina un producto por su código
 */
async function deleteProduct(req, res) {
  try {
    const { code } = req.params;

    //Comprobar si el producto existe y eliminarlo
    const product = await Producto.findOneAndDelete({ codeProduct: code });

    //Manejar el error 404
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    //Devolver 200 OK
    res.status(200).json({
      message: 'Producto eliminado con exito',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getListProduct,
  getProductByCode,
  createNewProduct,
  updateExistingProduct,
  deleteProduct,
};
