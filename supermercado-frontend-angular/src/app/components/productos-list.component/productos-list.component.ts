import { Component, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos-list.component.html'
})
export class ProductosListComponent implements OnInit {
  @Output() editar = new EventEmitter<Producto>();

  // Estado reactivo con Signals
  productos = signal<Producto[]>([]);
  loading = signal<boolean>(false);

  constructor(private service: ProductoService) {}

  ngOnInit() {
    this.cargar();
  }

  // Método público para recargar la lista
  cargar() {
    this.loading.set(true);
    
    this.service.obtenerTodos().subscribe({
      next: (data) => {
        // Validación de array para seguridad
        if (Array.isArray(data)) {
          this.productos.set(data);
        } else {
          console.error('El formato recibido no es un array:', data);
          this.productos.set([]);
        }
        this.loading.set(false);
      },
      error: (e) => {
        console.error('Error al cargar productos:', e);
        this.loading.set(false);
      }
    });
  }

  onEliminar(code: string) {
    if (!confirm('¿Eliminar producto?')) return;

    this.service.eliminar(code).subscribe({
      next: () => {
        alert('Producto eliminado correctamente');
        this.cargar(); // Recargamos la lista
      },
      error: (e) => alert('Error al eliminar: ' + (e.error?.message || e.message))
    });
  }
}