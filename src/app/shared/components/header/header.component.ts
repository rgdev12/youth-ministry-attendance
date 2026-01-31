import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, CircleUserRound , Lock, FileText, BarChart3, LogOut } from 'lucide-angular';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [LucideAngularModule, RouterLink],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class Header {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Icons
  UserIcon = CircleUserRound;
  LockIcon = Lock;
  FileTextIcon = FileText;
  BarChartIcon = BarChart3;
  LogOutIcon = LogOut;

  // Menu state
  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  async logout(): Promise<void> {
    this.closeMenu();
    await this.authService.signOut();
    this.router.navigate(['/auth/login']);
  }
}
