import { Component, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProveedorService } from '../../services/proveedor.service';
import { Proveedor } from '../../models';
import { ConfirmModalComponent } from '../confirm-modal.component/confirm-modal.component';

@Component({
  selector: 'app-proveedor-list',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './proveedor-list.component.html'
})
export class ProveedorListComponent implements OnInit {
  @Output() editar = new EventEmitter<Proveedor>();

  proveedores = signal<Proveedor[]>([]);
  loading = signal<boolean>(false);
  showDeleteModal = false;
  proveedorToDelete: { id: string; nombre: string } | null = null;

  constructor(private service: ProveedorService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.loading.set(true);
    
    this.service.obtenerTodos().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.proveedores.set(data);
        } else {
          console.error('El formato recibido no es un array:', data);
          this.proveedores.set([]);
        }
        this.loading.set(false);
      },
      error: (e) => {
        console.error('Error al cargar proveedores:', e);
        this.loading.set(false);
      }
    });
  }

  onEliminar(id: string | undefined, nombre: string) {
    if (!id) return;
    this.proveedorToDelete = { id, nombre };
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.proveedorToDelete) return;

    this.service.eliminar(this.proveedorToDelete.id).subscribe({
      next: () => {
        alert('Proveedor eliminado');
        this.cargar();
        this.closeModal();
      },
      error: (e) => {
        alert('Error: ' + (e.error?.message || e.message));
        this.closeModal();
      }
    });
  }

  closeModal() {
    this.showDeleteModal = false;
    this.proveedorToDelete = null;
  }
}