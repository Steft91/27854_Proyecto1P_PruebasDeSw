import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';
import { By } from '@angular/platform-browser';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('NO debe mostrarse en el DOM por defecto (isOpen = false)', () => {
    const modalOverlay = fixture.debugElement.query(By.css('.modal-overlay'));
    expect(modalOverlay).toBeNull();
  });

  it('Debe mostrarse en el DOM cuando isOpen es true', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const modalOverlay = fixture.debugElement.query(By.css('.modal-overlay'));
    expect(modalOverlay).toBeTruthy();
  });

  it('Debe mostrar título y mensaje por defecto si no se proporcionan', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const title = fixture.debugElement.query(By.css('h3')).nativeElement;
    const message = fixture.debugElement.query(By.css('.modal-body p')).nativeElement;

    expect(title.textContent).toContain('Confirmar eliminación');
    expect(message.textContent).toContain('¿Está seguro de que desea eliminar este elemento?');
  });

  it('Debe mostrar título, mensaje e itemName personalizados', () => {
    component.isOpen = true;
    component.title = 'Borrar Usuario';
    component.message = 'Esta acción no se puede deshacer';
    component.itemName = 'Juan Perez';
    fixture.detectChanges();

    const title = fixture.debugElement.query(By.css('h3')).nativeElement;
    const bodyParagraphs = fixture.debugElement.queryAll(By.css('.modal-body p'));
    const itemNameEl = fixture.debugElement.query(By.css('.item-name')).nativeElement;

    expect(title.textContent).toContain('Borrar Usuario');
    expect(bodyParagraphs[0].nativeElement.textContent).toContain('Esta acción no se puede deshacer');
    expect(itemNameEl.textContent).toContain('Juan Perez');
  });

  it('NO debe renderizar el elemento item-name si itemName es undefined', () => {
    component.isOpen = true;
    component.itemName = undefined;
    fixture.detectChanges();

    const itemNameEl = fixture.debugElement.query(By.css('.item-name'));
    expect(itemNameEl).toBeNull();
  });

  it('Debe emitir evento CONFIRM al hacer clic en el botón Eliminar', () => {
    spyOn(component.confirm, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const deleteBtn = fixture.debugElement.query(By.css('.btn-danger'));
    deleteBtn.triggerEventHandler('click', null);

    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('Debe emitir evento CANCEL al hacer clic en el botón Cancelar', () => {
    spyOn(component.cancel, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const cancelBtn = fixture.debugElement.query(By.css('.btn-secondary'));
    cancelBtn.triggerEventHandler('click', null);

    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('Debe emitir evento CANCEL al hacer clic en la "X" (cerrar)', () => {
    spyOn(component.cancel, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const closeBtn = fixture.debugElement.query(By.css('.close-btn'));
    closeBtn.triggerEventHandler('click', null);

    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('Debe cerrar (cancelar) al hacer clic en el fondo oscuro (overlay)', () => {
    spyOn(component.cancel, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
    overlay.triggerEventHandler('click', null);

    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('NO debe cerrar al hacer clic dentro del contenido del modal (stopPropagation)', () => {
    spyOn(component.cancel, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const modalContent = fixture.debugElement.query(By.css('.modal-content'));

    const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') };
    modalContent.triggerEventHandler('click', mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.cancel.emit).not.toHaveBeenCalled();
  });
});
