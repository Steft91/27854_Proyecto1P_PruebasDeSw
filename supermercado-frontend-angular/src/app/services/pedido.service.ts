import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Interfaces para Pedidos
 */
export interface ItemPedido {
  producto: string; // Código del producto
  cantidad: number;
}

export interface DatosEntrega {
  direccion: string;
  telefono: string;
  notas?: string;
}

export interface CrearPedidoDTO {
  items: ItemPedido[];
  datosEntrega: DatosEntrega;
}

export interface ItemPedidoDetalle {
  producto: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  _id: string;
  usuario: string | {
    _id: string;
    username: string;
    email: string;
    rol: string;
  };
  items: ItemPedidoDetalle[];
  total: number;
  estado: 'pendiente' | 'procesando' | 'completado' | 'cancelado';
  datosEntrega: DatosEntrega;
  createdAt: Date;
  updatedAt: Date;
}

export interface PedidoResponse {
  msg: string;
  pedido: Pedido;
}

/**
 * Servicio para gestión de pedidos
 * Maneja las operaciones HTTP relacionadas con pedidos
 */
@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  /**
   * Crear un nuevo pedido (Cliente)
   * POST /api/pedidos
   */
  crearPedido(pedidoData: CrearPedidoDTO): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(this.apiUrl, pedidoData);
  }

  /**
   * Obtener mis pedidos (Cliente)
   * GET /api/pedidos/mis-pedidos
   */
  getMisPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/mis-pedidos`);
  }

  /**
   * Obtener todos los pedidos (Admin/Empleado)
   * GET /api/pedidos
   */
  getTodosPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  /**
   * Obtener un pedido por ID
   * GET /api/pedidos/:id
   */
  getPedidoById(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualizar estado de un pedido (Admin/Empleado)
   * PUT /api/pedidos/:id/estado
   */
  actualizarEstadoPedido(
    id: string,
    estado: 'pendiente' | 'procesando' | 'completado' | 'cancelado'
  ): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  /**
   * Cancelar un pedido (Cliente)
   * PUT /api/pedidos/:id/cancelar
   */
  cancelarPedido(id: string): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.apiUrl}/${id}/cancelar`, {});
  }
}
