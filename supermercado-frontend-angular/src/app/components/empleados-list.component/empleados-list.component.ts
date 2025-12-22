import { Component, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado } from '../../models';
import { ConfirmModalComponent } from '../confirm-modal.component/confirm-modal.component';

@Component({
  selector: 'app-empleados-list',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './empleados-list.component.html',
})
export class EmpleadosListComponent implements OnInit {
  @Output() editar = new EventEmitter<Empleado>();

  empleados = signal<Empleado[]>([]);
  loading = signal<boolean>(false);
  showDeleteModal = false;
  empleadoToDelete: { cedula: string; nombre: string } | null = null;

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

  onEliminar(cedula: string, nombre: string) {
    this.empleadoToDelete = { cedula, nombre };
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.empleadoToDelete) return;

    this.service.eliminar(this.empleadoToDelete.cedula).subscribe({
      next: () => {
        alert('Empleado desvinculado correctamente');
        this.cargar();
        this.closeModal();
      },
      error: (e) => {
        alert('Error al eliminar: ' + (e.error?.message || e.message));
        this.closeModal();
      }
    });
  }

  closeModal() {
    this.showDeleteModal = false;
    this.empleadoToDelete = null;
  }
}