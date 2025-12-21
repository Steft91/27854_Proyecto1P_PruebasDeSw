import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmpleadoService } from '../../services/empleado.service';

@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h2>{{ empleadoEditar ? 'Editar Empleado' : 'Contratar Empleado' }}</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="data-form">
        
        <div class="form-row" style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;">
            <label>Cédula <span class="required">*</span></label>
            <input formControlName="cedulaEmpleado" placeholder="10 dígitos">
          </div>
          <div class="form-group" style="flex:1;">
            <label>Sueldo ($) <span class="required">*</span></label>
            <input type="number" formControlName="sueldoEmpleado">
          </div>
        </div>

        <div class="form-group">
          <label>Nombre Completo <span class="required">*</span></label>
          <input formControlName="nombreEmpleado">
        </div>

        <div class="form-row" style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;">
            <label>Celular <span class="required">*</span></label>
            <input formControlName="celularEmpleado">
          </div>
          <div class="form-group" style="flex:1;">
            <label>Correo Electrónico</label>
            <input type="email" formControlName="emailEmpleado">
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="form.invalid">Guardar</button>
          <button *ngIf="empleadoEditar" type="button" class="btn-secondary" (click)="reset()">Cancelar</button>
        </div>
      </form>
    </div>
  `
})
export class EmpleadoFormComponent implements OnChanges {
  @Input() empleadoEditar: any | null = null;
  @Output() guardar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  
  form: FormGroup;

  constructor(private fb: FormBuilder, private service: EmpleadoService) {
    this.form = this.fb.group({
      cedulaEmpleado: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      nombreEmpleado: ['', Validators.required],
      emailEmpleado: ['', Validators.email],
      celularEmpleado: ['', Validators.required],
      sueldoEmpleado: [460, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnChanges() {
    if (this.empleadoEditar) {
      this.form.patchValue(this.empleadoEditar);
      this.form.get('cedulaEmpleado')?.disable();
    } else {
      this.form.reset({ sueldoEmpleado: 460 });
      this.form.get('cedulaEmpleado')?.enable();
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const data = this.form.getRawValue();

    const req = this.empleadoEditar
      ? this.service.actualizar(this.empleadoEditar.cedulaEmpleado, data)
      : this.service.crear(data);

    req.subscribe({
      next: () => { alert('Éxito'); this.reset(); this.guardar.emit(); },
      error: (e) => alert('Error: ' + (e.error?.message || e.message))
    });
  }

  reset() {
    this.form.reset();
    this.form.get('cedulaEmpleado')?.enable();
    this.cancelar.emit();
  }
}