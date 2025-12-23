import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductoFormComponent, codigoProductoValidator } from './producto-form.component';
import { ProductoService } from '../../services/producto.service';
import { ProveedorService } from '../../services/proveedor.service';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ProductoFormComponent', () => {
  let component: ProductoFormComponent;
  let fixture: ComponentFixture<ProductoFormComponent>;
  let mockProductoService: jasmine.SpyObj<ProductoService>;
  let mockProveedorService: jasmine.SpyObj<ProveedorService>;

  const mockProveedores = [
    { _id: 'prov1', nombreFiscal: 'Proveedor Uno', rucNitNif: '123', direccionFisica: 'Dir' }
  ];

  beforeEach(async () => {
    mockProductoService = jasmine.createSpyObj('ProductoService', ['crear', 'actualizar']);
    mockProductoService.crear.and.returnValue(of({} as any));
    mockProductoService.actualizar.and.returnValue(of(undefined));

    mockProveedorService = jasmine.createSpyObj('ProveedorService', ['obtenerTodos']);
    mockProveedorService.obtenerTodos.and.returnValue(of(mockProveedores));

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

  it('Debe cargar la lista de proveedores al iniciar (ngOnInit)', () => {
    expect(mockProveedorService.obtenerTodos).toHaveBeenCalled();
    component.proveedores$?.subscribe(provs => {
      expect(provs.length).toBe(1);
      expect(provs[0]._id).toBe('prov1');
    });
  });

  it('Debe llenar el formulario y extraer ID de proveedor si viene como OBJETO (Modo Edición)', () => {
    const productoMock = {
      codeProduct: 'PROD-123',
      nameProduct: 'Arroz',
      descriptionProduct: 'Libra de arroz',
      priceProduct: 1.50,
      stockProduct: 100,
      proveedor: { _id: 'prov1', nombreFiscal: 'Proveedor Uno' }
    };

    component.productoEditar = productoMock as any;
    
    component.ngOnChanges({
      productoEditar: {
        currentValue: productoMock,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.form.get('codeProduct')?.value).toBe('PROD-123');
    expect(component.form.get('codeProduct')?.disabled).toBeTrue();
    expect(component.form.get('proveedor')?.value).toBe('prov1');
  });

  it('Debe llenar el formulario si el proveedor viene como STRING ID (Modo Edición)', () => {
    const productoMock = {
      codeProduct: 'PROD-456',
      nameProduct: 'Azúcar',
      descriptionProduct: 'Kilo',
      priceProduct: 2.00,
      stockProduct: 50,
      proveedor: 'prov2'
    };

    component.productoEditar = productoMock as any;
    
    component.ngOnChanges({
      productoEditar: {
        currentValue: productoMock,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.form.get('proveedor')?.value).toBe('prov2');
  });

  it('Debe resetear el formulario si productoEditar cambia a null', () => {
    component.form.get('codeProduct')?.disable();

    component.productoEditar = null;
    component.ngOnChanges({
      productoEditar: {
        currentValue: null,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });

    expect(component.form.get('codeProduct')?.enabled).toBeTrue();
    expect(component.form.pristine).toBeTrue();
  });

  it('Debe llamar a CREAR cuando no hay productoEditar', () => {
    component.productoEditar = null;
    component.form.patchValue({
      codeProduct: 'PROD-001',
      nameProduct: 'Test',
      descriptionProduct: 'Desc',
      priceProduct: 10,
      stockProduct: 5,
      proveedor: 'prov1'
    });

    component.onSubmit();

    expect(mockProductoService.crear).toHaveBeenCalled();
    expect(mockProductoService.actualizar).not.toHaveBeenCalled();
  });

  it('Debe llamar a ACTUALIZAR cuando existe productoEditar', () => {
    component.productoEditar = { codeProduct: 'PROD-001' } as any;
    component.ngOnChanges({ productoEditar: { currentValue: component.productoEditar } } as any);

    component.form.patchValue({
      nameProduct: 'Editado',
      descriptionProduct: 'Desc',
      priceProduct: 12,
      stockProduct: 6,
      proveedor: 'prov1'
    });

    component.onSubmit();

    expect(mockProductoService.actualizar).toHaveBeenCalled();
    expect(mockProductoService.crear).not.toHaveBeenCalled();
  });

  it('NO debe enviar si el formulario es inválido', () => {
    component.form.reset();
    component.onSubmit();
    
    expect(mockProductoService.crear).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  it('Debe manejar error 403 (Sin permisos)', () => {
    spyOn(window, 'alert');
    mockProductoService.crear.and.returnValue(throwError(() => ({ status: 403 })));

    component.form.patchValue({
      codeProduct: 'PROD-X', nameProduct: 'X', descriptionProduct: 'X',
      priceProduct: 1, stockProduct: 1
    });

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/403/));
    expect(component.isSubmitting).toBeFalse();
  });

  it('Debe manejar errores genéricos', () => {
    spyOn(window, 'alert');
    const errorMsg = { message: 'Fallo backend', error: { message: 'Detalle error' } };
    mockProductoService.crear.and.returnValue(throwError(() => errorMsg));

    component.form.patchValue({
      codeProduct: 'PROD-X', nameProduct: 'X', descriptionProduct: 'X',
      priceProduct: 1, stockProduct: 1
    });

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/Detalle error/));
    expect(component.isSubmitting).toBeFalse();
  });

  it('Debe emitir cancelar y resetear al llamar reset()', () => {
    spyOn(component.cancelar, 'emit');
    component.reset();
    expect(component.cancelar.emit).toHaveBeenCalled();
    expect(component.form.pristine).toBeTrue();
  });

  it('Debe validar isFieldInvalid correctamente', () => {
    const control = component.form.get('nameProduct');
    expect(component.isFieldInvalid('nameProduct')).toBeFalse();

    control?.markAsTouched();
    control?.setErrors({ required: true });

    expect(component.isFieldInvalid('nameProduct')).toBeTrue();
  });

  describe('codigoProductoValidator (Función)', () => {
    it('Debe retornar null si el valor es vacío', () => {
      const control = new FormControl('');
      expect(codigoProductoValidator(control)).toBeNull();
    });

    it('Debe retornar error codigoInvalido si no cumple el regex PROD-numeros', () => {
      expect(codigoProductoValidator(new FormControl('ARROZ001'))).toEqual({ codigoInvalido: true });
      expect(codigoProductoValidator(new FormControl('PROD-ABC'))).toEqual({ codigoInvalido: true }); 
      expect(codigoProductoValidator(new FormControl('prod-123'))).toEqual({ codigoInvalido: true });
    });

    it('Debe retornar null (válido) si cumple el formato PROD-XXXX', () => {
      expect(codigoProductoValidator(new FormControl('PROD-001'))).toBeNull();
      expect(codigoProductoValidator(new FormControl('PROD-123456'))).toBeNull();
    });
  });
});