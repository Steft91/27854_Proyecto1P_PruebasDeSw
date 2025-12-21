import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './productos-list.component.html'
})
export class ProductosListComponent implements OnInit, OnChanges {
  @Input() refreshTrigger = 0;
  @Output() editar = new EventEmitter<Producto>();

  productos: any[] = [];
  loading = false;

  constructor(private service: ProductoService, private cd: ChangeDetectorRef) {}

  ngOnInit() { this.cargar(); }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange) this.cargar();
  }

  cargar() {
    this.loading = true;
    this.service.obtenerTodos().subscribe({
      next: (data) => { 
        console.log('Datos recibidos del backend:', data);
        
        if (Array.isArray(data)) {
          this.productos = data;
        } else {
          console.error('El formato recibido no es un array:', data);
          this.productos = [];
        }

        this.loading = false;
        this.cd.detectChanges(); 
      },
      error: (e) => {
        console.error('Error al cargar proveedores:', e);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  onEliminar(code: string) {
    if (confirm('¿Eliminar producto?')) {
      this.service.eliminar(code).subscribe(() => this.cargar());
    }
  }
}