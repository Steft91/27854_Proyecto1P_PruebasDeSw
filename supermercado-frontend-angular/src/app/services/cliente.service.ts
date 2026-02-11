import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  crear(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  actualizar(dni: string, cliente: Cliente): Observable<void> {
    const payload = {
      newNameClient: cliente.nameClient,
      newSurnameClient: cliente.surnameClient,
      newAddressClient: cliente.addressClient,
      newEmailClient: cliente.emailClient,
      newPhoneClient: cliente.phoneClient,
    };
    return this.http.put<void>(`${this.apiUrl}/${dni}`, payload);
  }

  eliminar(dni: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${dni}`);
  }
}
