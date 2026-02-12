import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { SidebarComponent, NavItem } from '../../shared/sidebar/sidebar.component';
import { StatsCardComponent } from '../../shared/stats-card/stats-card.component';
import { ClienteService } from '../../../services/cliente.service';
import { ProductoService } from '../../../services/producto.service';
import { Cliente, Producto } from '../../../models';

@Component({
  selector: 'app-empleado-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    StatsCardComponent
  ],
  templateUrl: './empleado-dashboard.component.html',
  styleUrls: ['./empleado-dashboard.component.css']
})
export class EmpleadoDashboardComponent implements OnInit {
  // 🔥 Signals para estado reactivo
  userName = signal<string>('');
  userRole = signal<string>('empleado');

  // Estadísticas (solo clientes y productos)
  totalClientes = signal<number>(0);
  totalProductos = signal<number>(0);

  // Navegación del sidebar (solo Clientes y Productos)
  navItems: NavItem[] = [
    { label: 'Clientes', route: 'clientes', icon: '👥' },
    { label: 'Productos', route: 'productos', icon: '📦' }
  ];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private clienteService: ClienteService,
    private productoService: ProductoService
  ) {}

  ngOnInit() {
    const user = this.userService.getCurrentUser();
    if (user) {
      this.userName.set(user.username);
      this.userRole.set(user.rol);
    }

    // Cargar estadísticas
    this.loadStats();
  }

  loadStats() {
    // Cargar total de clientes
    this.clienteService.obtenerTodos().subscribe({
      next: (clientes: Cliente[]) => {
        this.totalClientes.set(clientes.length);
      },
      error: (err: any) => console.error('Error loading clientes:', err)
    });

    // Cargar total de productos
    this.productoService.obtenerTodos().subscribe({
      next: (productos: Producto[]) => {
        this.totalProductos.set(productos.length);
      },
      error: (err: any) => console.error('Error loading productos:', err)
    });
  }

  onLogout() {
    this.authService.logout();
  }
}
