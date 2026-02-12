import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../../services/toast.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [ToastService]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display toasts from service', () => {
    toastService.success('Success message');
    toastService.error('Error message');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const toastElements = compiled.querySelectorAll('.toast');

    expect(toastElements.length).toBe(2);
  });

  it('should display toast with correct type class', () => {
    toastService.success('Success');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const toast = compiled.querySelector('.toast');

    expect(toast?.classList.contains('toast-success')).toBeTrue();
  });

  it('should display different toast types correctly', () => {
    toastService.success('Success');
    toastService.error('Error');
    toastService.warning('Warning');
    toastService.info('Info');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const successToast = compiled.querySelector('.toast-success');
    const errorToast = compiled.querySelector('.toast-error');
    const warningToast = compiled.querySelector('.toast-warning');
    const infoToast = compiled.querySelector('.toast-info');

    expect(successToast).toBeTruthy();
    expect(errorToast).toBeTruthy();
    expect(warningToast).toBeTruthy();
    expect(infoToast).toBeTruthy();
  });

  it('should call remove when close button is clicked', () => {
    spyOn(toastService, 'remove');

    toastService.info('Test message');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const closeButton = compiled.querySelector('.toast-close') as HTMLButtonElement;

    expect(closeButton).toBeTruthy();

    const toastId = toastService.toasts()[0].id;
    closeButton.click();

    expect(toastService.remove).toHaveBeenCalledWith(toastId);
  });

  it('should remove toasts after 3 seconds', fakeAsync(() => {
    toastService.success('Auto remove');
    fixture.detectChanges();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.toast').length).toBe(1);

    tick(3000);
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.toast').length).toBe(0);
  }));

  it('should handle empty toast list', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const toastContainer = compiled.querySelector('.toast-container');

    expect(toastContainer).toBeTruthy();
    expect(toastContainer?.children.length).toBe(0);
  });
});
