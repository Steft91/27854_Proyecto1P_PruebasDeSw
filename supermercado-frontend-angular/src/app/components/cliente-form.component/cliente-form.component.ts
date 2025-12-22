import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models';
import { Observable } from 'rxjs'; //

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente-form.component.html'
})
export class ClienteFormComponent implements OnChanges {
  @Input() clienteEditar: Cliente | null = null;
  @Output() guardar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private clienteService: ClienteService) {
    this.form = this.fb.group({
      //dniClient: ['', [Validators.required, cedulaEcuatorianaValidator]],
      dniClient: ['', Validators.required],
      nameClient: ['', Validators.required],
      surnameClient: ['', Validators.required],
      addressClient: ['', Validators.required],
      emailClient: ['', [Validators.email]],
      phoneClient: ['', [Validators.pattern(/^09\d{8}$/)]]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.clienteEditar) {
      this.form.patchValue(this.clienteEditar);
      this.form.get('dniClient')?.disable();
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
    const formData = this.form.getRawValue();
    let request$: Observable<any>;

    if (this.clienteEditar) {
      request$ = this.clienteService.actualizar(this.clienteEditar.dniClient, formData);
    } else {
      request$ = this.clienteService.crear(formData);
    }

    request$.subscribe({
      next: () => {
        alert(this.clienteEditar ? 'Cliente actualizado' : 'Cliente creado');
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
    this.form.get('dniClient')?.enable();
    this.isSubmitting = false;
  }
}

export function cedulaEcuatorianaValidator(control: AbstractControl): ValidationErrors | null {
  const cedula = control.value;
  
  if (!cedula) return null;

  if (cedula.length !== 10 || !/^\d+$/.test(cedula)) {
    return { cedulaInvalida: true };
  }

  const region = parseInt(cedula.substring(0, 2), 10);
  if (region < 1 || region > 24) {
    return { cedulaInvalida: true };
  }

  const tercerDigito = parseInt(cedula.substring(2, 3), 10);
  if (tercerDigito >= 6) {
    return { cedulaInvalida: true };
  }

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const verificador = parseInt(cedula.substring(9, 10), 10);
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.substring(i, i + 1), 10) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  const residuo = suma % 10;
  const resultado = residuo === 0 ? 0 : 10 - residuo;

  if (resultado !== verificador) {
    return { cedulaInvalida: true };
  }

  return null;
}