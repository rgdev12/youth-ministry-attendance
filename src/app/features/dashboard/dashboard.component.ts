import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, LogOut, User, Calendar } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { Header } from '@shared/components/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, Header],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export default class DashboardComponent {
  private authService = inject(AuthService);

  // Icons
  readonly UsersIcon = Users;
  readonly LogOutIcon = LogOut;
  readonly UserIcon = User;
  readonly CalendarIcon = Calendar;

  // State from auth service
  readonly profile = this.authService.profile;

  async signOut() {
    await this.authService.signOut();
  }
}
