import React, { useState, useEffect } from 'react';

function ProductoForm({ onGuardar, productoEditar, onCancelar }) {
  const [formData, setFormData] = useState({
    codeProduct: '',
    nameProduct: '',
    descriptionProduct: '',
    priceProduct: '',
    stockProduct: '',
  });

  useEffect(() => {
    if (productoEditar) {
      setFormData({
        codeProduct: productoEditar.codeProduct || '',
        nameProduct: productoEditar.nameProduct || '',
        descriptionProduct: productoEditar.descriptionProduct || '',
        priceProduct: productoEditar.priceProduct || '',
        stockProduct: productoEditar.stockProduct || '',
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
      !formData.codeProduct ||
      !formData.nameProduct ||
      !formData.priceProduct ||
      !formData.stockProduct
    ) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    const dataToSend = {
      codeProduct: formData.codeProduct,
      nameProduct: formData.nameProduct,
      descriptionProduct: formData.descriptionProduct,
      priceProduct: parseFloat(formData.priceProduct),
      stockProduct: parseInt(formData.stockProduct, 10),
    };

    if (productoEditar) {
      // Actualizar - enviamos solo los campos con prefijo 'new'
      const datosActualizados = {
        newNameProduct: dataToSend.nameProduct,
        newDescriptionProduct: dataToSend.descriptionProduct,
        newPriceProduct: dataToSend.priceProduct,
        newStockProduct: dataToSend.stockProduct,
      };
      onGuardar(datosActualizados);
    } else {
      // Crear nuevo
      onGuardar(dataToSend);
    }

    // Limpiar formulario
    setFormData({
      codeProduct: '',
      nameProduct: '',
      descriptionProduct: '',
      priceProduct: '',
      stockProduct: '',
    });
  };

  const handleCancelar = () => {
    setFormData({
      codeProduct: '',
      nameProduct: '',
      descriptionProduct: '',
      priceProduct: '',
      stockProduct: '',
    });
    onCancelar();
  };

  return (
    <div className="form-container">
      <h2>{productoEditar ? 'Editar Producto' : 'Registrar Nuevo Producto'}</h2>
      <form onSubmit={handleSubmit} className="data-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="codeProduct">
              Código Producto <span className="required">*</span>
            </label>
            <input
              type="text"
              id="codeProduct"
              name="codeProduct"
              value={formData.codeProduct}
              onChange={handleChange}
              disabled={productoEditar ? true : false}
              placeholder="Ej: PROD001"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nameProduct">
              Nombre <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nameProduct"
              name="nameProduct"
              value={formData.nameProduct}
              onChange={handleChange}
              placeholder="Ej: Pan Integral"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="descriptionProduct">Descripción</label>
          <textarea
            id="descriptionProduct"
            name="descriptionProduct"
            value={formData.descriptionProduct}
            onChange={handleChange}
            placeholder="Descripción del producto"
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priceProduct">
              Precio <span className="required">*</span>
            </label>
            <input
              type="number"
              id="priceProduct"
              name="priceProduct"
              value={formData.priceProduct}
              onChange={handleChange}
              placeholder="Ej: 2.50"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stockProduct">
              Stock <span className="required">*</span>
            </label>
            <input
              type="number"
              id="stockProduct"
              name="stockProduct"
              value={formData.stockProduct}
              onChange={handleChange}
              placeholder="Ej: 100"
              min="0"
              required
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
