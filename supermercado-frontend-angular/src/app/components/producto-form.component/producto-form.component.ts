import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { ProveedorService } from '../../services/proveedor.service';
import { Proveedor } from '../../models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h2>{{ productoEditar ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="data-form">
        
        <div class="form-row" style="display: flex; gap: 10px;">
          <div class="form-group" style="flex: 1;">
            <label>Código de Producto <span class="required">*</span></label>
            <input formControlName="codeProduct" placeholder="Ej: PROD001">
          </div>
          <div class="form-group" style="flex: 2;">
            <label>Nombre del Producto <span class="required">*</span></label>
            <input formControlName="nameProduct">
          </div>
        </div>

        <div class="form-group">
          <label>Descripción <span class="required">*</span></label>
          <textarea formControlName="descriptionProduct" rows="2" style="width:100%; padding:0.5rem; border:1px solid #e2e8f0; border-radius:6px;"></textarea>
        </div>

        <div class="form-row" style="display: flex; gap: 10px;">
          <div class="form-group" style="flex: 1;">
            <label>Precio ($) <span class="required">*</span></label>
            <input type="number" formControlName="priceProduct" step="0.01">
          </div>
          <div class="form-group" style="flex: 1;">
            <label>Stock <span class="required">*</span></label>
            <input type="number" formControlName="stockProduct">
          </div>
        </div>

        <div class="form-group">
          <label>Proveedor</label>
          <select formControlName="proveedor">
            <option [ngValue]="null">-- Seleccione --</option>
            <option *ngFor="let prov of proveedores$ | async" [value]="prov._id">
              {{ prov.nombreFiscal }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="form.invalid">Guardar</button>
          <button *ngIf="productoEditar" type="button" class="btn-secondary" (click)="reset()">Cancelar</button>
        </div>
      </form>
    </div>
  `
})
export class ProductoFormComponent implements OnInit, OnChanges {
  @Input() productoEditar: any | null = null;
  @Output() guardar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;
  proveedores$: Observable<Proveedor[]> | undefined;

  constructor(
    private fb: FormBuilder, 
    private productoService: ProductoService,
    private proveedorService: ProveedorService
  ) {
    this.form = this.fb.group({
      codeProduct: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{3,10}[0-9]{1,10}$/)]],
      nameProduct: ['', Validators.required],
      descriptionProduct: ['', Validators.required],
      priceProduct: [0, [Validators.required, Validators.min(0.01)]],
      stockProduct: [0, [Validators.required, Validators.min(0)]],
      proveedor: [null]
    });
  }

  ngOnInit() {
    this.proveedores$ = this.proveedorService.obtenerTodos();
  }

  ngOnChanges() {
    if (this.productoEditar) {
      this.form.patchValue({
        ...this.productoEditar,
        proveedor: this.productoEditar.proveedor?._id || this.productoEditar.proveedor
      });
      this.form.get('codeProduct')?.disable();
    } else {
      this.form.reset();
      this.form.get('codeProduct')?.enable();
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const data = this.form.getRawValue();

    const request = this.productoEditar 
      ? this.productoService.actualizar(this.productoEditar.codeProduct, data)
      : this.productoService.crear(data);

    request.subscribe({
      next: () => {
        alert('Producto guardado');
        this.reset();
        this.guardar.emit();
      },
      error: (e) => alert('Error: ' + (e.error?.message || e.message))
    });
  }

  reset() {
    this.form.reset();
    this.form.get('codeProduct')?.enable();
    this.cancelar.emit();
  }
}