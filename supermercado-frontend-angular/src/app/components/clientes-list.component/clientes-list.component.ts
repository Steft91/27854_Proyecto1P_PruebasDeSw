import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes-list.component.html',
})
export class ClientesListComponent implements OnInit {
  @Output() editar = new EventEmitter<Cliente>();
  clientes = signal<Cliente[]>([]); 
  loading = signal<boolean>(false);

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

  onEliminar(dni: string) {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

    this.clienteService.eliminar(dni).subscribe({
      next: () => {
        alert('Cliente eliminado correctamente');
        this.cargarClientes(); 
      },
      error: (e) => alert('Error al eliminar: ' + (e.error?.message || e.message))
    });
  }
}