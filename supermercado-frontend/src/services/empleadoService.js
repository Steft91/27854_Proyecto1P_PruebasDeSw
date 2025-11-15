// URL base del backend
const API_URL = 'http://localhost:3000/api/empleados';

/**
 * Obtener todos los empleados
 */
export const obtenerTodosLosEmpleados = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Error al obtener empleados');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerTodosLosEmpleados:', error);
    throw error;
  }
};

/**
 * Obtener un empleado por código
 */
export const obtenerEmpleadoPorCodigo = async (codigo) => {
  try {
    const response = await fetch(`${API_URL}/${codigo}`);
    if (!response.ok) {
      throw new Error('Error al obtener el empleado');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerEmpleadoPorCodigo:', error);
    throw error;
  }
};

/**
 * Crear un nuevo empleado
 */
export const crearEmpleado = async (empleado) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empleado),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el empleado');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en crearEmpleado:', error);
    throw error;
  }
};

/**
 * Actualizar un empleado existente
 */
export const actualizarEmpleado = async (codigo, datosActualizados) => {
  try {
    const response = await fetch(`${API_URL}/${codigo}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosActualizados),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar el empleado');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en actualizarEmpleado:', error);
    throw error;
  }
};

/**
 * Eliminar un empleado
 */
export const eliminarEmpleado = async (codigo) => {
  try {
    const response = await fetch(`${API_URL}/${codigo}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar el empleado');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en eliminarEmpleado:', error);
    throw error;
  }
};
