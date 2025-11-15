import React from 'react';

function EmpleadosList({ empleados, onEliminar, onEditar }) {
  return (
    <div className="list-container">
      <h2>Empleados Registrados</h2>
      {empleados.length === 0 ? (
        <p className="empty-message">No hay empleados registrados.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Cargo</th>
                <th>Salario</th>
                <th>Fecha Contratación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((empleado) => (
                <tr key={empleado.codigoEmpleado}>
                  <td>{empleado.codigoEmpleado}</td>
                  <td>{empleado.nombreEmpleado}</td>
                  <td>{empleado.apellidoEmpleado}</td>
                  <td>{empleado.cargoEmpleado}</td>
                  <td>${empleado.salarioEmpleado?.toFixed(2)}</td>
                  <td>{empleado.fechaContratacion || '-'}</td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => onEditar(empleado)}>
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onEliminar(empleado.codigoEmpleado)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EmpleadosList;
