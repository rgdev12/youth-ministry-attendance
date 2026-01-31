import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, LogOut, User, Calendar, ChevronRight } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { MainLayout } from '@shared/layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, MainLayout],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export default class DashboardComponent {
  // Lista de saludos
  private greetings = [
    'Bienvenido',
    'Hola 👋🏻',
    '¡Ey! 👋🏻',
    'Qué hay 👋🏻'
  ];

  private authService = inject(AuthService);

  // Icons
  readonly UsersIcon = Users;
  readonly LogOutIcon = LogOut;
  readonly UserIcon = User;
  readonly CalendarIcon = Calendar;
  readonly ChevronRightIcon = ChevronRight;

  // State from auth service
  readonly profile = this.authService.profile;

  async signOut() {
    await this.authService.signOut();
  }

  get greeting() {
    return this.greetings[Math.floor(Math.random() * this.greetings.length)];
  }
}
