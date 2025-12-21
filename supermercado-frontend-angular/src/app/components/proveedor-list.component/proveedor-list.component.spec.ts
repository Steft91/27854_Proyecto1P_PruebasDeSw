import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProveedorListComponent } from './proveedor-list.component';
import { ProveedorService } from '../../services/proveedor.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ProveedorListComponent', () => {
  let component: ProveedorListComponent;
  let fixture: ComponentFixture<ProveedorListComponent>;
  let mockService: any;

  const DATA_TEST = [
    { _id: '1', nombreFiscal: 'Empresa A', rucNitNif: '1234567890', direccionFisica: 'Norte' },
    { _id: '2', nombreFiscal: 'Empresa B', rucNitNif: '0987654321', direccionFisica: 'Sur' }
  ];

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ProveedorService', ['obtenerTodos', 'eliminar']);
    mockService.obtenerTodos.and.returnValue(of(DATA_TEST));
    mockService.eliminar.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ProveedorListComponent],
      providers: [{ provide: ProveedorService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debe renderizar los proveedores en la tabla', () => {
    expect(component.proveedores().length).toBe(2);
    
    const filas = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(filas.length).toBe(2);
    expect(filas[0].nativeElement.textContent).toContain('Empresa A');
  });

  it('Debe emitir el evento editar al hacer click en el botón', () => {
    spyOn(component.editar, 'emit');

    const btnEdit = fixture.debugElement.query(By.css('.btn-edit'));
    btnEdit.nativeElement.click();

    expect(component.editar.emit).toHaveBeenCalledWith(DATA_TEST[0]);
  });
});