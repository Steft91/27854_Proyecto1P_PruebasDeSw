const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema(
  {
    dniClient: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nameClient: {
      type: String,
      required: true,
      trim: true,
    },
    surnameClient: {
      type: String,
      required: true,
      trim: true,
    },
    emailClient: {
      type: String,
      trim: true,
      default: '',
    },
    phoneClient: {
      type: String,
      trim: true,
      default: '',
    },
    addressClient: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Cliente', clienteSchema);
