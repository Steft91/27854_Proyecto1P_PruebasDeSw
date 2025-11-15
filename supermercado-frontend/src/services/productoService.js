// URL base del backend
const API_URL = 'http://localhost:3000/api/products';

/**
 * Obtener todos los productos
 */
export const obtenerTodosLosProductos = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerTodosLosProductos:', error);
    throw error;
  }
};

/**
 * Obtener un producto por código
 */
export const obtenerProductoPorCodigo = async (codigo) => {
  try {
    const response = await fetch(`${API_URL}/${codigo}`);
    if (!response.ok) {
      throw new Error('Error al obtener el producto');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en obtenerProductoPorCodigo:', error);
    throw error;
  }
};

/**
 * Crear un nuevo producto
 */
export const crearProducto = async (producto) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(producto),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el producto');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en crearProducto:', error);
    throw error;
  }
};

/**
 * Actualizar un producto existente
 */
export const actualizarProducto = async (codigo, datosActualizados) => {
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
      throw new Error(errorData.message || 'Error al actualizar el producto');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en actualizarProducto:', error);
    throw error;
  }
};

/**
 * Eliminar un producto
 */
export const eliminarProducto = async (codigo) => {
  try {
    const response = await fetch(`${API_URL}/${codigo}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error al eliminar el producto');
    }
    return await response.json();
  } catch (error) {
    console.error('Error en eliminarProducto:', error);
    throw error;
  }
};
