const Empleado = require('../models/Empleado');

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
      direccionEmpleado,
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

    // Validación de cédula ecuatoriana con dígito verificador
    if (!isValidEcuadorianCedula(cedulaEmpleado)) {
      return res.status(400).json({
        message: 'Cédula ecuatoriana inválida',
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
      direccionEmpleado: direccionEmpleado || '',
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
      newDireccionEmpleado,
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
    if (newDireccionEmpleado !== undefined)
      updateData.direccionEmpleado = newDireccionEmpleado;
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
