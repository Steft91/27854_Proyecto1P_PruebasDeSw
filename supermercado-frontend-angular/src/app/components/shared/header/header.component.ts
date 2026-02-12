import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() userName: string = '';
  @Input() userRole: string = '';
  @Output() logout = new EventEmitter<void>();

  onLogout() {
    this.logout.emit();
  }

  getRoleBadgeClass(): string {
    const roleClasses: Record<string, string> = {
      'administrador': 'badge-admin',
      'empleado': 'badge-empleado',
      'cliente': 'badge-cliente'
    };
    return roleClasses[this.userRole] || 'badge-default';
  }

  getRoleDisplayName(): string {
    const roleNames: Record<string, string> = {
      'administrador': 'Administrador',
      'empleado': 'Empleado',
      'cliente': 'Cliente'
    };
    return roleNames[this.userRole] || this.userRole;
  }
}
