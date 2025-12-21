import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado } from '../../models';

@Component({
  selector: 'app-empleados-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empleados-list.component.html',
})
export class EmpleadosListComponent implements OnInit, OnChanges {
  @Input() refreshTrigger = 0;
  @Output() editar = new EventEmitter<Empleado>();
  empleados: Empleado[] = [];
  loading = false;

  constructor(private service: EmpleadoService, private cd: ChangeDetectorRef) {}

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
          this.empleados = data;
        } else {
          console.error('El formato recibido no es un array:', data);
          this.empleados = [];
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

  onEliminar(cedula: string) {
    if (confirm('¿Desvincular empleado?')) {
      this.service.eliminar(cedula).subscribe(() => this.cargar());
    }
  }
}