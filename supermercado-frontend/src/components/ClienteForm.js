import React, { useState, useEffect } from 'react';

function ClienteForm({ onGuardar, clienteEditar, onCancelar }) {
  const [formData, setFormData] = useState({
    dniClient: '',
    nameClient: '',
    surnameClient: '',
    addressClient: '',
    emailClient: '',
    phoneClient: '',
  });

  useEffect(() => {
    if (clienteEditar) {
      setFormData({
        dniClient: clienteEditar.dniClient || '',
        nameClient: clienteEditar.nameClient || '',
        surnameClient: clienteEditar.surnameClient || '',
        addressClient: clienteEditar.addressClient || '',
        emailClient: clienteEditar.emailClient || '',
        phoneClient: clienteEditar.phoneClient || '',
      });
    }
  }, [clienteEditar]);

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
      !formData.dniClient ||
      !formData.nameClient ||
      !formData.surnameClient ||
      !formData.addressClient
    ) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    if (clienteEditar) {
      // Actualizar - enviamos solo los campos con prefijo 'new'
      const datosActualizados = {
        newNameClient: formData.nameClient,
        newSurnameClient: formData.surnameClient,
        newAddressClient: formData.addressClient,
        newEmailClient: formData.emailClient,
        newPhoneClient: formData.phoneClient,
      };
      onGuardar(datosActualizados);
    } else {
      // Crear nuevo
      onGuardar(formData);
    }

    // Limpiar formulario
    setFormData({
      dniClient: '',
      nameClient: '',
      surnameClient: '',
      addressClient: '',
      emailClient: '',
      phoneClient: '',
    });
  };

  const handleCancelar = () => {
    setFormData({
      dniClient: '',
      nameClient: '',
      surnameClient: '',
      addressClient: '',
      emailClient: '',
      phoneClient: '',
    });
    onCancelar();
  };

  return (
    <div className="form-container">
      <h2>{clienteEditar ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h2>
      <form onSubmit={handleSubmit} className="data-form">
        <div className="form-group">
          <label htmlFor="dniClient">
            DNI <span className="required">*</span>
          </label>
          <input
            type="text"
            id="dniClient"
            name="dniClient"
            value={formData.dniClient}
            onChange={handleChange}
            disabled={clienteEditar ? true : false}
            placeholder="Ej: 12345678Z"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="nameClient">
            Nombre <span className="required">*</span>
          </label>
          <input
            type="text"
            id="nameClient"
            name="nameClient"
            value={formData.nameClient}
            onChange={handleChange}
            placeholder="Ej: Juan"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="surnameClient">
            Apellido <span className="required">*</span>
          </label>
          <input
            type="text"
            id="surnameClient"
            name="surnameClient"
            value={formData.surnameClient}
            onChange={handleChange}
            placeholder="Ej: Pérez"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="addressClient">
            Dirección <span className="required">*</span>
          </label>
          <input
            type="text"
            id="addressClient"
            name="addressClient"
            value={formData.addressClient}
            onChange={handleChange}
            placeholder="Ej: Av. Principal 123"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="emailClient">Email</label>
          <input
            type="email"
            id="emailClient"
            name="emailClient"
            value={formData.emailClient}
            onChange={handleChange}
            placeholder="Ej: juan@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneClient">Teléfono</label>
          <input
            type="text"
            id="phoneClient"
            name="phoneClient"
            value={formData.phoneClient}
            onChange={handleChange}
            placeholder="Ej: 555-0101"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {clienteEditar ? 'Actualizar' : 'Guardar'}
          </button>
          {clienteEditar && (
            <button type="button" className="btn-secondary" onClick={handleCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ClienteForm;
