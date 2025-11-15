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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.codeProduct}>
                  <td>{producto.codeProduct}</td>
                  <td>{producto.nameProduct}</td>
                  <td>{producto.descriptionProduct || '-'}</td>
                  <td>${producto.priceProduct?.toFixed(2)}</td>
                  <td>{producto.stockProduct}</td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => onEditar(producto)}>
                      Editar
                    </button>
                    <button className="btn-delete" onClick={() => onEliminar(producto.codeProduct)}>
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
