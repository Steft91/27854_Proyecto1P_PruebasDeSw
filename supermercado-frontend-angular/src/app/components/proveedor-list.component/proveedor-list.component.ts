import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProveedorService } from '../../services/proveedor.service';
import { Proveedor } from '../../models';

@Component({
  selector: 'app-proveedor-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proveedor-list.component.html'
})
export class ProveedorListComponent implements OnInit, OnChanges {
  @Input() refreshTrigger = 0;
  @Output() editar = new EventEmitter<Proveedor>();

  proveedores: Proveedor[] = [];
  loading = false;

  constructor(private service: ProveedorService, private cd: ChangeDetectorRef ) {}

  ngOnInit() { this.cargar(); }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange) {
      this.cargar();
    }
  }

  cargar() {
    this.loading = true;
    this.service.obtenerTodos().subscribe({
      next: (data) => {
        console.log('Datos recibidos del backend:', data);
        if (Array.isArray(data)) {
          this.proveedores = data;
        } else {
          console.error('El formato recibido no es un array:', data);
          this.proveedores = [];
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