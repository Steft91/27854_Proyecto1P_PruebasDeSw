const clients = [];

// Funciones de validacion
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^[0-9\-+]{7,15}$/.test(phone);
const isStringAndNotEmpty = (value) => typeof value === 'string' && value.trim().length > 0;

/**
 * @route GET /clients
 * @description Obtiene todos los clientes
 */
function getListClient (req, res){
    res.json(clients);
}

/**
 * @route GET /clients/:dni
 * @description Obtiene un solo cliente por su DNI
 */
function getClientByDni(req, res) {
    const { dni } = req.params;
    const client = clients.find(c => c.dniClient === dni);

    if (!client) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.status(200).json(client);
}

/**
 * @route POST /clients
 * @description Crea un nuevo cliente
 */
function createNewClient (req, res){
    let { dniClient, nameClient, surnameClient, emailClient, phoneClient, addressClient } = req.body;
    
    //Validacion de campos obligatorios
    if(!dniClient || !nameClient || !surnameClient || !addressClient){
        return res.status(400).json({message: 'Campos obligatorios faltantes (DNI, nombre, apellido o dirección)'});
    }

    if (!isStringAndNotEmpty(dniClient) || !isStringAndNotEmpty(nameClient) || 
        !isStringAndNotEmpty(surnameClient) || !isStringAndNotEmpty(addressClient)) {
        return res.status(400).json({ message: 'Los campos obligatorios deben ser texto válido y no estar vacíos' });
    }

    dniClient = dniClient.trim();
    nameClient = nameClient.trim();
    surnameClient = surnameClient.trim();
    addressClient = addressClient.trim();
    if (emailClient) emailClient = emailClient.trim();
    if (phoneClient) phoneClient = phoneClient.trim();

    // Validaciones de formato para email y telefono
    if (emailClient && !isValidEmail(emailClient)) {
        return res.status(400).json({ message: 'El formato del email no es válido' });
    }
    if (phoneClient && !isValidPhone(phoneClient)) {
        return res.status(400).json({ message: 'El formato del teléfono no es válido' });
    }

    //Comprobar si el cliente ya existe
    const existingClient = clients.find(client => client.dniClient === dniClient);
    if (existingClient) {
        return res.status(409).json({ message: 'Ya existe un cliente con ese DNI' });
    }
    
    const newClient = {
        dniClient,
        nameClient,
        surnameClient,
        emailClient: emailClient || '',
        phoneClient: phoneClient || '',
        addressClient
    };

    clients.push(newClient);
    
    //Devolver 201 Created y el objeto creado
    res.status(201).json({message: 'Cliente creado con exito', client: newClient});
}

/**
 * @route PUT /clients/:dni
 * @description Actualiza un cliente existente
 */
function updateExistingClient(req, res){
    const { dni } = req.params; 
    let { newNameClient, newSurnameClient, newEmailClient, newPhoneClient, newAddressClient } = req.body;

    const clientIndex = clients.findIndex(client => client.dniClient === dni);

    if (clientIndex === -1) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    if (newEmailClient) newEmailClient = newEmailClient.trim();
    if (newPhoneClient) newPhoneClient = newPhoneClient.trim();
    if (newNameClient) newNameClient = newNameClient.trim();
    if (newSurnameClient) newSurnameClient = newSurnameClient.trim();
    if (newAddressClient) newAddressClient = newAddressClient.trim();


    // Validaciones para los campos opcionales de actualizacion
    if (newEmailClient !== undefined && newEmailClient !== '' && !isValidEmail(newEmailClient)) {
        return res.status(400).json({ message: 'El nuevo email no tiene un formato válido' });
    }
    if (newPhoneClient !== undefined && newPhoneClient !== '' && !isValidPhone(newPhoneClient)) {
        return res.status(400).json({ message: 'El nuevo teléfono no tiene un formato válido' });
    }
    
    // Validar que si se mandan nombre o apellido, no sean cadenas vacias
    if ((newNameClient !== undefined && newNameClient.length === 0) || 
        (newSurnameClient !== undefined && newSurnameClient.length === 0)) {
        return res.status(400).json({ message: 'El nombre o apellido no pueden quedar vacíos' });
    }

    const oldClient = clients[clientIndex];

    const updatedClient = {
        dniClient: oldClient.dniClient,
        nameClient: newNameClient || oldClient.nameClient,
        surnameClient: newSurnameClient || oldClient.surnameClient,
        emailClient: newEmailClient || oldClient.emailClient,
        phoneClient: newPhoneClient || oldClient.phoneClient,
        addressClient: newAddressClient || oldClient.addressClient
    };
    
    clients[clientIndex] = updatedClient;

    res.status(200).json({message: 'Cliente actualizado con exito', client: updatedClient});
}

/**
 * @route DELETE /clients/:dni
 * @description Elimina un cliente
 */
function deleteClient (req, res){
    //El ID viene de req.params
    const { dni } = req.params;

    //Comprobar si el cliente existe
    const clientIndex = clients.findIndex(client => client.dniClient === dni);

    //Manejar el error 404
    if (clientIndex === -1) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    //Eliminar usando splice
    clients.splice(clientIndex, 1);
    
    //Devolver 200 OK
    res.status(200).json({message: 'Cliente eliminado con exito'});
}

module.exports = {getListClient, getClientByDni, createNewClient, updateExistingClient, deleteClient};