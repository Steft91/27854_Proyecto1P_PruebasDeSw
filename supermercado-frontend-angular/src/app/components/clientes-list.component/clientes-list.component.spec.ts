import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientesListComponent } from './clientes-list.component';
import { ClienteService } from '../../services/cliente.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ClientesListComponent', () => {
  let component: ClientesListComponent;
  let fixture: ComponentFixture<ClientesListComponent>;
  let clienteServiceMock: any;

  const MOCK_CLIENTES = [
    { dniClient: '101', nameClient: 'Ana', surnameClient: 'Gomez', addressClient: 'Centro', emailClient: 'ana@g.com' },
    { dniClient: '102', nameClient: 'Luis', surnameClient: 'Diaz', addressClient: 'Sur', emailClient: 'luis@d.com' }
  ];

  beforeEach(async () => {
    clienteServiceMock = jasmine.createSpyObj('ClienteService', ['obtenerTodos', 'eliminar']);
    clienteServiceMock.obtenerTodos.and.returnValue(of(MOCK_CLIENTES));
    clienteServiceMock.eliminar.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ClientesListComponent],
      providers: [{ provide: ClienteService, useValue: clienteServiceMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesListComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); 
  });

  it('should load clients into signal', () => {
    expect(component.clientes().length).toBe(2);
    expect(component.clientes()).toEqual(MOCK_CLIENTES);
  });

  it('should render table rows', () => {
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));

    expect(rows.length).toBe(2);
    expect(rows[0].nativeElement.textContent).toContain('Ana');
    expect(rows[1].nativeElement.textContent).toContain('Luis');
  });

  it('debe abrir el modal de confirmación y preparar los datos al llamar onEliminar', () => {
    const dni = '101';
    const nombre = 'Ana';

    component.onEliminar(dni, nombre);

    expect(component.showDeleteModal).toBeTrue();
    expect(component.clienteToDelete).toEqual({ dni, nombre });
    expect(clienteServiceMock.eliminar).not.toHaveBeenCalled();
  });

  it('debe llamar al servicio eliminar y cerrar el modal al confirmar', () => {
    component.clienteToDelete = { dni: '101', nombre: 'Ana' };
    clienteServiceMock.eliminar.and.returnValue(of({})); 
    component.confirmDelete();

    expect(clienteServiceMock.eliminar).toHaveBeenCalledWith('101');
    expect(component.showDeleteModal).toBeFalse();
    expect(clienteServiceMock.obtenerTodos).toHaveBeenCalled();
  });
});