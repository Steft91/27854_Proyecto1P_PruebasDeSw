import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/register.component/register.component';
import { UnauthorizedComponent } from './components/auth/unauthorized/unauthorized.component';
import { roleGuard } from './guards/role.guard';
import { AdministradorDashboardComponent } from './components/dashboards/administrador-dashboard/administrador-dashboard.component';
import { EmpleadoDashboardComponent } from './components/dashboards/empleado-dashboard/empleado-dashboard.component';
import { ClienteDashboardComponent } from './components/dashboards/cliente-dashboard/cliente-dashboard.component';
import { ClientesPageComponent } from './pages/clientes-page/clientes-page.component';
import { EmpleadosPageComponent } from './pages/empleados-page/empleados-page.component';
import { ProductosPageComponent } from './pages/productos-page/productos-page.component';
import { ProveedoresPageComponent } from './pages/proveedores-page/proveedores-page.component';
import { ProductCatalogComponent } from './components/product-catalog/product-catalog.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos.component';
import { DetallePedidoComponent } from './components/detalle-pedido/detalle-pedido.component';

/**
 * Configuración de rutas de la aplicación
 *
 * Estructura:
 * - Rutas públicas: login, register
 * - Rutas protegidas por rol: admin, empleado, cliente (pendientes de implementación)
 * - Rutas de error: unauthorized, 404
 */
export const routes: Routes = [
  // Ruta raíz redirige a login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Rutas públicas de autenticación
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión - Sistema de Gestión'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Registrarse - Sistema de Gestión'
  },

  // Ruta de error - acceso no autorizado
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
    title: 'Acceso No Autorizado'
  },

  // Rutas protegidas - Administrador
  {
    path: 'admin',
    component: AdministradorDashboardComponent,
    canActivate: [roleGuard],
    data: { roles: ['administrador'] },
    title: 'Panel de Administrador',
    children: [
      { path: '', redirectTo: 'clientes', pathMatch: 'full' },
      { path: 'clientes', component: ClientesPageComponent },
      { path: 'empleados', component: EmpleadosPageComponent },
      { path: 'productos', component: ProductosPageComponent },
      { path: 'proveedores', component: ProveedoresPageComponent }
    ]
  },

  // Rutas protegidas - Empleado
  {
    path: 'empleado',
    component: EmpleadoDashboardComponent,
    canActivate: [roleGuard],
    data: { roles: ['empleado'] },
    title: 'Panel de Empleado',
    children: [
      { path: '', redirectTo: 'clientes', pathMatch: 'full' },
      { path: 'clientes', component: ClientesPageComponent },
      { path: 'productos', component: ProductosPageComponent }
    ]
  },

  // Rutas protegidas - Cliente
  {
    path: 'cliente',
    component: ClienteDashboardComponent,
    canActivate: [roleGuard],
    data: { roles: ['cliente'] },
    title: 'Panel de Cliente',
    children: [
      { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
      { path: 'catalogo', component: ProductCatalogComponent, title: 'Catálogo de Productos' },
      { path: 'carrito', component: CarritoComponent, title: 'Mi Carrito' },
      { path: 'checkout', component: CheckoutComponent, title: 'Finalizar Compra' },
      { path: 'pedidos', component: MisPedidosComponent, title: 'Mis Pedidos' },
      { path: 'pedidos/:id', component: DetallePedidoComponent, title: 'Detalle de Pedido' }
    ]
  },

  // Ruta catch-all para 404 - redirige a login
  {
    path: '**',
    redirectTo: '/login'
  }
];
