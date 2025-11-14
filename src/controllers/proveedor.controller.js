let providers = [];

/**
 * @route GET /providers
 * @description Obtiene todos los proveedores
 */
function getListProvider(req, res) {
  res.json(providers);
}

/**
 * @route GET /providers/:id
 * @description Obtiene un solo proveedor por su ID
 */
function getProviderById(req, res) {
  const { id } = req.params;
  const provider = providers.find((p) => p.idProveedor === id);

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
    idProveedor,
    nombreFiscal,
    rucNitNif,
    direccionFisica,
    telefonoPrincipal,
    correoElectronico,
    contactoNombre,
    contactoPuesto,
  } = req.body;

  // Validación de campos obligatorios
  if (!idProveedor || !nombreFiscal || !rucNitNif || !direccionFisica) {
    return res.status(400).json({
      message: 'Campos obligatorios faltantes (ID, nombre fiscal, RUC/NIT/NIF o dirección física)',
    });
  }

  // Comprobar si el proveedor ya existe
  const existingProvider = providers.find((provider) => provider.idProveedor === idProveedor);
  if (existingProvider) {
    return res.status(409).json({ message: 'Ya existe un proveedor con ese ID' });
  }

  // Comprobar si el RUC/NIT/NIF ya existe
  const existingRuc = providers.find((provider) => provider.rucNitNif === rucNitNif);
  if (existingRuc) {
    return res.status(409).json({ message: 'Ya existe un proveedor con ese RUC/NIT/NIF' });
  }

  // Creación del objeto
  const newProvider = {
    idProveedor: idProveedor,
    nombreFiscal: nombreFiscal,
    rucNitNif: rucNitNif,
    direccionFisica: direccionFisica,
    telefonoPrincipal: telefonoPrincipal || '',
    correoElectronico: correoElectronico || '',
    contactoNombre: contactoNombre || '',
    contactoPuesto: contactoPuesto || '',
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

  // Usar findIndex para encontrar al proveedor
  const providerIndex = providers.findIndex((provider) => provider.idProveedor === id);

  // Manejar el error 404
  if (providerIndex === -1) {
    return res.status(404).json({ message: 'Proveedor no encontrado' });
  }

  // Obtener el proveedor antiguo para mantener los valores que no se actualizan
  const oldProvider = providers[providerIndex];

  const updatedProvider = {
    idProveedor: oldProvider.idProveedor,
    nombreFiscal: newNombreFiscal || oldProvider.nombreFiscal,
    rucNitNif: newRucNitNif || oldProvider.rucNitNif,
    direccionFisica: newDireccionFisica || oldProvider.direccionFisica,
    telefonoPrincipal: newTelefonoPrincipal || oldProvider.telefonoPrincipal,
    correoElectronico: newCorreoElectronico || oldProvider.correoElectronico,
    contactoNombre: newContactoNombre || oldProvider.contactoNombre,
    contactoPuesto: newContactoPuesto || oldProvider.contactoPuesto,
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

  // Comprobar si el proveedor existe
  const providerIndex = providers.findIndex((provider) => provider.idProveedor === id);

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
