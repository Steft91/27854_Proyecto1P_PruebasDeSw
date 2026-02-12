/* istanbul ignore file */
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Empleado } from '../../models';
import { EmpleadoFormComponent } from '../../components/empleado-form.component/empleado-form.component';
import { EmpleadosListComponent } from '../../components/empleados-list.component/empleados-list.component';

@Component({
  selector: 'app-empleados-page',
  standalone: true,
  imports: [CommonModule, EmpleadoFormComponent, EmpleadosListComponent],
  templateUrl: './empleados-page.component.html',
  styleUrls: ['./empleados-page.component.css']
})
export class EmpleadosPageComponent {
  @ViewChild(EmpleadosListComponent) listaEmpleados!: EmpleadosListComponent;

  empleadoEditar: Empleado | null = null;

  setEditEmpleado(empleado: Empleado) {
    this.empleadoEditar = empleado;
    this.scrollToTop();
  }

  onEmpleadoGuardado() {
    this.cancelarEdicion();
    this.listaEmpleados.cargar();
  }

  cancelarEdicion() {
    this.empleadoEditar = null;
  }

  private scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
