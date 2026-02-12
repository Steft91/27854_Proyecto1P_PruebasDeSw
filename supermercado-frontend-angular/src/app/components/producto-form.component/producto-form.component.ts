import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { ProveedorService } from '../../services/proveedor.service';
import { Proveedor, Producto } from '../../models';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './producto-form.component.html',
  styles: [`
    .error-text { color: red; font-size: 0.8em; display: block; margin-top: 4px; }
    input.invalid, textarea.invalid, select.invalid { border-color: red; }
  `]
})
export class ProductoFormComponent implements OnInit, OnChanges {
  @Input() productoEditar: Producto | null = null;
  @Output() guardar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  form: FormGroup;
  proveedores$: Observable<Proveedor[]> | undefined;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private proveedorService: ProveedorService
  ) {
    this.form = this.fb.group({
      //codeProduct: ['', [Validators.required, codigoProductoValidator]],
      codeProduct: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\-]+$/)]],
      nameProduct: ['', Validators.required],
      descriptionProduct: ['', Validators.required],
      priceProduct: [0, [Validators.required, Validators.min(0.01)]],
      stockProduct: [0, [Validators.required, Validators.min(0)]],
      proveedor: [null]
    });
  }

  ngOnInit() {
    // Cargar proveedores para el dropdown (admin y empleado tienen permiso de lectura)
    this.proveedores$ = this.proveedorService.obtenerTodos().pipe(
      catchError((err) => {
        console.warn('No se pudieron cargar proveedores, usando lista vacía', err);
        return of([] as Proveedor[]);
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.productoEditar) {
      const proveedorId = typeof this.productoEditar.proveedor === 'object'
        ? (this.productoEditar.proveedor as any)?._id
        : this.productoEditar.proveedor;

      this.form.patchValue({
        ...this.productoEditar,
        proveedor: proveedorId
      });
      this.form.get('codeProduct')?.disable();
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

    if (this.productoEditar) {
      request$ = this.productoService.actualizar(this.productoEditar.codeProduct, data);
    } else {
      request$ = this.productoService.crear(data);
    }

    request$.subscribe({
      next: () => {
        alert('Producto guardado correctamente');
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
    this.form.get('codeProduct')?.enable();
    this.isSubmitting = false;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

export function codigoProductoValidator(control: AbstractControl): ValidationErrors | null {
  const codigo = control.value;
  if (!codigo) return null;

  // Regex: Empieza con PROD- seguido de uno o más números
  const pattern = /^PROD-\d+$/;

  if (!pattern.test(codigo)) {
    return { codigoInvalido: true };
  }
  return null;
}
