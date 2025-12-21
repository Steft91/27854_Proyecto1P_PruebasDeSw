import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
      dniClient: ['', Validators.required],
      nameClient: ['', Validators.required],
      surnameClient: ['', Validators.required],
      addressClient: ['', Validators.required],
      emailClient: ['', [Validators.email]],
      phoneClient: ['', [Validators.pattern(/^[0-9\-+]{7,15}$/)]]
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
        alert('Error: ' + (e.error?.message || e.message));
        this.isSubmitting = false;
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