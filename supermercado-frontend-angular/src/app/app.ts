import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
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
  // ==========================================
  // ESTADO DE AUTENTICACIÓN
  // ==========================================
  isAuthenticated = false;
  showRegister = false; 
  
  loginData = { username: '', password: '' };
  loginError = '';

  // ==========================================
  // ESTADO DEL DASHBOARD
  // ==========================================
  activeTab: string = 'clientes'; 
  refreshTrigger: number = 0;

  // Objetos para edición
  clienteEditar: any = null;
  proveedorEditar: any = null;
  productoEditar: any = null;
  empleadoEditar: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isLoggedIn();
  }

  // ==========================================
  // MÉTODOS DE AUTH
  // ==========================================
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
        this.refreshTrigger++; 
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
    this.activeTab = 'clientes';
  }

  toggleRegister() {
    this.showRegister = !this.showRegister;
    this.loginError = '';
  }

  // ==========================================
  // NAVEGACIÓN
  // ==========================================
  cambiarTab(tab: string) {
    this.activeTab = tab;
    this.cancelarEdicion();
  }

  // ==========================================
  // GESTIÓN DE EDICIÓN
  // ==========================================
  setEditCliente(cliente: any) {
    this.clienteEditar = cliente;
    this.scrollToTop();
  }

  setEditProveedor(proveedor: any) {
    this.proveedorEditar = proveedor;
    this.scrollToTop();
  }

  setEditProducto(producto: any) {
    this.productoEditar = producto;
    this.scrollToTop();
  }

  setEditEmpleado(empleado: any) {
    this.empleadoEditar = empleado;
    this.scrollToTop();
  }

  // ==========================================
  // ACCIONES COMUNES
  // ==========================================
  handleGuardadoExitoso() {
    this.cancelarEdicion(); 
    this.refreshTrigger++;
  }

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