const Proveedor = require('../models/Proveedor');

/**
 * @route GET /providers
 * @description Obtiene todos los proveedores
 */
async function getListProvider(req, res) {
  try {
    const providers = await Proveedor.find();
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @route GET /providers/:id
 * @description Obtiene un proveedor específico por ID
 */
async function getProviderById(req, res) {
  try {
    const { id } = req.params;
    const provider = await Proveedor.findById(id);

    if (!provider) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    res.status(200).json(provider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @route POST /providers
 * @description Crea un nuevo proveedor
 */
async function createNewProvider(req, res) {
  try {
    const {
      nombreFiscal,
      rucNitNif,
      direccionFisica,
      telefonoPrincipal,
      correoElectronico,
      contactoNombre,
      contactoPuesto,
    } = req.body;

    // Validación de campos obligatorios (igual que cliente, empleado y producto)
    if (!nombreFiscal || !rucNitNif || !direccionFisica) {
      return res.status(400).json({
        message:
          'Campos obligatorios faltantes o vacíos (nombre fiscal, RUC/NIT/NIF o dirección física)',
      });
    }

    // Validar formato de RUC/NIT/NIF (debe contener entre 10 y 15 dígitos)
    if (!/^\d{10,15}$/.test(rucNitNif.trim())) {
      return res.status(400).json({
        message:
          'Formato de RUC/NIT/NIF inválido (debe contener entre 10 y 15 dígitos)',
      });
    }

    // Validar formato de email si se proporciona
    if (
      correoElectronico &&
      typeof correoElectronico === 'string' &&
      correoElectronico.trim()
    ) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoElectronico.trim())) {
        return res.status(400).json({
          message: 'Formato de correo electrónico inválido',
        });
      }
    }

    // Validar formato de teléfono si se proporciona
    if (
      telefonoPrincipal &&
      typeof telefonoPrincipal === 'string' &&
      telefonoPrincipal.trim()
    ) {
      if (!/^[\d\s\-+()]{7,20}$/.test(telefonoPrincipal.trim())) {
        return res.status(400).json({
          message:
            'Formato de teléfono inválido (debe contener entre 7 y 20 caracteres numéricos)',
        });
      }
    }

    // Validar longitud de campos opcionales si se proporcionan
    if (
      contactoNombre &&
      typeof contactoNombre === 'string' &&
      contactoNombre.trim().length > 100
    ) {
      return res.status(400).json({
        message: 'El nombre de contacto no puede exceder 100 caracteres',
      });
    }

    if (
      contactoPuesto &&
      typeof contactoPuesto === 'string' &&
      contactoPuesto.trim().length > 100
    ) {
      return res.status(400).json({
        message: 'El puesto de contacto no puede exceder 100 caracteres',
      });
    }

    // Comprobar si el RUC/NIT/NIF ya existe
    const existingRuc = await Proveedor.findOne({
      rucNitNif: rucNitNif.trim(),
    });
    if (existingRuc) {
      return res
        .status(409)
        .json({ message: 'Ya existe un proveedor con ese RUC/NIT/NIF' });
    }

    // Creación del objeto con datos sanitizados
    const newProvider = await Proveedor.create({
      nombreFiscal: nombreFiscal.trim(),
      rucNitNif: rucNitNif.trim(),
      direccionFisica: direccionFisica.trim(),
      telefonoPrincipal:
        telefonoPrincipal && typeof telefonoPrincipal === 'string'
          ? telefonoPrincipal.trim()
          : '',
      correoElectronico:
        correoElectronico && typeof correoElectronico === 'string'
          ? correoElectronico.trim()
          : '',
      contactoNombre:
        contactoNombre && typeof contactoNombre === 'string'
          ? contactoNombre.trim()
          : '',
      contactoPuesto:
        contactoPuesto && typeof contactoPuesto === 'string'
          ? contactoPuesto.trim()
          : '',
    });

    // Devolver 201 Created y el objeto creado
    res.status(201).json({
      message: 'Proveedor creado con exito',
      provider: newProvider,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * @route PUT /providers/:id
 * @description Actualiza un proveedor existente
 */
async function updateExistingProvider(req, res) {
  try {
    const { id } = req.params;
    const {
      newNombreFiscal,
      newRucNitNif,
      newDireccionFisica,
      newTelefonoPrincipal,
      newCorreoElectronico,
      newContactoNombre,
      newContactoPuesto,
    } = req.body;

    // Usar findById para encontrar al proveedor
    const provider = await Proveedor.findById(id);

    // Manejar el error 404
    if (!provider) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Validar tipos de datos si se proporcionan
    if (newNombreFiscal !== undefined && typeof newNombreFiscal !== 'string') {
      return res
        .status(400)
        .json({ message: 'El nombre fiscal debe ser texto' });
    }
    if (newRucNitNif !== undefined && typeof newRucNitNif !== 'string') {
      return res.status(400).json({ message: 'El RUC/NIT/NIF debe ser texto' });
    }
    if (
      newDireccionFisica !== undefined &&
      typeof newDireccionFisica !== 'string'
    ) {
      return res
        .status(400)
        .json({ message: 'La dirección física debe ser texto' });
    }

    // Validar strings vacíos si se proporcionan
    if (newNombreFiscal !== undefined && !newNombreFiscal.trim()) {
      return res
        .status(400)
        .json({ message: 'El nombre fiscal no puede estar vacío' });
    }
    if (newDireccionFisica !== undefined && !newDireccionFisica.trim()) {
      return res
        .status(400)
        .json({ message: 'La dirección física no puede estar vacía' });
    }

    // Validar formato de RUC/NIT/NIF si se proporciona
    if (newRucNitNif !== undefined) {
      if (!newRucNitNif.trim()) {
        return res
          .status(400)
          .json({ message: 'El RUC/NIT/NIF no puede estar vacío' });
      }
      if (!/^\d{10,15}$/.test(newRucNitNif.trim())) {
        return res.status(400).json({
          message:
            'Formato de RUC/NIT/NIF inválido (debe contener entre 10 y 15 dígitos)',
        });
      }
    }

    // Validar formato de email si se proporciona
    if (
      newCorreoElectronico !== undefined &&
      typeof newCorreoElectronico === 'string' &&
      newCorreoElectronico.trim()
    ) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCorreoElectronico.trim())) {
        return res.status(400).json({
          message: 'Formato de correo electrónico inválido',
        });
      }
    }

    // Validar formato de teléfono si se proporciona
    if (
      newTelefonoPrincipal !== undefined &&
      typeof newTelefonoPrincipal === 'string' &&
      newTelefonoPrincipal.trim()
    ) {
      if (!/^[\d\s\-+()]{7,20}$/.test(newTelefonoPrincipal.trim())) {
        return res.status(400).json({
          message:
            'Formato de teléfono inválido (debe contener entre 7 y 20 caracteres numéricos)',
        });
      }
    }

    // Validar longitud de campos opcionales si se proporcionan
    if (
      newContactoNombre !== undefined &&
      typeof newContactoNombre === 'string' &&
      newContactoNombre.trim().length > 100
    ) {
      return res.status(400).json({
        message: 'El nombre de contacto no puede exceder 100 caracteres',
      });
    }

    if (
      newContactoPuesto !== undefined &&
      typeof newContactoPuesto === 'string' &&
      newContactoPuesto.trim().length > 100
    ) {
      return res.status(400).json({
        message: 'El puesto de contacto no puede exceder 100 caracteres',
      });
    }

    // Actualizar datos
    const updateData = {};
    if (newNombreFiscal) updateData.nombreFiscal = newNombreFiscal.trim();
    if (newRucNitNif) updateData.rucNitNif = newRucNitNif.trim();
    if (newDireccionFisica)
      updateData.direccionFisica = newDireccionFisica.trim();
    if (newTelefonoPrincipal !== undefined)
      updateData.telefonoPrincipal =
        typeof newTelefonoPrincipal === 'string'
          ? newTelefonoPrincipal.trim()
          : '';
    if (newCorreoElectronico !== undefined)
      updateData.correoElectronico =
        typeof newCorreoElectronico === 'string'
          ? newCorreoElectronico.trim()
          : '';
    if (newContactoNombre !== undefined)
      updateData.contactoNombre =
        typeof newContactoNombre === 'string' ? newContactoNombre.trim() : '';
    if (newContactoPuesto !== undefined)
      updateData.contactoPuesto =
        typeof newContactoPuesto === 'string' ? newContactoPuesto.trim() : '';

    const updatedProvider = await Proveedor.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({
      message: 'Proveedor actualizado con exito',
      provider: updatedProvider,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @route DELETE /providers/:id
 * @description Elimina un proveedor
 */
async function deleteProvider(req, res) {
  try {
    const { id } = req.params;

    // Comprobar si el proveedor existe y eliminarlo
    const provider = await Proveedor.findByIdAndDelete(id);

    // Manejar el error 404
    if (!provider) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    // Devolver 200 OK
    res.status(200).json({ message: 'Proveedor eliminado con exito' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getListProvider,
  getProviderById,
  createNewProvider,
  updateExistingProvider,
  deleteProvider,
};
