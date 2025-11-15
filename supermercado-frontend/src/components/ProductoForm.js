import React, { useState, useEffect } from 'react';

function ProductoForm({ onGuardar, productoEditar, onCancelar }) {
  const [formData, setFormData] = useState({
    codigoProducto: '',
    nombreProducto: '',
    descripcionProducto: '',
    precioProducto: '',
    stockProducto: '',
    categoriaProducto: '',
  });

  useEffect(() => {
    if (productoEditar) {
      setFormData({
        codigoProducto: productoEditar.codigoProducto || '',
        nombreProducto: productoEditar.nombreProducto || '',
        descripcionProducto: productoEditar.descripcionProducto || '',
        precioProducto: productoEditar.precioProducto || '',
        stockProducto: productoEditar.stockProducto || '',
        categoriaProducto: productoEditar.categoriaProducto || '',
      });
    }
  }, [productoEditar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.codigoProducto ||
      !formData.nombreProducto ||
      !formData.precioProducto ||
      !formData.stockProducto
    ) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    const dataToSend = {
      ...formData,
      precioProducto: parseFloat(formData.precioProducto),
      stockProducto: parseInt(formData.stockProducto, 10),
    };

    if (productoEditar) {
      // Actualizar - enviamos solo los campos con prefijo 'new'
      const datosActualizados = {
        newNombreProducto: dataToSend.nombreProducto,
        newDescripcionProducto: dataToSend.descripcionProducto,
        newPrecioProducto: dataToSend.precioProducto,
        newStockProducto: dataToSend.stockProducto,
        newCategoriaProducto: dataToSend.categoriaProducto,
      };
      onGuardar(datosActualizados);
    } else {
      // Crear nuevo
      onGuardar(dataToSend);
    }

    // Limpiar formulario
    setFormData({
      codigoProducto: '',
      nombreProducto: '',
      descripcionProducto: '',
      precioProducto: '',
      stockProducto: '',
      categoriaProducto: '',
    });
  };

  const handleCancelar = () => {
    setFormData({
      codigoProducto: '',
      nombreProducto: '',
      descripcionProducto: '',
      precioProducto: '',
      stockProducto: '',
      categoriaProducto: '',
    });
    onCancelar();
  };

  return (
    <div className="form-container">
      <h2>{productoEditar ? 'Editar Producto' : 'Registrar Nuevo Producto'}</h2>
      <form onSubmit={handleSubmit} className="data-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="codigoProducto">
              Código Producto <span className="required">*</span>
            </label>
            <input
              type="text"
              id="codigoProducto"
              name="codigoProducto"
              value={formData.codigoProducto}
              onChange={handleChange}
              disabled={productoEditar ? true : false}
              placeholder="Ej: PROD001"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nombreProducto">
              Nombre <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nombreProducto"
              name="nombreProducto"
              value={formData.nombreProducto}
              onChange={handleChange}
              placeholder="Ej: Pan Integral"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="descripcionProducto">Descripción</label>
          <textarea
            id="descripcionProducto"
            name="descripcionProducto"
            value={formData.descripcionProducto}
            onChange={handleChange}
            placeholder="Descripción del producto"
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="precioProducto">
              Precio <span className="required">*</span>
            </label>
            <input
              type="number"
              id="precioProducto"
              name="precioProducto"
              value={formData.precioProducto}
              onChange={handleChange}
              placeholder="Ej: 2.50"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stockProducto">
              Stock <span className="required">*</span>
            </label>
            <input
              type="number"
              id="stockProducto"
              name="stockProducto"
              value={formData.stockProducto}
              onChange={handleChange}
              placeholder="Ej: 100"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoriaProducto">Categoría</label>
            <input
              type="text"
              id="categoriaProducto"
              name="categoriaProducto"
              value={formData.categoriaProducto}
              onChange={handleChange}
              placeholder="Ej: Panadería"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {productoEditar ? 'Actualizar' : 'Guardar'}
          </button>
          {productoEditar && (
            <button type="button" className="btn-secondary" onClick={handleCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProductoForm;
