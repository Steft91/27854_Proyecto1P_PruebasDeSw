import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductosListComponent } from './productos-list.component';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ProductosListComponent', () => {
  let component: ProductosListComponent;
  let fixture: ComponentFixture<ProductosListComponent>;
  let mockService: jasmine.SpyObj<ProductoService>;

  const DATA: Producto[] = [
    { 
      codeProduct: 'P01', 
      nameProduct: 'Arroz', 
      descriptionProduct: 'Grano', 
      priceProduct: 2.50, 
      stockProduct: 50,
      proveedor: { _id: '1', nombreFiscal: 'Prov A' } as any
    },
    { 
      codeProduct: 'P02', 
      nameProduct: 'Azúcar', 
      descriptionProduct: 'Dulce', 
      priceProduct: 1.00, 
      stockProduct: 5,
      proveedor: { _id: '2', nombreFiscal: 'Prov B' } as any 
    }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ProductoService', ['obtenerTodos', 'eliminar']);
    mockService.obtenerTodos.and.returnValue(of(DATA));
    mockService.eliminar.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ProductosListComponent],
      providers: [
        { provide: ProductoService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosListComponent);
    component = fixture.componentInstance;
  });
-

  it('Debe cargar y mostrar la tabla de productos (Happy Path)', () => {
    fixture.detectChanges();

    expect(component.productos().length).toBe(2);
    expect(component.loading()).toBeFalse();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);
    expect(rows[0].nativeElement.textContent).toContain('Arroz');
  });

  it('Debe aplicar estilos de advertencia (rojo/negrita) si el stock es bajo (<10)', () => {
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    const stockCellLow = rows[1].query(By.css('td[data-label="Stock"]')).nativeElement;

    expect(stockCellLow.style.color).toBe('var(--danger-color)');
    expect(stockCellLow.style.fontWeight).toBe('700');

    const stockCellNormal = rows[0].query(By.css('td[data-label="Stock"]')).nativeElement;
    expect(stockCellNormal.style.color).toBe('inherit');
  });

  it('Debe mostrar mensaje "No existen productos" si la lista está vacía', () => {
    mockService.obtenerTodos.and.returnValue(of([]));
    fixture.detectChanges();

    const emptyMsg = fixture.debugElement.query(By.css('.empty-message'));
    expect(emptyMsg).toBeTruthy();
    expect(emptyMsg.nativeElement.textContent).toContain('No tiene acceso');
  });

  it('Debe manejar respuesta inválida del backend (No es un array)', () => {
    mockService.obtenerTodos.and.returnValue(of({ error: 'Data corrupta' } as any));
    spyOn(console, 'error');

    fixture.detectChanges();

    expect(component.productos().length).toBe(0);
    expect(console.error).toHaveBeenCalledWith('El formato recibido no es un array:', jasmine.any(Object));
  });

  it('Debe manejar error de red al cargar', () => {
    const errorMsg = { message: 'Network Error' };
    mockService.obtenerTodos.and.returnValue(throwError(() => errorMsg));
    spyOn(console, 'error');

    fixture.detectChanges();

    expect(component.productos().length).toBe(0);
    expect(component.loading()).toBeFalse();
    expect(console.error).toHaveBeenCalledWith('Error al cargar productos:', errorMsg);
  });

  it('Debe emitir el evento EDITAR con el producto seleccionado', () => {
    fixture.detectChanges();
    spyOn(component.editar, 'emit');

    const editBtn = fixture.debugElement.query(By.css('.btn-edit'));
    editBtn.triggerEventHandler('click', null);

    expect(component.editar.emit).toHaveBeenCalledWith(DATA[0]);
  });

  it('Debe abrir el modal y guardar referencia al llamar onEliminar', () => {
    fixture.detectChanges();
    component.onEliminar('P01', 'Arroz');

    expect(component.showDeleteModal).toBeTrue();
    expect(component.productoToDelete).toEqual({ code: 'P01', nombre: 'Arroz' });
  });

  it('Debe eliminar, recargar y cerrar modal al CONFIRMAR', () => {
    fixture.detectChanges();
    spyOn(window, 'alert');

    component.productoToDelete = { code: 'P01', nombre: 'Arroz' };
    component.showDeleteModal = true;

    component.confirmDelete();

    expect(mockService.eliminar).toHaveBeenCalledWith('P01');
    expect(window.alert).toHaveBeenCalledWith('Producto eliminado correctamente');
    expect(component.showDeleteModal).toBeFalse();
    expect(component.productoToDelete).toBeNull();
    expect(mockService.obtenerTodos).toHaveBeenCalledTimes(2);
  });

  it('Debe manejar error al eliminar y cerrar modal', () => {
    fixture.detectChanges();
    spyOn(window, 'alert');
    mockService.eliminar.and.returnValue(throwError(() => ({ message: 'Error DB' })));

    component.productoToDelete = { code: 'P01', nombre: 'Arroz' };
    component.confirmDelete();

    expect(mockService.eliminar).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Error al eliminar: Error DB');
    expect(component.showDeleteModal).toBeFalse();
  });

  it('NO debe hacer nada si se confirma sin producto seleccionado', () => {
    fixture.detectChanges();
    component.productoToDelete = null;
    
    component.confirmDelete();

    expect(mockService.eliminar).not.toHaveBeenCalled();
  });

  it('Debe resetear estado al cerrar modal', () => {
    component.showDeleteModal = true;
    component.productoToDelete = { code: 'X', nombre: 'X' };

    component.closeModal();

    expect(component.showDeleteModal).toBeFalse();
    expect(component.productoToDelete).toBeNull();
  });
});