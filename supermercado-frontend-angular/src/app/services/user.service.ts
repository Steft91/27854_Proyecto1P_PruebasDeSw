import { Injectable, signal, computed } from '@angular/core';
import { UserInfo } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_STORAGE_KEY = 'user_info';

  // Signal privado para el estado del usuario
  private userSignal = signal<UserInfo | null>(this.loadUserFromStorage());

  // Signal público de solo lectura
  currentUser = this.userSignal.asReadonly();

  // Computed signal para verificar si hay usuario autenticado
  isAuthenticated = computed(() => this.currentUser() !== null);

  constructor() {
    // Inicializar desde localStorage al crear el servicio
    const storedUser = this.loadUserFromStorage();
    if (storedUser) {
      this.userSignal.set(storedUser);
    }
  }

  /**
   * Almacena la información del usuario en el estado y localStorage
   */
  setUser(user: UserInfo): void {
    this.userSignal.set(user);
    localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * Obtiene el usuario actual (snapshot)
   */
  getCurrentUser(): UserInfo | null {
    return this.currentUser();
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.rol : null;
  }

  /**
   * Verifica si el usuario tiene uno de los roles permitidos
   */
  hasRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole !== null && roles.includes(userRole);
  }

  /**
   * Limpia toda la información del usuario
   */
  clearUser(): void {
    this.userSignal.set(null);
    localStorage.removeItem(this.USER_STORAGE_KEY);
  }

  /**
   * Carga el usuario desde localStorage
   */
  private loadUserFromStorage(): UserInfo | null {
    try {
      const stored = localStorage.getItem(this.USER_STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const user = JSON.parse(stored) as UserInfo;

      // Validar que tenga las propiedades necesarias
      if (user && user.id && user.username && user.email && user.rol) {
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error loading user from storage:', error);
      // Si hay error al parsear, limpiar el storage corrupto
      localStorage.removeItem(this.USER_STORAGE_KEY);
      return null;
    }
  }
}
