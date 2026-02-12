const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  // Usuario que realizó el pedido
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },

  // Items del pedido
  items: [
    {
      producto: {
        type: String, // Código del producto
        required: true,
      },
      nombreProducto: {
        type: String,
        required: true,
      },
      cantidad: {
        type: Number,
        required: true,
        min: 1,
      },
      precioUnitario: {
        type: Number,
        required: true,
        min: 0,
      },
      subtotal: {
        type: Number,
        required: true,
      },
    },
  ],

  // Total del pedido
  total: {
    type: Number,
    required: true,
    min: 0,
  },

  // Estado del pedido
  estado: {
    type: String,
    enum: ['pendiente', 'procesando', 'completado', 'cancelado'],
    default: 'pendiente',
  },

  // Datos de entrega
  datosEntrega: {
    direccion: {
      type: String,
      required: true,
    },
    telefono: {
      type: String,
      required: true,
    },
    notas: {
      type: String,
      default: '',
    },
  },

  // Fecha de creación
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // Fecha de actualización
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para actualizar updatedAt antes de guardar
function updateUpdatedAt(next) {
  this.updatedAt = Date.now();
  next();
}

pedidoSchema.pre('save', updateUpdatedAt);

// Método para calcular el total del pedido
pedidoSchema.methods.calcularTotal = function () {
  this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  return this.total;
};

const PedidoModel = mongoose.model('Pedido', pedidoSchema);

// Exponer la función para facilitar pruebas unitarias
PedidoModel._updateUpdatedAt = updateUpdatedAt;

module.exports = PedidoModel;
