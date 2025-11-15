// URL base del backend
const API_URL = 'http://localhost:3000/api/clients';

/**
 * Obtener todos los clientes
 */
export const obtenerTodosLosClientes = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Error al obtener clientes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerTodosLosClientes:', error);
    throw error;
  }
};

/**
 * Obtener un cliente por DNI
 */
export const obtenerClientePorDni = async (dni) => {
  try {
    const response = await fetch(`${API_URL}/${dni}`);
    if (!response.ok) {
      throw new Error('Error al obtener el cliente');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerClientePorDni:', error);
    throw error;
  }
};

/**
 * Crear un nuevo cliente
 */
export const crearCliente = async (cliente) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cliente),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el cliente');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en crearCliente:', error);
    throw error;
  }
};

/**
 * Actualizar un cliente existente
 */
export const actualizarCliente = async (dni, datosActualizados) => {
  try {
    const response = await fetch(`${API_URL}/${dni}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosActualizados),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar el cliente');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en actualizarCliente:', error);
    throw error;
  }
};

/**
 * Eliminar un cliente
 */
export const eliminarCliente = async (dni) => {
  try {
    const response = await fetch(`${API_URL}/${dni}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar el cliente');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en eliminarCliente:', error);
    throw error;
  }
};
