const mongoose = require('mongoose');

const empleadoSchema = new mongoose.Schema(
  {
    cedulaEmpleado: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nombreEmpleado: {
      type: String,
      required: true,
      trim: true,
    },
    emailEmpleado: {
      type: String,
      trim: true,
      default: '',
    },
    celularEmpleado: {
      type: String,
      required: true,
      trim: true,
    },
    direccionEmpleado: {
      type: String,
      trim: true,
      default: '',
    },
    sueldoEmpleado: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Empleado', empleadoSchema);
