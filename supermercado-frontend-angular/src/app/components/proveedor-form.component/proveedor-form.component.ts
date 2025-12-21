import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProveedorService } from '../../services/proveedor.service';
import { Proveedor } from '../../models';

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

  constructor(private fb: FormBuilder, private service: ProveedorService) {
    this.form = this.fb.group({
      nombreFiscal: ['', Validators.required],
      rucNitNif: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
      direccionFisica: ['', Validators.required],
      telefonoPrincipal: ['', Validators.pattern(/^[\d\s\-+()]{7,20}$/)],
      correoElectronico: ['', Validators.email],
      contactoNombre: ['', Validators.maxLength(100)],
      contactoPuesto: ['', Validators.maxLength(100)]
    });
  }

  ngOnChanges() {
    if (this.proveedorEditar) {
      this.form.patchValue(this.proveedorEditar);
    } else {
      this.form.reset();
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const data = this.form.value;

    if (this.proveedorEditar && this.proveedorEditar._id) {
      this.service.actualizar(this.proveedorEditar._id, data).subscribe({
        next: () => {
          alert('Proveedor actualizado');
          this.reset();
          this.guardar.emit();
        },
        error: (e) => alert('Error: ' + e.message)
      });
    } else {
      this.service.crear(data).subscribe({
        next: () => {
          alert('Proveedor creado');
          this.reset();
          this.guardar.emit();
        },
        error: (e) => alert('Error: ' + e.message)
      });
    }
  }

  reset() {
    this.form.reset();
    this.cancelar.emit();
  }
}