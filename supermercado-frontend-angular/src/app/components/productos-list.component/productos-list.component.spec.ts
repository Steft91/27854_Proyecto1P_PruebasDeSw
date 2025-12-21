import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductosListComponent } from './productos-list.component';
import { ProductoService } from '../../services/producto.service';
import { of } from 'rxjs';

describe('ProductosListComponent', () => {
  let component: ProductosListComponent;
  let fixture: ComponentFixture<ProductosListComponent>;
  let mockService: any;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ProductoService', ['obtenerTodos', 'eliminar']);
    mockService.obtenerTodos.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ProductosListComponent],
      providers: [{ provide: ProductoService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debe mostrar mensaje de "No existen productos" si la lista está vacía', () => {
    const mensajeVacio = fixture.nativeElement.querySelector('.empty-message');
    expect(mensajeVacio).toBeTruthy();
    expect(mensajeVacio.textContent).toContain('no existen');
  });

  it('Debe llamar al servicio eliminar cuando se confirma', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockService.eliminar.and.returnValue(of({}));
    
    component.onEliminar('COD-001');
    
    expect(mockService.eliminar).toHaveBeenCalledWith('COD-001');
  });
});