import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado } from '../../models';
import { Observable } from 'rxjs';

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
            <input formControlName="cedulaEmpleado" placeholder="10 dígitos" 
                  [class.invalid]="isFieldInvalid('cedulaEmpleado')">
            <small *ngIf="isFieldInvalid('cedulaEmpleado')" class="error-text">
              Requerido, 10 dígitos.
            </small>
          </div>

          <div class="form-group" style="flex:1;">
            <label>Sueldo ($) <span class="required">*</span></label>
            <input type="number" formControlName="sueldoEmpleado" 
                  [class.invalid]="isFieldInvalid('sueldoEmpleado')">
          </div>
        </div>

        <div class="form-group">
          <label>Nombre Completo <span class="required">*</span></label>
          <input formControlName="nombreEmpleado" 
                [class.invalid]="isFieldInvalid('nombreEmpleado')">
        </div>

        <div class="form-row" style="display:flex; gap:10px;">
          <div class="form-group" style="flex:1;">
            <label>Celular <span class="required">*</span></label>
            <input formControlName="celularEmpleado" 
                  [class.invalid]="isFieldInvalid('celularEmpleado')">
          </div>
          <div class="form-group" style="flex:1;">
            <label>Correo Electrónico</label>
            <input type="email" formControlName="emailEmpleado" 
                  [class.invalid]="isFieldInvalid('emailEmpleado')">
            <small *ngIf="hasError('emailEmpleado', 'email')" class="error-text">
              Email inválido.
            </small>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="isSubmitting">
            {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
          </button>
          
          <button *ngIf="empleadoEditar || form.dirty" type="button" class="btn-secondary" 
                  (click)="reset()" [disabled]="isSubmitting">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .error-text { color: red; font-size: 0.8em; display: block; margin-top: 4px; }
    input.invalid { border-color: red; }
  `]
})
export class EmpleadoFormComponent implements OnChanges {
  @Input() empleadoEditar: Empleado | null = null;
  @Output() guardar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
  
  form: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private service: EmpleadoService) {
    this.form = this.fb.group({
      cedulaEmpleado: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      nombreEmpleado: ['', Validators.required],
      emailEmpleado: ['', [Validators.email]],
      celularEmpleado: ['', Validators.required],
      sueldoEmpleado: [460, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.empleadoEditar) {
      this.form.patchValue(this.empleadoEditar);
      this.form.get('cedulaEmpleado')?.disable();
    } else {
      this.resetFormState();
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const data = this.form.getRawValue();

    let request$: Observable<any>;

    if (this.empleadoEditar) {
      request$ = this.service.actualizar(this.empleadoEditar.cedulaEmpleado, data);
    } else {
      request$ = this.service.crear(data);
    }

    request$.subscribe({
      next: () => {
        alert(this.empleadoEditar ? 'Empleado actualizado' : 'Empleado contratado');
        this.guardar.emit();
        this.reset();
      },
      error: (e: any) => {
        console.error(e);
        if (e.status === 403) {
          alert('Error: No está autorizado para esta acción (403)');
        } else {
          alert('Error: ' + (e.error?.message || e.message));
        }
        this.isSubmitting = false;
        this.reset();
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  reset() {
    this.resetFormState();
    this.cancelar.emit();
  }

  private resetFormState() {
    this.form.reset({ sueldoEmpleado: 460 });
    this.form.get('cedulaEmpleado')?.enable();
    this.isSubmitting = false;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasError(field: string, errorType: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.hasError(errorType) && (control.dirty || control.touched));
  }
}

export function sueldoMinimoValidator(control: AbstractControl): ValidationErrors | null {
  const sueldo = control.value;
  if (sueldo === null || sueldo === undefined) return null;

  if (sueldo < 460) {
    return { sueldoIlegal: true };
  }
  return null;
}