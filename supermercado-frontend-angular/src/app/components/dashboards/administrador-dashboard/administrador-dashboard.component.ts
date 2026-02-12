import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidebarComponent, NavItem } from '../../shared/sidebar/sidebar.component';
import { StatsCardComponent } from '../../shared/stats-card/stats-card.component';
import { ClienteService } from '../../../services/cliente.service';
import { EmpleadoService } from '../../../services/empleado.service';
import { ProductoService } from '../../../services/producto.service';
import { ProveedorService } from '../../../services/proveedor.service';
import { Cliente, Producto } from '../../../models';

@Component({
  selector: 'app-administrador-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    StatsCardComponent
  ],
  templateUrl: './administrador-dashboard.component.html',
  styleUrls: ['./administrador-dashboard.component.css']
})
export class AdministradorDashboardComponent implements OnInit {

  // 🔥 Signals para estado reactivo
  userName = signal<string>('');
  userRole = signal<string>('administrador');

  totalClientes = signal<number>(0);
  totalEmpleados = signal<number>(0);
  totalProductos = signal<number>(0);
  totalProveedores = signal<number>(0);

  navItems: NavItem[] = [
    { label: 'Clientes', route: 'clientes', icon: '👥' },
    { label: 'Empleados', route: 'empleados', icon: '👔' },
    { label: 'Productos', route: 'productos', icon: '📦' },
    { label: 'Proveedores', route: 'proveedores', icon: '🏭' }
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private clienteService: ClienteService,
    private empleadoService: EmpleadoService,
    private productoService: ProductoService,
    private proveedorService: ProveedorService
  ) {}

  ngOnInit() {
    const user = this.userService.getCurrentUser();
    if (user) {
      this.userName.set(user.username);
      this.userRole.set(user.rol);
    }

    this.loadStats();
  }

  loadStats() {

    this.clienteService.obtenerTodos().subscribe({
      next: (clientes: Cliente[]) => {
        this.totalClientes.set(clientes.length);
      },
      error: (err) => console.error('Error loading clientes:', err)
    });

    this.empleadoService.obtenerTodos().subscribe({
      next: (empleados: any[]) => {
        this.totalEmpleados.set(empleados.length);
      },
      error: (err) => console.error('Error loading empleados:', err)
    });

    this.productoService.obtenerTodos().subscribe({
      next: (productos: Producto[]) => {
        this.totalProductos.set(productos.length);
      },
      error: (err) => console.error('Error loading productos:', err)
    });

    this.proveedorService.obtenerTodos().subscribe({
      next: (proveedores: any[]) => {
        this.totalProveedores.set(proveedores.length);
      },
      error: (err) => console.error('Error loading proveedores:', err)
    });
  }

  onLogout() {
    this.authService.logout();
  }
}
