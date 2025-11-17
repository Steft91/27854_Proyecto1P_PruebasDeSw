const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`API Endpoints disponibles:`);
  console.log(`   - Clientes: http://localhost:${PORT}/api/clients`);
  console.log(`   - Proveedores: http://localhost:${PORT}/api/providers`);
  console.log(`   - Productos: http://localhost:${PORT}/api/products`);
  console.log(`   - Empleados: http://localhost:${PORT}/api/empleados`);
});
