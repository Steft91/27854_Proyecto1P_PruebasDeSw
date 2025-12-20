const mongoose = require('mongoose');

// Define el esquema del usuario
const usuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  rol: {
    type: String,
    enum: ['administrador', 'empleado', 'cliente'],
    default: 'cliente',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Exporta el modelo Usuario
module.exports = mongoose.model('Usuario', usuarioSchema);
