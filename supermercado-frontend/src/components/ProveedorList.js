import React from 'react';

function ProveedorList({ proveedores, onEliminar, onEditar }) {
  return (
    <div className="list-container">
      <h2>Proveedores Registrados</h2>
      {proveedores.length === 0 ? (
        <p className="empty-message">No hay proveedores registrados.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Fiscal</th>
                <th>RUC/NIT/NIF</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Contacto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((proveedor) => (
                <tr key={proveedor.idProveedor}>
                  <td>{proveedor.idProveedor}</td>
                  <td>{proveedor.nombreFiscal}</td>
                  <td>{proveedor.rucNitNif}</td>
                  <td>{proveedor.direccionFisica}</td>
                  <td>{proveedor.telefonoPrincipal || '-'}</td>
                  <td>{proveedor.correoElectronico || '-'}</td>
                  <td>
                    {proveedor.contactoNombre || '-'}
                    {proveedor.contactoPuesto && ` (${proveedor.contactoPuesto})`}
                  </td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => onEditar(proveedor)}>
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onEliminar(proveedor.idProveedor)}
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

export default ProveedorList;
