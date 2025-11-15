import React from 'react';

function ProductosList({ productos, onEliminar, onEditar }) {
  return (
    <div className="list-container">
      <h2>Productos Registrados</h2>
      {productos.length === 0 ? (
        <p className="empty-message">No hay productos registrados.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.codigoProducto}>
                  <td>{producto.codigoProducto}</td>
                  <td>{producto.nombreProducto}</td>
                  <td>{producto.descripcionProducto || '-'}</td>
                  <td>${producto.precioProducto?.toFixed(2)}</td>
                  <td>{producto.stockProducto}</td>
                  <td>{producto.categoriaProducto || '-'}</td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => onEditar(producto)}>
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onEliminar(producto.codigoProducto)}
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

export default ProductosList;
