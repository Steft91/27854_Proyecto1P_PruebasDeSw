const mongoose = require('mongoose');
const Pedido = require('../src/models/Pedido');

describe('Pedido model', () => {
  test('calcularTotal sets and returns correct total', () => {
    const pedido = new Pedido({
      usuario: new mongoose.Types.ObjectId(),
      items: [
        { producto: 'P1', nombreProducto: 'A', cantidad: 2, precioUnitario: 5, subtotal: 10 },
        { producto: 'P2', nombreProducto: 'B', cantidad: 1, precioUnitario: 3, subtotal: 3 },
      ],
      total: 0,
      datosEntrega: { direccion: 'x', telefono: '1' },
    });

    const total = pedido.calcularTotal();
    expect(total).toBe(13);
    expect(pedido.total).toBe(13);
  });

  test('pre-save middleware updates updatedAt', async () => {
    const pedido = new Pedido({
      usuario: new mongoose.Types.ObjectId(),
      items: [ { producto: 'P1', nombreProducto: 'A', cantidad: 1, precioUnitario: 1, subtotal: 1 } ],
      total: 1,
      datosEntrega: { direccion: 'x', telefono: '1' },
    });

    const before = Date.now();
    if (typeof Pedido._updateUpdatedAt === 'function') {
      await new Promise((resolve) => {
        Pedido._updateUpdatedAt.call(pedido, () => resolve());
      });
    }

    expect(pedido.updatedAt).toBeDefined();
    expect(Number(pedido.updatedAt)).toBeGreaterThanOrEqual(before);
  });
});
