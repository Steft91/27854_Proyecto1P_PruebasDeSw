import React, { useState, useEffect } from 'react';
import './App.css';

// Importar componentes de Clientes
import ClientesList from './components/ClientesList';
import ClienteForm from './components/ClienteForm';
import * as clienteService from './services/clienteService';

// Importar componentes de Proveedores
import ProveedorList from './components/ProveedorList';
import ProveedorForm from './components/ProveedorForm';
import * as proveedorService from './services/proveedorService';

// Importar componentes de Productos
import ProductosList from './components/ProductosList';
import ProductoForm from './components/ProductoForm';
import * as productoService from './services/productoService';

// Importar componentes de Empleados
import EmpleadosList from './components/EmpleadosList';
import EmpleadoForm from './components/EmpleadoForm';
import * as empleadoService from './services/empleadoService';

function App() {
  const [activeTab, setActiveTab] = useState('clientes');

  // Estados para Clientes
  const [clientes, setClientes] = useState([]);
  const [editCliente, setEditCliente] = useState(null);

  // Estados para Proveedores
  const [proveedores, setProveedores] = useState([]);
  const [editProveedor, setEditProveedor] = useState(null);

  // Estados para Productos
  const [productos, setProductos] = useState([]);
  const [editProducto, setEditProducto] = useState(null);

  // Estados para Empleados
  const [empleados, setEmpleados] = useState([]);
  const [editEmpleado, setEditEmpleado] = useState(null);

  // ========== CLIENTES ==========
  const obtenerClientes = async () => {
    try {
      const data = await clienteService.obtenerTodosLosClientes();
      setClientes(data);
    } catch (error) {
      alert('Error al obtener clientes: ' + error.message);
    }
  };

  const guardarCliente = async (cliente) => {
    try {
      if (editCliente) {
        await clienteService.actualizarCliente(editCliente.dniClient, cliente);
      } else {
        await clienteService.crearCliente(cliente);
      }
      obtenerClientes();
      setEditCliente(null);
    } catch (error) {
      alert('Error al guardar cliente: ' + error.message);
    }
  };

  const eliminarCliente = async (dni) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try {
      await clienteService.eliminarCliente(dni);
      obtenerClientes();
    } catch (error) {
      alert('Error al eliminar cliente: ' + error.message);
    }
  };

  // ========== PROVEEDORES ==========
  const obtenerProveedores = async () => {
    try {
      const data = await proveedorService.obtenerTodosLosProveedores();
      setProveedores(data);
    } catch (error) {
      alert('Error al obtener proveedores: ' + error.message);
    }
  };

  const guardarProveedor = async (proveedor) => {
    try {
      if (editProveedor) {
        await proveedorService.actualizarProveedor(editProveedor.idProveedor, proveedor);
      } else {
        await proveedorService.crearProveedor(proveedor);
      }
      obtenerProveedores();
      setEditProveedor(null);
    } catch (error) {
      alert('Error al guardar proveedor: ' + error.message);
    }
  };

  const eliminarProveedor = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    try {
      await proveedorService.eliminarProveedor(id);
      obtenerProveedores();
    } catch (error) {
      alert('Error al eliminar proveedor: ' + error.message);
    }
  };

  // ========== PRODUCTOS ==========
  const obtenerProductos = async () => {
    try {
      const data = await productoService.obtenerTodosLosProductos();
      setProductos(data);
    } catch (error) {
      alert('Error al obtener productos: ' + error.message);
    }
  };

  const guardarProducto = async (producto) => {
    try {
      if (editProducto) {
        await productoService.actualizarProducto(editProducto.codeProduct, producto);
      } else {
        await productoService.crearProducto(producto);
      }
      obtenerProductos();
      setEditProducto(null);
    } catch (error) {
      alert('Error al guardar producto: ' + error.message);
    }
  };

  const eliminarProducto = async (codigo) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await productoService.eliminarProducto(codigo);
      obtenerProductos();
    } catch (error) {
      alert('Error al eliminar producto: ' + error.message);
    }
  };

  // ========== EMPLEADOS ==========
  const obtenerEmpleados = async () => {
    try {
      const data = await empleadoService.obtenerTodosLosEmpleados();
      setEmpleados(data);
    } catch (error) {
      alert('Error al obtener empleados: ' + error.message);
    }
  };

  const guardarEmpleado = async (empleado) => {
    try {
      if (editEmpleado) {
        await empleadoService.actualizarEmpleado(editEmpleado.cedulaEmpleado, empleado);
      } else {
        await empleadoService.crearEmpleado(empleado);
      }
      obtenerEmpleados();
      setEditEmpleado(null);
    } catch (error) {
      alert('Error al guardar empleado: ' + error.message);
    }
  };

  const eliminarEmpleado = async (codigo) => {
    if (!window.confirm('¿Eliminar este empleado?')) return;
    try {
      await empleadoService.eliminarEmpleado(codigo);
      obtenerEmpleados();
    } catch (error) {
      alert('Error al eliminar empleado: ' + error.message);
    }
  };

  // Cargar datos según la pestaña activa
  useEffect(() => {
    if (activeTab === 'clientes') {
      obtenerClientes();
    } else if (activeTab === 'proveedores') {
      obtenerProveedores();
    } else if (activeTab === 'productos') {
      obtenerProductos();
    } else if (activeTab === 'empleados') {
      obtenerEmpleados();
    }
  }, [activeTab]);

  return (
    <div className="App">
      <header className="app-header">
        <h1>🛒 Sistema de Gestión - Supermercado</h1>
        <p className="subtitle">Gestión integral de clientes, proveedores, productos y empleados</p>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'clientes' ? 'tab active' : 'tab'}
          onClick={() => {
            setActiveTab('clientes');
            setEditCliente(null);
          }}
        >
          👥 Clientes
        </button>
        <button
          className={activeTab === 'proveedores' ? 'tab active' : 'tab'}
          onClick={() => {
            setActiveTab('proveedores');
            setEditProveedor(null);
          }}
        >
          🏭 Proveedores
        </button>
        <button
          className={activeTab === 'productos' ? 'tab active' : 'tab'}
          onClick={() => {
            setActiveTab('productos');
            setEditProducto(null);
          }}
        >
          📦 Productos
        </button>
        <button
          className={activeTab === 'empleados' ? 'tab active' : 'tab'}
          onClick={() => {
            setActiveTab('empleados');
            setEditEmpleado(null);
          }}
        >
          👔 Empleados
        </button>
      </nav>

      <main className="content">
        {activeTab === 'clientes' && (
          <div className="tab-content">
            <ClienteForm
              onGuardar={guardarCliente}
              clienteEditar={editCliente}
              onCancelar={() => setEditCliente(null)}
            />
            <ClientesList
              clientes={clientes}
              onEliminar={eliminarCliente}
              onEditar={setEditCliente}
            />
          </div>
        )}

        {activeTab === 'proveedores' && (
          <div className="tab-content">
            <ProveedorForm
              onGuardar={guardarProveedor}
              proveedorEditar={editProveedor}
              onCancelar={() => setEditProveedor(null)}
            />
            <ProveedorList
              proveedores={proveedores}
              onEliminar={eliminarProveedor}
              onEditar={setEditProveedor}
            />
          </div>
        )}

        {activeTab === 'productos' && (
          <div className="tab-content">
            <ProductoForm
              onGuardar={guardarProducto}
              productoEditar={editProducto}
              onCancelar={() => setEditProducto(null)}
            />
            <ProductosList
              productos={productos}
              onEliminar={eliminarProducto}
              onEditar={setEditProducto}
            />
          </div>
        )}

        {activeTab === 'empleados' && (
          <div className="tab-content">
            <EmpleadoForm
              onGuardar={guardarEmpleado}
              empleadoEditar={editEmpleado}
              onCancelar={() => setEditEmpleado(null)}
            />
            <EmpleadosList
              empleados={empleados}
              onEliminar={eliminarEmpleado}
              onEditar={setEditEmpleado}
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>© 2025 Sistema de Gestión de Supermercado</p>
      </footer>
    </div>
  );
}

export default App;
