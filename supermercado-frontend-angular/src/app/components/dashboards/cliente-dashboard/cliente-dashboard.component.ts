import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { CarritoService } from '../../../services/carrito.service';

/**
 * Dashboard principal para clientes
 * Incluye navegación horizontal y badge del carrito
 */
@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cliente-dashboard.component.html',
  styleUrls: ['./cliente-dashboard.component.css']
})
export class ClienteDashboardComponent implements OnInit {
  userName: string = '';
  get cantidadCarrito(): number {
    return this.carritoService.cantidadTotal();
  }

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    if (user) {
      this.userName = user.username;
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }

  /**
   * Verificar si una ruta está activa
   */
  isRouteActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
