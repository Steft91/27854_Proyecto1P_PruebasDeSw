import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { UserInfo } from '../models';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setUser and getCurrentUser', () => {
    it('should store user info in localStorage and retrieve it', () => {
      const mockUser: UserInfo = {
        id: '123',
        username: 'testuser',
        email: 'test@test.com',
        rol: 'cliente'
      };

      service.setUser(mockUser);

      const storedUser = service.getCurrentUser();
      expect(storedUser).toEqual(mockUser);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    it('should return null if no user is stored', () => {
      const user = service.getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return null if stored user JSON is invalid', () => {
      localStorage.setItem('user', 'invalid-json{');
      const user = service.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('getUserRole', () => {
    it('should return the role of the current user', () => {
      const mockUser: UserInfo = {
        id: '123',
        username: 'admin',
        email: 'admin@test.com',
        rol: 'administrador'
      };

      service.setUser(mockUser);
      expect(service.getUserRole()).toBe('administrador');
    });

    it('should return null if no user is stored', () => {
      expect(service.getUserRole()).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('should return true if user has one of the specified roles', () => {
      const mockUser: UserInfo = {
        id: '123',
        username: 'employee',
        email: 'emp@test.com',
        rol: 'empleado'
      };

      service.setUser(mockUser);
      expect(service.hasRole(['administrador', 'empleado'])).toBeTrue();
      expect(service.hasRole(['empleado'])).toBeTrue();
    });

    it('should return false if user does not have any of the specified roles', () => {
      const mockUser: UserInfo = {
        id: '123',
        username: 'client',
        email: 'client@test.com',
        rol: 'cliente'
      };

      service.setUser(mockUser);
      expect(service.hasRole(['administrador', 'empleado'])).toBeFalse();
    });

    it('should return false if no user is stored', () => {
      expect(service.hasRole(['administrador'])).toBeFalse();
    });
  });

  describe('clearUser', () => {
    it('should remove user from localStorage', () => {
      const mockUser: UserInfo = {
        id: '123',
        username: 'test',
        email: 'test@test.com',
        rol: 'cliente'
      };

      service.setUser(mockUser);
      expect(localStorage.getItem('user')).toBeTruthy();

      service.clearUser();
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('currentUser signal', () => {
    it('should emit current user when user is set', () => {
      const mockUser: UserInfo = {
        id: '123',
        username: 'test',
        email: 'test@test.com',
        rol: 'administrador'
      };

      service.setUser(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
    });

    it('should emit null after clearUser is called', () => {
      const mockUser: UserInfo = {
        id: '123',
        username: 'test',
        email: 'test@test.com',
        rol: 'cliente'
      };

      service.setUser(mockUser);
      expect(service.currentUser()).toEqual(mockUser);

      service.clearUser();
      expect(service.currentUser()).toBeNull();
    });
  });
});
