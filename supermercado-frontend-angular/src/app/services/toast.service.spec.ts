import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService]
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate unique IDs for each toast', () => {
    service.success('Message 1');
    service.info('Message 2');

    const toasts = service.toasts();
    expect(toasts.length).toBe(2);
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });

  describe('success', () => {
    it('should add a success toast', () => {
      service.success('Operation successful');

      const toasts = service.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('Operation successful');
    });
  });

  describe('error', () => {
    it('should add an error toast', () => {
      service.error('Operation failed');

      const toasts = service.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('error');
      expect(toasts[0].message).toBe('Operation failed');
    });
  });

  describe('warning', () => {
    it('should add a warning toast', () => {
      service.warning('Warning message');

      const toasts = service.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('warning');
      expect(toasts[0].message).toBe('Warning message');
    });
  });

  describe('info', () => {
    it('should add an info toast', () => {
      service.info('Info message');

      const toasts = service.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('info');
      expect(toasts[0].message).toBe('Info message');
    });
  });

  describe('remove', () => {
    it('should remove a toast by ID', () => {
      service.success('Message 1');
      service.info('Message 2');

      const toasts = service.toasts();
      expect(toasts.length).toBe(2);

      const idToRemove = toasts[0].id;
      service.remove(idToRemove);

      const remainingToasts = service.toasts();
      expect(remainingToasts.length).toBe(1);
      expect(remainingToasts[0].id).not.toBe(idToRemove);
    });

    it('should do nothing if ID does not exist', () => {
      service.success('Message 1');

      expect(service.toasts().length).toBe(1);

      service.remove(999);

      expect(service.toasts().length).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all toasts', () => {
      service.success('Message 1');
      service.error('Message 2');
      service.warning('Message 3');

      expect(service.toasts().length).toBe(3);

      service.clear();

      expect(service.toasts().length).toBe(0);
    });
  });

  describe('multiple toasts', () => {
    it('should handle multiple toasts simultaneously', fakeAsync(() => {
      service.success('Success 1'); // t=0, removes at t=3000
      tick(500);
      service.error('Error 1'); // t=500, removes at t=5500 (500 + 5000)
      tick(500);
      service.warning('Warning 1'); // t=1000, removes at t=5000 (1000 + 4000)

      expect(service.toasts().length).toBe(3);

      tick(2000); // t=3000 - Success removed

      expect(service.toasts().length).toBe(2);

      tick(2000); // t=5000 - Warning removed

      expect(service.toasts().length).toBe(1);

      tick(500); // t=5500 - Error removed

      expect(service.toasts().length).toBe(0);
    }));
  });
});
