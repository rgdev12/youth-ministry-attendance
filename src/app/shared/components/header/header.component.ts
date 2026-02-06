import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, CircleUserRound , Lock, FileText, BarChart3, LogOut } from 'lucide-angular';
import { AuthService } from '@core/services/auth.service';
import { Popover } from 'primeng/popover';

@Component({
  selector: 'app-header',
  imports: [LucideAngularModule, RouterLink, Popover],
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

  async logout(): Promise<void> {
    await this.authService.signOut();
  }
}
