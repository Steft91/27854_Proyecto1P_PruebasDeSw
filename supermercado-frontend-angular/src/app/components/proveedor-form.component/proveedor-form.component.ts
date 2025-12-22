import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProveedorService } from '../../services/proveedor.service';
import { Proveedor } from '../../models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-proveedor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './proveedor-form.component.html'
})
export class ProveedorFormComponent implements OnChanges {
  @Input() proveedorEditar: Proveedor | null = null;
  @Output() guardar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private service: ProveedorService) {
    this.form = this.fb.group({
      nombreFiscal: ['', Validators.required],
      //rucNitNif: ['', [Validators.required, rucEcuatorianoValidator]],
      rucNitNif: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      direccionFisica: ['', Validators.required],
      telefonoPrincipal: ['', Validators.pattern(/^[\d\s\-+()]{7,20}$/)],
      correoElectronico: ['', [Validators.email]], 
      contactoNombre: ['', Validators.maxLength(100)],
      contactoPuesto: ['', Validators.maxLength(100)]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.proveedorEditar) {
      this.form.patchValue(this.proveedorEditar);
      this.form.get('rucNitNif')?.disable(); 
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

    if (this.proveedorEditar && this.proveedorEditar._id) {
      request$ = this.service.actualizar(this.proveedorEditar._id, data);
    } else {
      request$ = this.service.crear(data);
    }

    request$.subscribe({
      next: () => {
        alert(this.proveedorEditar ? 'Proveedor actualizado' : 'Proveedor creado');
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
    this.form.reset();
    this.isSubmitting = false;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

export function rucEcuatorianoValidator(control: AbstractControl): ValidationErrors | null {
  const ruc = control.value;
  if (!ruc) return null;
  if (!/^\d+$/.test(ruc)) return { rucInvalido: true };
  if (ruc.length !== 13) return { rucInvalido: true };
  if (!ruc.endsWith('001')) return { rucInvalido: true };

  return null;
}