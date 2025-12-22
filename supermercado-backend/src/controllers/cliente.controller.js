const Cliente = require('../models/Cliente');

// Funciones de validacion
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidEcuadorianCelular = (celular) => /^09\d{8}$/.test(celular);
const isStringAndNotEmpty = (value) =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Valida cédula ecuatoriana con algoritmo de dígito verificador
 * @param {string} cedula - Cédula de 10 dígitos
 * @returns {boolean} - true si es válida, false si no
 */
const isValidEcuadorianCedula = (cedula) => {
  // Verificar que tenga 10 dígitos
  if (!/^\d{10}$/.test(cedula)) {
    return false;
  }

  // Extraer los dígitos
  const digits = cedula.split('').map(Number);

  // Los primeros 2 dígitos representan la provincia (01-24)
  const province = parseInt(cedula.substring(0, 2));
  if (province < 1 || province > 24) {
    return false;
  }

  // El tercer dígito debe ser menor a 6 (para cédulas de personas naturales)
  if (digits[2] >= 6) {
    return false;
  }

  // Algoritmo de validación del dígito verificador
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let value = digits[i] * coefficients[i];
    if (value >= 10) {
      value -= 9;
    }
    sum += value;
  }

  // Calcular el dígito verificador
  const verifier = sum % 10 === 0 ? 0 : 10 - (sum % 10);

  // Comparar con el último dígito de la cédula
  return verifier === digits[9];
};

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
      return res.status(400).json({
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
      return res.status(400).json({
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

    // Validar cédula ecuatoriana
    if (!isValidEcuadorianCedula(dniClient)) {
      return res.status(400).json({
        message: 'Cédula ecuatoriana inválida',
      });
    }

    // Validaciones de formato para email y celular
    if (emailClient && !isValidEmail(emailClient)) {
      return res
        .status(400)
        .json({ message: 'El formato del email no es válido' });
    }
    if (phoneClient && !isValidEcuadorianCelular(phoneClient)) {
      return res
        .status(400)
        .json({ message: 'Número de celular inválido. Debe empezar con 09 y tener 10 dígitos' });
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
      !isValidEcuadorianCelular(newPhoneClient)
    ) {
      return res
        .status(400)
        .json({ message: 'Número de celular inválido. Debe empezar con 09 y tener 10 dígitos' });
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

    res.status(200).json({
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
