const express = require('express');
const clientRoutes = require('./routes/cliente.routes');
const providerRoutes = require('./routes/proveedor.routes');
const empleadoRoutes = require('./routes/empleado.routes');
const productoRoutes = require('./routes/producto.routes');


const app = express();

app.use(express.json());

app.use('/api/clients', clientRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/products', productoRoutes);

// Manejo de rutas no encontradas

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

module.exports = app;
