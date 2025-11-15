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
                <th>Cédula</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Celular</th>
                <th>Sueldo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((empleado) => (
                <tr key={empleado.cedulaEmpleado}>
                  <td>{empleado.cedulaEmpleado}</td>
                  <td>{empleado.nombreEmpleado}</td>
                  <td>{empleado.emailEmpleado || '-'}</td>
                  <td>{empleado.celularEmpleado}</td>
                  <td>${empleado.sueldoEmpleado?.toFixed(2)}</td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => onEditar(empleado)}>
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onEliminar(empleado.cedulaEmpleado)}
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
