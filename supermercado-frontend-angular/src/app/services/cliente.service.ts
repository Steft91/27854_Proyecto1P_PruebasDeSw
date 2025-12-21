import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private apiUrl = 'http://localhost:3000/api/clients';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Cliente[]> {
    console.log(this.http.get<Cliente[]>(this.apiUrl));
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  crear(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  actualizar(dni: string, cliente: Cliente): Observable<any> {
    const payload = {
      newNameClient: cliente.nameClient,
      newSurnameClient: cliente.surnameClient,
      newAddressClient: cliente.addressClient,
      newEmailClient: cliente.emailClient,
      newPhoneClient: cliente.phoneClient
    };
    return this.http.put(`${this.apiUrl}/${dni}`, payload);
  }

  eliminar(dni: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${dni}`);
  }
}