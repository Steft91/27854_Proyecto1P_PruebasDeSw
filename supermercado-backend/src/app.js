const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const clientRoutes = require('./routes/cliente.routes');
const providerRoutes = require('./routes/proveedor.routes');
const empleadoRoutes = require('./routes/empleado.routes');
const productoRoutes = require('./routes/producto.routes');
const authRoutes = require('./routes/auth.routes');
const pedidoRoutes = require('./routes/pedido.routes');

const app = express();

// Habilitar CORS para permitir peticiones desde el frontend
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado exitosamente');
  })
  .catch((err) => {
    console.error('Error al conectar a MongoDB:', err);
  });

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/products', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware de manejo de errores global
app.use((err, req, res, _next) => {
  console.error('Error capturado:', err);
  res.status(err.status || 500).json({
    msg: err.message || 'Error del servidor',
    error: err.message,
  });
});

module.exports = app;
