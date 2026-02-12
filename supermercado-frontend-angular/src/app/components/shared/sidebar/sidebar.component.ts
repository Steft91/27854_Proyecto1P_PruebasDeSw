import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() navItems: NavItem[] = [];
  @Input() basePath: string = '';

  constructor(public router: Router) {}

  isActive(route: string): boolean {
    const fullPath = `${this.basePath}/${route}`;
    return this.router.url.startsWith(fullPath);
  }
}
