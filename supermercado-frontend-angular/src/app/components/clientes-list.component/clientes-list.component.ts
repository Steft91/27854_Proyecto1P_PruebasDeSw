import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models';
import { ConfirmModalComponent } from '../confirm-modal.component/confirm-modal.component';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './clientes-list.component.html',
})
export class ClientesListComponent implements OnInit {
  @Output() editar = new EventEmitter<Cliente>();
  clientes = signal<Cliente[]>([]); 
  loading = signal<boolean>(false);
  showDeleteModal = false;
  clienteToDelete: { dni: string; nombre: string } | null = null;

  constructor(private clienteService: ClienteService) {}

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.loading.set(true);
    
    this.clienteService.obtenerTodos().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.loading.set(false);
      },
      error: (e) => {
        console.error('Error al cargar clientes:', e);
        this.loading.set(false);
      }
    });
  }

  onEliminar(dni: string, nombre: string) {
    this.clienteToDelete = { dni, nombre };
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.clienteToDelete) return;

    this.clienteService.eliminar(this.clienteToDelete.dni).subscribe({
      next: () => {
        alert('Cliente eliminado correctamente');
        this.cargarClientes();
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
    this.clienteToDelete = null;
  }
}