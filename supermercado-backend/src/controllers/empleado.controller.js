const Empleado = require('../models/Empleado');

/**
 * @route GET /empleados
 * @description Obtiene todos los empleados
 */
async function getListEmpleado(req, res) {
  try {
    const empleados = await Empleado.find();
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @route GET /empleados/:cedula
 * @description Obtiene un solo empleado por su cédula
 */
async function getEmpleadoByCedula(req, res) {
  try {
    const { cedula } = req.params;
    const empleado = await Empleado.findOne({ cedulaEmpleado: cedula });

    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    res.status(200).json(empleado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @route POST /empleados
 * @description Crea un nuevo empleado
 */
async function createNewEmpleado(req, res) {
  try {
    const {
      cedulaEmpleado,
      nombreEmpleado,
      emailEmpleado,
      celularEmpleado,
      sueldoEmpleado,
    } = req.body;

    // Validación de campos obligatorios
    if (
      !cedulaEmpleado ||
      !nombreEmpleado ||
      !celularEmpleado ||
      sueldoEmpleado === undefined
    ) {
      return res.status(400).json({
        message:
          'Campos obligatorios faltantes (cédula, nombre, celular o sueldo)',
      });
    }

    // Validación de cédula ecuatoriana (10 dígitos)
    if (!/^\d{10}$/.test(cedulaEmpleado)) {
      return res.status(400).json({
        message: 'Cédula ecuatoriana inválida (debe tener 10 dígitos)',
      });
    }

    // Comprobar si el empleado ya existe
    const existingEmpleado = await Empleado.findOne({ cedulaEmpleado });
    if (existingEmpleado) {
      return res
        .status(409)
        .json({ message: 'Ya existe un empleado con esa cédula' });
    }

    // Validación del sueldo (debe ser positivo)
    if (sueldoEmpleado <= 0) {
      return res.status(400).json({ message: 'El sueldo debe ser mayor a 0' });
    }

    // Creación del objeto
    const newEmpleado = await Empleado.create({
      cedulaEmpleado,
      nombreEmpleado,
      emailEmpleado: emailEmpleado || '',
      celularEmpleado,
      sueldoEmpleado,
    });

    // Devolver 201 Created y el objeto creado
    res
      .status(201)
      .json({ message: 'Empleado creado con éxito', empleado: newEmpleado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * @route PUT /empleados/:cedula
 * @description Actualiza un empleado existente
 */
async function updateExistingEmpleado(req, res) {
  try {
    const { cedula } = req.params;
    const {
      newNombreEmpleado,
      newEmailEmpleado,
      newCelularEmpleado,
      newSueldoEmpleado,
    } = req.body;

    // Usar findOne para encontrar al empleado
    const empleado = await Empleado.findOne({ cedulaEmpleado: cedula });

    // Manejar el error 404
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Validación del nuevo sueldo si se proporciona
    if (newSueldoEmpleado !== undefined && newSueldoEmpleado <= 0) {
      return res.status(400).json({ message: 'El sueldo debe ser mayor a 0' });
    }

    const updateData = {};
    if (newNombreEmpleado !== undefined)
      updateData.nombreEmpleado = newNombreEmpleado;
    if (newEmailEmpleado !== undefined)
      updateData.emailEmpleado = newEmailEmpleado;
    if (newCelularEmpleado !== undefined)
      updateData.celularEmpleado = newCelularEmpleado;
    if (newSueldoEmpleado !== undefined)
      updateData.sueldoEmpleado = newSueldoEmpleado;

    const updatedEmpleado = await Empleado.findOneAndUpdate(
      { cedulaEmpleado: cedula },
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: 'Empleado actualizado con éxito',
      empleado: updatedEmpleado,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * @route DELETE /empleados/:cedula
 * @description Elimina un empleado
 */
async function deleteEmpleado(req, res) {
  try {
    const { cedula } = req.params;

    // Comprobar si el empleado existe y eliminarlo
    const empleado = await Empleado.findOneAndDelete({
      cedulaEmpleado: cedula,
    });

    // Manejar el error 404
    if (!empleado) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    // Devolver 200 OK
    res.status(200).json({ message: 'Empleado eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getListEmpleado,
  getEmpleadoByCedula,
  createNewEmpleado,
  updateExistingEmpleado,
  deleteEmpleado,
};
