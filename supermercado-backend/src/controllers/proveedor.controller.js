let providers = [];
let nextProviderId = 1; // Contador para ID autoincremental

/**
 * @route GET /providers
 * @description Obtiene todos los proveedores
 */
function getListProvider(req, res) {
  res.json(providers);
}

/**
 * @route GET /providers/:id
 * @description Obtiene un proveedor específico por ID
 */
function getProviderById(req, res) {
  const { id } = req.params;
  // Convertir ID de string a número para comparar con IDs autoincrementales
  const provider = providers.find((p) => p.idProveedor === Number(id));

  if (!provider) {
    return res.status(404).json({ message: 'Proveedor no encontrado' });
  }

  res.status(200).json(provider);
}

/**
 * @route POST /providers
 * @description Crea un nuevo proveedor
 */
function createNewProvider(req, res) {
  const {
    nombreFiscal,
    rucNitNif,
    direccionFisica,
    telefonoPrincipal,
    correoElectronico,
    contactoNombre,
    contactoPuesto,
  } = req.body;

  // Validación de tipos de datos
  if (
    typeof nombreFiscal !== 'string' ||
    typeof rucNitNif !== 'string' ||
    typeof direccionFisica !== 'string'
  ) {
    return res.status(400).json({
      message: 'Los campos obligatorios deben ser texto',
    });
  }

  // Validación de campos obligatorios y strings vacíos
  if (!nombreFiscal.trim() || !rucNitNif.trim() || !direccionFisica.trim()) {
    return res.status(400).json({
      message:
        'Campos obligatorios faltantes o vacíos (nombre fiscal, RUC/NIT/NIF o dirección física)',
    });
  }

  // Validar formato de RUC/NIT/NIF (debe contener entre 10 y 15 dígitos)
  if (!/^\d{10,15}$/.test(rucNitNif.trim())) {
    return res.status(400).json({
      message: 'Formato de RUC/NIT/NIF inválido (debe contener entre 10 y 15 dígitos)',
    });
  }

  // Validar formato de email si se proporciona
  if (correoElectronico && typeof correoElectronico === 'string' && correoElectronico.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoElectronico.trim())) {
      return res.status(400).json({
        message: 'Formato de correo electrónico inválido',
      });
    }
  }

  // Validar formato de teléfono si se proporciona
  if (telefonoPrincipal && typeof telefonoPrincipal === 'string' && telefonoPrincipal.trim()) {
    if (!/^[\d\s\-+()]{7,20}$/.test(telefonoPrincipal.trim())) {
      return res.status(400).json({
        message: 'Formato de teléfono inválido (debe contener entre 7 y 20 caracteres numéricos)',
      });
    }
  }

  // Validar longitud de campos opcionales si se proporcionan
  if (contactoNombre && typeof contactoNombre === 'string' && contactoNombre.trim().length > 100) {
    return res.status(400).json({
      message: 'El nombre de contacto no puede exceder 100 caracteres',
    });
  }

  if (contactoPuesto && typeof contactoPuesto === 'string' && contactoPuesto.trim().length > 100) {
    return res.status(400).json({
      message: 'El puesto de contacto no puede exceder 100 caracteres',
    });
  }

  // Comprobar si el RUC/NIT/NIF ya existe
  const existingRuc = providers.find((provider) => provider.rucNitNif === rucNitNif.trim());
  if (existingRuc) {
    return res.status(409).json({ message: 'Ya existe un proveedor con ese RUC/NIT/NIF' });
  }

  // Creación del objeto con datos sanitizados y ID autoincremental
  const newProvider = {
    idProveedor: nextProviderId++, // Asignar ID autoincremental
    nombreFiscal: nombreFiscal.trim(),
    rucNitNif: rucNitNif.trim(),
    direccionFisica: direccionFisica.trim(),
    telefonoPrincipal:
      telefonoPrincipal && typeof telefonoPrincipal === 'string' ? telefonoPrincipal.trim() : '',
    correoElectronico:
      correoElectronico && typeof correoElectronico === 'string' ? correoElectronico.trim() : '',
    contactoNombre:
      contactoNombre && typeof contactoNombre === 'string' ? contactoNombre.trim() : '',
    contactoPuesto:
      contactoPuesto && typeof contactoPuesto === 'string' ? contactoPuesto.trim() : '',
  };

  providers.push(newProvider);

  // Devolver 201 Created y el objeto creado
  res.status(201).json({ message: 'Proveedor creado con exito', provider: newProvider });
}

/**
 * @route PUT /providers/:id
 * @description Actualiza un proveedor existente
 */
function updateExistingProvider(req, res) {
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

  // Usar findIndex para encontrar al proveedor (convertir ID de string a número)
  const providerIndex = providers.findIndex((provider) => provider.idProveedor === Number(id));

  // Manejar el error 404
  if (providerIndex === -1) {
    return res.status(404).json({ message: 'Proveedor no encontrado' });
  }

  // Validar tipos de datos si se proporcionan
  if (newNombreFiscal !== undefined && typeof newNombreFiscal !== 'string') {
    return res.status(400).json({ message: 'El nombre fiscal debe ser texto' });
  }
  if (newRucNitNif !== undefined && typeof newRucNitNif !== 'string') {
    return res.status(400).json({ message: 'El RUC/NIT/NIF debe ser texto' });
  }
  if (newDireccionFisica !== undefined && typeof newDireccionFisica !== 'string') {
    return res.status(400).json({ message: 'La dirección física debe ser texto' });
  }

  // Validar strings vacíos si se proporcionan
  if (newNombreFiscal !== undefined && !newNombreFiscal.trim()) {
    return res.status(400).json({ message: 'El nombre fiscal no puede estar vacío' });
  }
  if (newDireccionFisica !== undefined && !newDireccionFisica.trim()) {
    return res.status(400).json({ message: 'La dirección física no puede estar vacía' });
  }

  // Validar formato de RUC/NIT/NIF si se proporciona
  if (newRucNitNif !== undefined) {
    if (!newRucNitNif.trim()) {
      return res.status(400).json({ message: 'El RUC/NIT/NIF no puede estar vacío' });
    }
    if (!/^\d{10,15}$/.test(newRucNitNif.trim())) {
      return res.status(400).json({
        message: 'Formato de RUC/NIT/NIF inválido (debe contener entre 10 y 15 dígitos)',
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
        message: 'Formato de teléfono inválido (debe contener entre 7 y 20 caracteres numéricos)',
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

  // Obtener el proveedor antiguo para mantener los valores que no se actualizan
  const oldProvider = providers[providerIndex];

  const updatedProvider = {
    idProveedor: oldProvider.idProveedor,
    nombreFiscal: newNombreFiscal ? newNombreFiscal.trim() : oldProvider.nombreFiscal,
    rucNitNif: newRucNitNif ? newRucNitNif.trim() : oldProvider.rucNitNif,
    direccionFisica: newDireccionFisica ? newDireccionFisica.trim() : oldProvider.direccionFisica,
    telefonoPrincipal:
      newTelefonoPrincipal !== undefined
        ? typeof newTelefonoPrincipal === 'string'
          ? newTelefonoPrincipal.trim()
          : ''
        : oldProvider.telefonoPrincipal,
    correoElectronico:
      newCorreoElectronico !== undefined
        ? typeof newCorreoElectronico === 'string'
          ? newCorreoElectronico.trim()
          : ''
        : oldProvider.correoElectronico,
    contactoNombre:
      newContactoNombre !== undefined
        ? typeof newContactoNombre === 'string'
          ? newContactoNombre.trim()
          : ''
        : oldProvider.contactoNombre,
    contactoPuesto:
      newContactoPuesto !== undefined
        ? typeof newContactoPuesto === 'string'
          ? newContactoPuesto.trim()
          : ''
        : oldProvider.contactoPuesto,
  };

  providers[providerIndex] = updatedProvider;

  res.status(200).json({ message: 'Proveedor actualizado con exito', provider: updatedProvider });
}

/**
 * @route DELETE /providers/:id
 * @description Elimina un proveedor
 */
function deleteProvider(req, res) {
  const { id } = req.params;

  // Comprobar si el proveedor existe (convertir ID de string a número)
  const providerIndex = providers.findIndex((provider) => provider.idProveedor === Number(id));

  // Manejar el error 404
  if (providerIndex === -1) {
    return res.status(404).json({ message: 'Proveedor no encontrado' });
  }

  // Eliminar usando splice
  providers.splice(providerIndex, 1);

  // Devolver 200 OK
  res.status(200).json({ message: 'Proveedor eliminado con exito' });
}

module.exports = {
  getListProvider,
  getProviderById,
  createNewProvider,
  updateExistingProvider,
  deleteProvider,
};
