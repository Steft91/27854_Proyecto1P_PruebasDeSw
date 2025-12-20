const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
  {
    codeProduct: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nameProduct: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    descriptionProduct: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    priceProduct: {
      type: Number,
      required: true,
      min: 0,
    },
    stockProduct: {
      type: Number,
      required: true,
      min: 0,
    },
    proveedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proveedor',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Producto', productoSchema);
