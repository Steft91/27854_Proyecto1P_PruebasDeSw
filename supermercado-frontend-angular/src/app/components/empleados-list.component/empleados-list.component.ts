import { Component, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado } from '../../models';

@Component({
  selector: 'app-empleados-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empleados-list.component.html',
})
export class EmpleadosListComponent implements OnInit {
  @Output() editar = new EventEmitter<Empleado>();

  empleados = signal<Empleado[]>([]);
  loading = signal<boolean>(false);

  constructor(private service: EmpleadoService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading.set(true);
    
    this.service.obtenerTodos().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.empleados.set(data);
        } else {
          console.error('El formato recibido no es un array:', data);
          this.empleados.set([]);
        }
        this.loading.set(false);
      },
      error: (e) => {
        console.error('Error al cargar empleados:', e);
        this.loading.set(false);
      }
    });
  }

  onEliminar(cedula: string) {
    if (!confirm('¿Desvincular empleado?')) return;

    this.service.eliminar(cedula).subscribe({
      next: () => {
        alert('Empleado desvinculado correctamente');
        this.cargar();
      },
      error: (e) => alert('Error al eliminar: ' + (e.error?.message || e.message))
    });
  }
}