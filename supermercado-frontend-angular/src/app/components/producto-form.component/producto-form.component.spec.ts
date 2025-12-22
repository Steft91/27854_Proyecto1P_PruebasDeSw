import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductoFormComponent } from './producto-form.component';
import { ProductoService } from '../../services/producto.service';
import { ProveedorService } from '../../services/proveedor.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ProductoFormComponent', () => {
  let component: ProductoFormComponent;
  let fixture: ComponentFixture<ProductoFormComponent>;
  let mockProductoService: any;
  let mockProveedorService: any;

  beforeEach(async () => {
    mockProductoService = jasmine.createSpyObj('ProductoService', ['crear', 'actualizar']);
    mockProductoService.crear.and.returnValue(of({}));
    mockProveedorService = jasmine.createSpyObj('ProveedorService', ['obtenerTodos']);
    mockProveedorService.obtenerTodos.and.returnValue(of([
      { _id: 'prov1', nombreFiscal: 'Proveedor Uno' }
    ]));

    await TestBed.configureTestingModule({
      imports: [ProductoFormComponent, ReactiveFormsModule],
      providers: [
        { provide: ProductoService, useValue: mockProductoService },
        { provide: ProveedorService, useValue: mockProveedorService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debe cargar la lista de proveedores al iniciar', () => {
    expect(mockProveedorService.obtenerTodos).toHaveBeenCalled();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const opciones = fixture.debugElement.queryAll(By.css('select option'));
      expect(opciones.length).toBeGreaterThan(1); 
    });
  });

  it('Debe validar que precio y stock sean positivos', () => {
    const priceControl = component.form.controls['priceProduct'];
    const stockControl = component.form.controls['stockProduct'];

    priceControl.setValue(-5);
    stockControl.setValue(-1);
    
    expect(priceControl.invalid).toBeTrue();
    expect(stockControl.invalid).toBeTrue(); 
  });

  describe('Validación de Código de Producto (Regresión)', () => {
    it('Debe rechazar códigos que no empiecen con PROD-', () => {
      const control = component.form.controls['codeProduct'];
      
      // ANTES: 'ARROZ001' era válido.
      // AHORA: Debe marcar error.
      control.setValue('ARROZ001');
      expect(control.hasError('codigoInvalido')).toBeTrue();
    });

    it('Debe aceptar el formato PROD-XXXX', () => {
      const control = component.form.controls['codeProduct'];
      control.setValue('PROD-5500');
      expect(control.valid).toBeTrue();
    });
  });
});