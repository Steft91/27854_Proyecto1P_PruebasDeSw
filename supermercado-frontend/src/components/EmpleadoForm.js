import React, { useState, useEffect } from 'react';

function EmpleadoForm({ onGuardar, empleadoEditar, onCancelar }) {
  const [formData, setFormData] = useState({
    cedulaEmpleado: '',
    nombreEmpleado: '',
    emailEmpleado: '',
    celularEmpleado: '',
    sueldoEmpleado: '',
  });

  useEffect(() => {
    if (empleadoEditar) {
      setFormData({
        cedulaEmpleado: empleadoEditar.cedulaEmpleado || '',
        nombreEmpleado: empleadoEditar.nombreEmpleado || '',
        emailEmpleado: empleadoEditar.emailEmpleado || '',
        celularEmpleado: empleadoEditar.celularEmpleado || '',
        sueldoEmpleado: empleadoEditar.sueldoEmpleado || '',
      });
    }
  }, [empleadoEditar]);

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
      !formData.cedulaEmpleado ||
      !formData.nombreEmpleado ||
      !formData.celularEmpleado ||
      !formData.sueldoEmpleado
    ) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    const dataToSend = {
      cedulaEmpleado: formData.cedulaEmpleado,
      nombreEmpleado: formData.nombreEmpleado,
      emailEmpleado: formData.emailEmpleado,
      celularEmpleado: formData.celularEmpleado,
      sueldoEmpleado: parseFloat(formData.sueldoEmpleado),
    };

    if (empleadoEditar) {
      // Actualizar - enviamos solo los campos con prefijo 'new'
      const datosActualizados = {
        newNombreEmpleado: dataToSend.nombreEmpleado,
        newEmailEmpleado: dataToSend.emailEmpleado,
        newCelularEmpleado: dataToSend.celularEmpleado,
        newSueldoEmpleado: dataToSend.sueldoEmpleado,
      };
      onGuardar(datosActualizados);
    } else {
      // Crear nuevo
      onGuardar(dataToSend);
    }

    // Limpiar formulario
    setFormData({
      cedulaEmpleado: '',
      nombreEmpleado: '',
      emailEmpleado: '',
      celularEmpleado: '',
      sueldoEmpleado: '',
    });
  };

  const handleCancelar = () => {
    setFormData({
      cedulaEmpleado: '',
      nombreEmpleado: '',
      emailEmpleado: '',
      celularEmpleado: '',
      sueldoEmpleado: '',
    });
    onCancelar();
  };

  return (
    <div className="form-container">
      <h2>{empleadoEditar ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}</h2>
      <form onSubmit={handleSubmit} className="data-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cedulaEmpleado">
              Cédula <span className="required">*</span>
            </label>
            <input
              type="text"
              id="cedulaEmpleado"
              name="cedulaEmpleado"
              value={formData.cedulaEmpleado}
              onChange={handleChange}
              disabled={empleadoEditar ? true : false}
              placeholder="Ej: 1234567890"
              maxLength="10"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nombreEmpleado">
              Nombre <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nombreEmpleado"
              name="nombreEmpleado"
              value={formData.nombreEmpleado}
              onChange={handleChange}
              placeholder="Ej: María Pérez"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="emailEmpleado">Email</label>
            <input
              type="email"
              id="emailEmpleado"
              name="emailEmpleado"
              value={formData.emailEmpleado}
              onChange={handleChange}
              placeholder="Ej: maria@correo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="celularEmpleado">
              Celular <span className="required">*</span>
            </label>
            <input
              type="text"
              id="celularEmpleado"
              name="celularEmpleado"
              value={formData.celularEmpleado}
              onChange={handleChange}
              placeholder="Ej: 0987654321"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sueldoEmpleado">
              Sueldo <span className="required">*</span>
            </label>
            <input
              type="number"
              id="sueldoEmpleado"
              name="sueldoEmpleado"
              value={formData.sueldoEmpleado}
              onChange={handleChange}
              placeholder="Ej: 1500.00"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {empleadoEditar ? 'Actualizar' : 'Guardar'}
          </button>
          {empleadoEditar && (
            <button type="button" className="btn-secondary" onClick={handleCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EmpleadoForm;
