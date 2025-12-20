const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema(
  {
    nombreFiscal: {
      type: String,
      required: true,
      trim: true,
    },
    rucNitNif: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    direccionFisica: {
      type: String,
      required: true,
      trim: true,
    },
    telefonoPrincipal: {
      type: String,
      trim: true,
      default: '',
    },
    correoElectronico: {
      type: String,
      trim: true,
      default: '',
    },
    contactoNombre: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    contactoPuesto: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Proveedor', proveedorSchema);
