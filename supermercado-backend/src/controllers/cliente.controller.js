const Cliente = require('../models/Cliente');

// Funciones de validacion
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^[0-9\-+]{7,15}$/.test(phone);
const isStringAndNotEmpty = (value) =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * @route GET /clients
 * @description Obtiene todos los clientes
 */
async function getListClient(req, res) {
  try {
    const clients = await Cliente.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @route GET /clients/:dni
 * @description Obtiene un solo cliente por su DNI
 */
async function getClientByDni(req, res) {
  try {
    const { dni } = req.params;
    const client = await Cliente.findOne({ dniClient: dni });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @route POST /clients
 * @description Crea un nuevo cliente
 */
async function createNewClient(req, res) {
  try {
    let {
      dniClient,
      nameClient,
      surnameClient,
      emailClient,
      phoneClient,
      addressClient,
    } = req.body;

    //Validacion de campos obligatorios
    if (!dniClient || !nameClient || !surnameClient || !addressClient) {
      return res
        .status(400)
        .json({
          message:
            'Campos obligatorios faltantes (DNI, nombre, apellido o dirección)',
        });
    }

    if (
      !isStringAndNotEmpty(dniClient) ||
      !isStringAndNotEmpty(nameClient) ||
      !isStringAndNotEmpty(surnameClient) ||
      !isStringAndNotEmpty(addressClient)
    ) {
      return res
        .status(400)
        .json({
          message:
            'Los campos obligatorios deben ser texto válido y no estar vacíos',
        });
    }

    dniClient = dniClient.trim();
    nameClient = nameClient.trim();
    surnameClient = surnameClient.trim();
    addressClient = addressClient.trim();
    if (emailClient) emailClient = emailClient.trim();
    if (phoneClient) phoneClient = phoneClient.trim();

    // Validaciones de formato para email y telefono
    if (emailClient && !isValidEmail(emailClient)) {
      return res
        .status(400)
        .json({ message: 'El formato del email no es válido' });
    }
    if (phoneClient && !isValidPhone(phoneClient)) {
      return res
        .status(400)
        .json({ message: 'El formato del teléfono no es válido' });
    }

    //Comprobar si el cliente ya existe
    const existingClient = await Cliente.findOne({ dniClient });
    if (existingClient) {
      return res
        .status(409)
        .json({ message: 'Ya existe un cliente con ese DNI' });
    }

    const newClient = await Cliente.create({
      dniClient,
      nameClient,
      surnameClient,
      emailClient: emailClient || '',
      phoneClient: phoneClient || '',
      addressClient,
    });

    //Devolver 201 Created y el objeto creado
    res
      .status(201)
      .json({ message: 'Cliente creado con exito', client: newClient });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * @route PUT /clients/:dni
 * @description Actualiza un cliente existente
 */
async function updateExistingClient(req, res) {
  try {
    const { dni } = req.params;
    let {
      newNameClient,
      newSurnameClient,
      newEmailClient,
      newPhoneClient,
      newAddressClient,
    } = req.body;

    const client = await Cliente.findOne({ dniClient: dni });

    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    if (newEmailClient) newEmailClient = newEmailClient.trim();
    if (newPhoneClient) newPhoneClient = newPhoneClient.trim();
    if (newNameClient) newNameClient = newNameClient.trim();
    if (newSurnameClient) newSurnameClient = newSurnameClient.trim();
    if (newAddressClient) newAddressClient = newAddressClient.trim();

    // Validaciones para los campos opcionales de actualizacion
    if (
      newEmailClient !== undefined &&
      newEmailClient !== '' &&
      !isValidEmail(newEmailClient)
    ) {
      return res
        .status(400)
        .json({ message: 'El nuevo email no tiene un formato válido' });
    }
    if (
      newPhoneClient !== undefined &&
      newPhoneClient !== '' &&
      !isValidPhone(newPhoneClient)
    ) {
      return res
        .status(400)
        .json({ message: 'El nuevo teléfono no tiene un formato válido' });
    }

    // Validar que si se mandan nombre o apellido, no sean cadenas vacias
    if (
      (newNameClient !== undefined && newNameClient.length === 0) ||
      (newSurnameClient !== undefined && newSurnameClient.length === 0)
    ) {
      return res
        .status(400)
        .json({ message: 'El nombre o apellido no pueden quedar vacíos' });
    }

    const updateData = {};
    if (newNameClient) updateData.nameClient = newNameClient;
    if (newSurnameClient) updateData.surnameClient = newSurnameClient;
    if (newEmailClient !== undefined) updateData.emailClient = newEmailClient;
    if (newPhoneClient !== undefined) updateData.phoneClient = newPhoneClient;
    if (newAddressClient) updateData.addressClient = newAddressClient;

    const updatedClient = await Cliente.findOneAndUpdate(
      { dniClient: dni },
      updateData,
      { new: true }
    );

    res
      .status(200)
      .json({
        message: 'Cliente actualizado con exito',
        client: updatedClient,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @route DELETE /clients/:dni
 * @description Elimina un cliente
 */
async function deleteClient(req, res) {
  try {
    //El ID viene de req.params
    const { dni } = req.params;

    //Comprobar si el cliente existe y eliminarlo
    const client = await Cliente.findOneAndDelete({ dniClient: dni });

    //Manejar el error 404
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    //Devolver 200 OK
    res.status(200).json({ message: 'Cliente eliminado con exito' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getListClient,
  getClientByDni,
  createNewClient,
  updateExistingClient,
  deleteClient,
};
