import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { Cliente, Proveedor, Producto, Empleado } from './models';
import { ClientesListComponent } from './components/clientes-list.component/clientes-list.component';
import { ClienteFormComponent } from './components/cliente-form.component/cliente-form.component';
import { ProveedorListComponent } from './components/proveedor-list.component/proveedor-list.component';
import { ProveedorFormComponent } from './components/proveedor-form.component/proveedor-form.component';
import { ProductosListComponent } from './components/productos-list.component/productos-list.component';
import { ProductoFormComponent } from './components/producto-form.component/producto-form.component';
import { EmpleadosListComponent } from './components/empleados-list.component/empleados-list.component';
import { EmpleadoFormComponent } from './components/empleado-form.component/empleado-form.component';
import { RegisterComponent } from './components/register.component/register.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ClientesListComponent, ClienteFormComponent,
    ProveedorListComponent, ProveedorFormComponent,
    ProductosListComponent, ProductoFormComponent,
    EmpleadosListComponent, EmpleadoFormComponent,
    RegisterComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  // REFERENCIAS A COMPONENTES HIJOS
  @ViewChild(ClientesListComponent) listaClientes!: ClientesListComponent;
  @ViewChild(ProveedorListComponent) listaProveedores!: ProveedorListComponent;
  @ViewChild(ProductosListComponent) listaProductos!: ProductosListComponent;
  @ViewChild(EmpleadosListComponent) listaEmpleados!: EmpleadosListComponent;

  // ESTADO DE AUTENTICACIÓN
  isAuthenticated = false;
  showRegister = false;
  
  loginData = { username: '', password: '' };
  loginError = '';

  // ESTADO DEL DASHBOARD
  activeTab: 'clientes' | 'proveedores' | 'productos' | 'empleados' = 'clientes'; // Tipado estricto

  // OBJETOS PARA EDICIÓN (Tipado estricto)
  clienteEditar: Cliente | null = null;
  proveedorEditar: Proveedor | null = null;
  productoEditar: Producto | null = null;
  empleadoEditar: Empleado | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isLoggedIn();
  }

  // AUTH
  onLogin() {
    if (!this.loginData.username || !this.loginData.password) {
      this.loginError = 'Por favor completa todos los campos.';
      return;
    }

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.isAuthenticated = true;
        this.loginError = '';
        this.loginData = { username: '', password: '' };
        this.activeTab = 'clientes';
      },
      error: (err) => {
        console.error(err);
        this.loginError = err.error?.msg || 'Credenciales incorrectas o error de conexión.';
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.showRegister = false;
    this.loginData = { username: '', password: '' };
  }

  toggleRegister() {
    this.showRegister = !this.showRegister;
    this.loginError = '';
  }

  // NAVEGACIÓN
  cambiarTab(tab: string) {
    this.activeTab = tab as any;
    this.cancelarEdicion();
  }


  // GESTIÓN DE EDICIÓN (Setters)
  setEditCliente(cliente: Cliente) {
    this.clienteEditar = cliente;
    this.scrollToTop();
  }

  setEditProveedor(proveedor: Proveedor) {
    this.proveedorEditar = proveedor;
    this.scrollToTop();
  }

  setEditProducto(producto: Producto) {
    this.productoEditar = producto;
    this.scrollToTop();
  }

  setEditEmpleado(empleado: Empleado) {
    this.empleadoEditar = empleado;
    this.scrollToTop();
  }


  // MANEJADORES DE GUARDADO (Callbacks)
  onClienteGuardado() {
    this.cancelarEdicion();
    this.listaClientes.cargarClientes();
  }

  onProveedorGuardado() {
    this.cancelarEdicion();
    this.listaProveedores.cargar();
  }

  onProductoGuardado() {
    this.cancelarEdicion();
    this.listaProductos.cargar();
  }

  onEmpleadoGuardado() {
    this.cancelarEdicion();
    this.listaEmpleados.cargar();
  }


  // UTILIDADES
  cancelarEdicion() {
    this.clienteEditar = null;
    this.proveedorEditar = null;
    this.productoEditar = null;
    this.empleadoEditar = null;
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}