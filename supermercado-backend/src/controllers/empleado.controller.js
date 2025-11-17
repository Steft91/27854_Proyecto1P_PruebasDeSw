const empleados = [];

/**
 * @route GET /empleados
 * @description Obtiene todos los empleados
 */
function getListEmpleado(req, res) {
    res.json(empleados);
}

/**
 * @route GET /empleados/:cedula
 * @description Obtiene un solo empleado por su cédula
 */
function getEmpleadoByCedula(req, res) {
    const { cedula } = req.params;
    const empleado = empleados.find(e => e.cedulaEmpleado === cedula);

    if (!empleado) {
        return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    res.status(200).json(empleado);
}

/**
 * @route POST /empleados
 * @description Crea un nuevo empleado
 */
function createNewEmpleado(req, res) {
    const { cedulaEmpleado, nombreEmpleado, emailEmpleado, celularEmpleado, sueldoEmpleado } = req.body;
    
    // Validación de campos obligatorios
    if (!cedulaEmpleado || !nombreEmpleado || !celularEmpleado || sueldoEmpleado === undefined) {
        return res.status(400).json({ message: 'Campos obligatorios faltantes (cédula, nombre, celular o sueldo)' });
    }

    // Validación de cédula ecuatoriana (10 dígitos)
    if (!/^\d{10}$/.test(cedulaEmpleado)) {
        return res.status(400).json({ message: 'Cédula ecuatoriana inválida (debe tener 10 dígitos)' });
    }

    // Comprobar si el empleado ya existe
    const existingEmpleado = empleados.find(empleado => empleado.cedulaEmpleado === cedulaEmpleado);
    if (existingEmpleado) {
        return res.status(409).json({ message: 'Ya existe un empleado con esa cédula' });
    }

    // Validación del sueldo (debe ser positivo)
    if (sueldoEmpleado <= 0) {
        return res.status(400).json({ message: 'El sueldo debe ser mayor a 0' });
    }
    
    // Creación del objeto
    const newEmpleado = {
        cedulaEmpleado: cedulaEmpleado,
        nombreEmpleado: nombreEmpleado,
        emailEmpleado: emailEmpleado || '',
        celularEmpleado: celularEmpleado,
        sueldoEmpleado: sueldoEmpleado
    };

    empleados.push(newEmpleado);
    
    // Devolver 201 Created y el objeto creado
    res.status(201).json({ message: 'Empleado creado con éxito', empleado: newEmpleado });
}

/**
 * @route PUT /empleados/:cedula
 * @description Actualiza un empleado existente
 */
function updateExistingEmpleado(req, res) {
    const { cedula } = req.params;
    const { newNombreEmpleado, newEmailEmpleado, newCelularEmpleado, newSueldoEmpleado } = req.body;

    // Usar findIndex para encontrar al empleado
    const empleadoIndex = empleados.findIndex(empleado => empleado.cedulaEmpleado === cedula);

    // Manejar el error 404
    if (empleadoIndex === -1) {
        return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Validación del nuevo sueldo si se proporciona
    if (newSueldoEmpleado !== undefined && newSueldoEmpleado <= 0) {
        return res.status(400).json({ message: 'El sueldo debe ser mayor a 0' });
    }

    // Obtener el empleado antiguo para mantener los valores que no se actualizan
    const oldEmpleado = empleados[empleadoIndex];

    const updatedEmpleado = {
        cedulaEmpleado: oldEmpleado.cedulaEmpleado,
        nombreEmpleado: newNombreEmpleado || oldEmpleado.nombreEmpleado,
        emailEmpleado: newEmailEmpleado !== undefined ? newEmailEmpleado : oldEmpleado.emailEmpleado,
        celularEmpleado: newCelularEmpleado || oldEmpleado.celularEmpleado,
        sueldoEmpleado: newSueldoEmpleado !== undefined ? newSueldoEmpleado : oldEmpleado.sueldoEmpleado
    };
    
    empleados[empleadoIndex] = updatedEmpleado;

    res.status(200).json({ message: 'Empleado actualizado con éxito', empleado: updatedEmpleado });
}

/**
 * @route DELETE /empleados/:cedula
 * @description Elimina un empleado
 */
function deleteEmpleado(req, res) {
    const { cedula } = req.params;

    // Comprobar si el empleado existe
    const empleadoIndex = empleados.findIndex(empleado => empleado.cedulaEmpleado === cedula);

    // Manejar el error 404
    if (empleadoIndex === -1) {
        return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Eliminar usando splice
    empleados.splice(empleadoIndex, 1);
    
    // Devolver 200 OK
    res.status(200).json({ message: 'Empleado eliminado con éxito' });
}

module.exports = { 
    getListEmpleado, 
    getEmpleadoByCedula, 
    createNewEmpleado, 
    updateExistingEmpleado, 
    deleteEmpleado 
};
