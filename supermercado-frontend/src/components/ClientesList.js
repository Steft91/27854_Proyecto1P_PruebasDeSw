import React from 'react';

function ClientesList({ clientes, onEliminar, onEditar }) {
  return (
    <div className="list-container">
      <h2>Clientes Registrados</h2>
      {clientes.length === 0 ? (
        <p className="empty-message">No hay clientes registrados.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Dirección</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.dniClient}>
                  <td>{cliente.dniClient}</td>
                  <td>{cliente.nameClient}</td>
                  <td>{cliente.surnameClient}</td>
                  <td>{cliente.addressClient}</td>
                  <td>{cliente.emailClient || '-'}</td>
                  <td>{cliente.phoneClient || '-'}</td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => onEditar(cliente)}>
                      Editar
                    </button>
                    <button className="btn-delete" onClick={() => onEliminar(cliente.dniClient)}>
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

export default ClientesList;
