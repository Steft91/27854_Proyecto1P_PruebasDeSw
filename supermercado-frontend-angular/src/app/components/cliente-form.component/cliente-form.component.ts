import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models';

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

  constructor(private fb: FormBuilder, private clienteService: ClienteService) {
    this.form = this.fb.group({
      dniClient: ['', Validators.required],
      nameClient: ['', Validators.required],
      surnameClient: ['', Validators.required],
      addressClient: ['', Validators.required],
      emailClient: ['', Validators.email],
      phoneClient: ['', Validators.pattern(/^[0-9\-+]{7,15}$/)]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.clienteEditar) {
      this.form.patchValue(this.clienteEditar);
      this.form.get('dniClient')?.disable();
    } else {
      this.form.reset();
      this.form.get('dniClient')?.enable();
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      alert('Por favor verifica los campos requeridos y formatos.');
      return;
    }

    const formData = this.form.getRawValue();

    if (this.clienteEditar) {
      this.clienteService.actualizar(this.clienteEditar.dniClient, formData).subscribe({
        next: () => {
          alert('Cliente actualizado');
          this.reset();
          this.guardar.emit();
        },
        error: (e) => alert('Error: ' + (e.error?.message || e.message))
      });
    } else {
      this.clienteService.crear(formData).subscribe({
        next: () => {
          alert('Cliente creado');
          this.reset();
          this.guardar.emit();
        },
        error: (e) => alert('Error: ' + (e.error?.message || e.message))
      });
    }
  }

  reset() {
    this.form.reset();
    this.form.get('dniClient')?.enable();
    this.cancelar.emit();
  }
}