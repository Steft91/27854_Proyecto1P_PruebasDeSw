import { Component, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProveedorService } from '../../services/proveedor.service';
import { Proveedor } from '../../models';

@Component({
  selector: 'app-proveedor-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proveedor-list.component.html'
})
export class ProveedorListComponent implements OnInit {
  @Output() editar = new EventEmitter<Proveedor>();

  proveedores = signal<Proveedor[]>([]);
  loading = signal<boolean>(false);

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

  onEliminar(id: string | undefined) {
    if (!id) return;
    if (!confirm('¿Eliminar este proveedor?')) return;

    this.service.eliminar(id).subscribe({
      next: () => {
        alert('Proveedor eliminado');
        this.cargar();
      },
      error: (e) => alert('Error: ' + (e.error?.message || e.message))
    });
  }
}