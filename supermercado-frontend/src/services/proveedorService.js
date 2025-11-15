// URL base del backend
const API_URL = 'http://localhost:3000/api/providers';

/**
 * Obtener todos los proveedores
 */
export const obtenerTodosLosProveedores = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Error al obtener proveedores');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerTodosLosProveedores:', error);
    throw error;
  }
};

/**
 * Obtener un proveedor por ID
 */
export const obtenerProveedorPorId = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener el proveedor');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerProveedorPorId:', error);
    throw error;
  }
};

/**
 * Crear un nuevo proveedor
 */
export const crearProveedor = async (proveedor) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proveedor),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el proveedor');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en crearProveedor:', error);
    throw error;
  }
};

/**
 * Actualizar un proveedor existente
 */
export const actualizarProveedor = async (id, datosActualizados) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosActualizados),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar el proveedor');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en actualizarProveedor:', error);
    throw error;
  }
};

/**
 * Eliminar un proveedor
 */
export const eliminarProveedor = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar el proveedor');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en eliminarProveedor:', error);
    throw error;
  }
};
