import React, { useState, useEffect } from 'react';

function EmpleadoForm({ onGuardar, empleadoEditar, onCancelar }) {
  const [formData, setFormData] = useState({
    codigoEmpleado: '',
    nombreEmpleado: '',
    apellidoEmpleado: '',
    cargoEmpleado: '',
    salarioEmpleado: '',
    fechaContratacion: '',
  });

  useEffect(() => {
    if (empleadoEditar) {
      setFormData({
        codigoEmpleado: empleadoEditar.codigoEmpleado || '',
        nombreEmpleado: empleadoEditar.nombreEmpleado || '',
        apellidoEmpleado: empleadoEditar.apellidoEmpleado || '',
        cargoEmpleado: empleadoEditar.cargoEmpleado || '',
        salarioEmpleado: empleadoEditar.salarioEmpleado || '',
        fechaContratacion: empleadoEditar.fechaContratacion || '',
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
      !formData.codigoEmpleado ||
      !formData.nombreEmpleado ||
      !formData.apellidoEmpleado ||
      !formData.cargoEmpleado ||
      !formData.salarioEmpleado
    ) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    const dataToSend = {
      ...formData,
      salarioEmpleado: parseFloat(formData.salarioEmpleado),
    };

    if (empleadoEditar) {
      // Actualizar - enviamos solo los campos con prefijo 'new'
      const datosActualizados = {
        newNombreEmpleado: dataToSend.nombreEmpleado,
        newApellidoEmpleado: dataToSend.apellidoEmpleado,
        newCargoEmpleado: dataToSend.cargoEmpleado,
        newSalarioEmpleado: dataToSend.salarioEmpleado,
        newFechaContratacion: dataToSend.fechaContratacion,
      };
      onGuardar(datosActualizados);
    } else {
      // Crear nuevo
      onGuardar(dataToSend);
    }

    // Limpiar formulario
    setFormData({
      codigoEmpleado: '',
      nombreEmpleado: '',
      apellidoEmpleado: '',
      cargoEmpleado: '',
      salarioEmpleado: '',
      fechaContratacion: '',
    });
  };

  const handleCancelar = () => {
    setFormData({
      codigoEmpleado: '',
      nombreEmpleado: '',
      apellidoEmpleado: '',
      cargoEmpleado: '',
      salarioEmpleado: '',
      fechaContratacion: '',
    });
    onCancelar();
  };

  return (
    <div className="form-container">
      <h2>{empleadoEditar ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}</h2>
      <form onSubmit={handleSubmit} className="data-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="codigoEmpleado">
              Código Empleado <span className="required">*</span>
            </label>
            <input
              type="text"
              id="codigoEmpleado"
              name="codigoEmpleado"
              value={formData.codigoEmpleado}
              onChange={handleChange}
              disabled={empleadoEditar ? true : false}
              placeholder="Ej: EMP001"
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
              placeholder="Ej: María"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellidoEmpleado">
              Apellido <span className="required">*</span>
            </label>
            <input
              type="text"
              id="apellidoEmpleado"
              name="apellidoEmpleado"
              value={formData.apellidoEmpleado}
              onChange={handleChange}
              placeholder="Ej: González"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cargoEmpleado">
              Cargo <span className="required">*</span>
            </label>
            <input
              type="text"
              id="cargoEmpleado"
              name="cargoEmpleado"
              value={formData.cargoEmpleado}
              onChange={handleChange}
              placeholder="Ej: Cajero"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="salarioEmpleado">
              Salario <span className="required">*</span>
            </label>
            <input
              type="number"
              id="salarioEmpleado"
              name="salarioEmpleado"
              value={formData.salarioEmpleado}
              onChange={handleChange}
              placeholder="Ej: 1500.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fechaContratacion">Fecha de Contratación</label>
            <input
              type="date"
              id="fechaContratacion"
              name="fechaContratacion"
              value={formData.fechaContratacion}
              onChange={handleChange}
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
