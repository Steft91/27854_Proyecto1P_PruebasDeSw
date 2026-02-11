import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proveedor } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private apiUrl = `${environment.apiUrl}/providers`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  crear(proveedor: Proveedor): Observable<any> {
    return this.http.post(this.apiUrl, proveedor);
  }

  actualizar(id: string, proveedor: Proveedor): Observable<any> {
    const payload = {
      newNombreFiscal: proveedor.nombreFiscal,
      newRucNitNif: proveedor.rucNitNif,
      newDireccionFisica: proveedor.direccionFisica,
      newTelefonoPrincipal: proveedor.telefonoPrincipal,
      newCorreoElectronico: proveedor.correoElectronico,
      newContactoNombre: proveedor.contactoNombre,
      newContactoPuesto: proveedor.contactoPuesto,
    };
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
