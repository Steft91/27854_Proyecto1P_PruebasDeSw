import { Component, OnInit } from '@angular/core';
/* istanbul ignore file */
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
/* istanbul ignore file */

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent implements OnInit {
  userRole: string | null = null;
  dashboardPath: string = '/login';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.userService.getCurrentUser();

    if (user) {
      this.userRole = user.rol;
      const dashboardPaths: Record<string, string> = {
        administrador: '/admin',
        empleado: '/empleado',
        cliente: '/cliente'
      };

      this.dashboardPath = dashboardPaths[user.rol] || '/login';
    }
  }

  goToDashboard() {
    this.router.navigate([this.dashboardPath]);
  }
}
