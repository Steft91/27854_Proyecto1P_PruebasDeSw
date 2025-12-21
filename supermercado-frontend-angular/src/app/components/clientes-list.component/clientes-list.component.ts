import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core'; // <--- Importa ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes-list.component.html',
})
export class ClientesListComponent implements OnInit, OnChanges {
  @Input() refreshTrigger = 0; 
  @Output() editar = new EventEmitter<Cliente>();

  clientes: Cliente[] = [];
  loading = false;

  constructor(
    private clienteService: ClienteService,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.cargarClientes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange) {
      this.cargarClientes();
    }
  }

  cargarClientes() {
    this.loading = true;
    
    this.clienteService.obtenerTodos().subscribe({
      next: (data: any) => {
        console.log('Datos recibidos del backend:', data);

        if (Array.isArray(data)) {
          this.clientes = data;
        } else {
          console.error('El formato recibido no es un array:', data);
          this.clientes = [];
        }

        this.loading = false;
        this.cd.detectChanges(); 
      },
      error: (e) => {
        console.error('Error al cargar clientes:', e);
        this.loading = false;
        this.cd.detectChanges();
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