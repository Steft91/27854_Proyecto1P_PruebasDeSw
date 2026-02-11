import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  crear(producto: any): Observable<any> {
    return this.http.post(this.apiUrl, producto);
  }

  actualizar(code: string, producto: any): Observable<any> {
    const payload = {
      newNameProduct: producto.nameProduct,
      newDescriptionProduct: producto.descriptionProduct,
      newPriceProduct: Number(producto.priceProduct),
      newStockProduct: Number(producto.stockProduct),
      newProveedor: producto.proveedor,
    };
    return this.http.put(`${this.apiUrl}/${code}`, payload);
  }

  eliminar(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${code}`);
  }
}
