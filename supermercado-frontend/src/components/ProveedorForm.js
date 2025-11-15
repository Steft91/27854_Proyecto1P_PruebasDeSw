import React, { useState, useEffect } from 'react';

function ProveedorForm({ onGuardar, proveedorEditar, onCancelar }) {
  const [formData, setFormData] = useState({
    nombreFiscal: '',
    rucNitNif: '',
    direccionFisica: '',
    telefonoPrincipal: '',
    correoElectronico: '',
    contactoNombre: '',
    contactoPuesto: '',
  });

  useEffect(() => {
    if (proveedorEditar) {
      setFormData({
        nombreFiscal: proveedorEditar.nombreFiscal || '',
        rucNitNif: proveedorEditar.rucNitNif || '',
        direccionFisica: proveedorEditar.direccionFisica || '',
        telefonoPrincipal: proveedorEditar.telefonoPrincipal || '',
        correoElectronico: proveedorEditar.correoElectronico || '',
        contactoNombre: proveedorEditar.contactoNombre || '',
        contactoPuesto: proveedorEditar.contactoPuesto || '',
      });
    }
  }, [proveedorEditar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar campos obligatorios (trim para detectar espacios en blanco)
    if (
      !formData.nombreFiscal.trim() ||
      !formData.rucNitNif.trim() ||
      !formData.direccionFisica.trim()
    ) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    if (proveedorEditar) {
      // Actualizar - enviamos solo los campos con prefijo 'new'
      const datosActualizados = {
        newNombreFiscal: formData.nombreFiscal.trim(),
        newRucNitNif: formData.rucNitNif.trim(),
        newDireccionFisica: formData.direccionFisica.trim(),
        newTelefonoPrincipal: formData.telefonoPrincipal.trim(),
        newCorreoElectronico: formData.correoElectronico.trim(),
        newContactoNombre: formData.contactoNombre.trim(),
        newContactoPuesto: formData.contactoPuesto.trim(),
      };
      onGuardar(datosActualizados);
    } else {
      // Crear nuevo - asegurarnos de que todos los campos son strings
      const dataToSend = {
        nombreFiscal: formData.nombreFiscal.trim(),
        rucNitNif: formData.rucNitNif.trim(),
        direccionFisica: formData.direccionFisica.trim(),
        telefonoPrincipal: formData.telefonoPrincipal.trim(),
        correoElectronico: formData.correoElectronico.trim(),
        contactoNombre: formData.contactoNombre.trim(),
        contactoPuesto: formData.contactoPuesto.trim(),
      };
      onGuardar(dataToSend);
    }

    // Limpiar formulario
    setFormData({
      nombreFiscal: '',
      rucNitNif: '',
      direccionFisica: '',
      telefonoPrincipal: '',
      correoElectronico: '',
      contactoNombre: '',
      contactoPuesto: '',
    });
  };

  const handleCancelar = () => {
    setFormData({
      nombreFiscal: '',
      rucNitNif: '',
      direccionFisica: '',
      telefonoPrincipal: '',
      correoElectronico: '',
      contactoNombre: '',
      contactoPuesto: '',
    });
    onCancelar();
  };

  return (
    <div className="form-container">
      <h2>{proveedorEditar ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}</h2>
      <form onSubmit={handleSubmit} className="data-form">
        {proveedorEditar && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="idProveedorDisplay">ID Proveedor</label>
              <input
                type="text"
                id="idProveedorDisplay"
                value={proveedorEditar.idProveedor}
                disabled
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
              />
            </div>
          </div>
        )}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombreFiscal">
              Nombre Fiscal / Razón Social <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nombreFiscal"
              name="nombreFiscal"
              value={formData.nombreFiscal}
              onChange={handleChange}
              placeholder="Ej: Productos del Sur S.A."
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rucNitNif">
              RUC/NIT/NIF <span className="required">*</span>
            </label>
            <input
              type="text"
              id="rucNitNif"
              name="rucNitNif"
              value={formData.rucNitNif}
              onChange={handleChange}
              placeholder="Ej: 1234567890001"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="direccionFisica">
              Dirección Física <span className="required">*</span>
            </label>
            <input
              type="text"
              id="direccionFisica"
              name="direccionFisica"
              value={formData.direccionFisica}
              onChange={handleChange}
              placeholder="Ej: Av. Principal 123"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="telefonoPrincipal">Teléfono Principal</label>
            <input
              type="text"
              id="telefonoPrincipal"
              name="telefonoPrincipal"
              value={formData.telefonoPrincipal}
              onChange={handleChange}
              placeholder="Ej: 555-1000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="correoElectronico">Correo Electrónico</label>
            <input
              type="email"
              id="correoElectronico"
              name="correoElectronico"
              value={formData.correoElectronico}
              onChange={handleChange}
              placeholder="Ej: ventas@proveedor.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contactoNombre">Nombre de Contacto</label>
            <input
              type="text"
              id="contactoNombre"
              name="contactoNombre"
              value={formData.contactoNombre}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactoPuesto">Puesto de Contacto</label>
            <input
              type="text"
              id="contactoPuesto"
              name="contactoPuesto"
              value={formData.contactoPuesto}
              onChange={handleChange}
              placeholder="Ej: Gerente de Ventas"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {proveedorEditar ? 'Actualizar' : 'Guardar'}
          </button>
          {proveedorEditar && (
            <button type="button" className="btn-secondary" onClick={handleCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProveedorForm;
