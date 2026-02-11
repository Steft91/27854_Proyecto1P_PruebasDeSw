import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empleado } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private apiUrl = `${environment.apiUrl}/empleados`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.apiUrl);
  }

  crear(empleado: Empleado): Observable<any> {
    return this.http.post(this.apiUrl, empleado);
  }

  actualizar(cedula: string, empleado: any): Observable<any> {
    const payload = {
      newNombreEmpleado: empleado.nombreEmpleado,
      newEmailEmpleado: empleado.emailEmpleado,
      newCelularEmpleado: empleado.celularEmpleado,
      newDireccionEmpleado: empleado.direccionEmpleado,
      newSueldoEmpleado: Number(empleado.sueldoEmpleado),
    };
    return this.http.put(`${this.apiUrl}/${cedula}`, payload);
  }

  eliminar(cedula: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cedula}`);
  }
}
