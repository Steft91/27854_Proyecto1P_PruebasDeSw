let clients = [];

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
    const { dniClient, nameClient, surnameClient, emailClient, phoneClient, addressClient } = req.body;
    
    //Validación de campos obligatorios
    if(!dniClient || !nameClient || !surnameClient || !addressClient){
        return res.status(400).json({message: 'Campos obligatorios faltantes (DNI, nombre, apellido o dirección)'});
    }

    //Buena práctica: Comprobar si el cliente ya existe
    const existingClient = clients.find(client => client.dniClient === dniClient);
    if (existingClient) {
        return res.status(409).json({ message: 'Ya existe un cliente con ese DNI' });
    }
    
    //Creación del objeto
    const newClient = {
        dniClient: dniClient,
        nameClient: nameClient,
        surnameClient: surnameClient,
        emailClient: emailClient || '',
        phoneClient: phoneClient || '',
        addressClient: addressClient
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
    // El ID viene de req.params
    const { dni } = req.params; 
    const { newNameClient, newSurnameClient, newEmailClient, newPhoneClient, newAddressClient } = req.body;

    // Usar findIndex para encontrar al cliente
    const clientIndex = clients.findIndex(client => client.dniClient === dni);

    // Manejar el error 404
    if (clientIndex === -1) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Obtener el cliente antiguo para mantener los valores que no se actualizan
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