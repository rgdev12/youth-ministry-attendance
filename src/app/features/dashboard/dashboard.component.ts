import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, LogOut, User, Calendar, ChevronRight, UserPlus } from 'lucide-angular';
import { AuthService } from '@core/services/auth.service';
import { MainLayout } from '@shared/layouts/main-layout/main-layout.component';
import { Dialog } from 'primeng/dialog';
import { NewMemberFormComponent } from '@shared/components/new-member-form/new-member-form.component';
import { GroupService } from '@core/services/group.service';
import { Member } from '@core/models/member.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, MainLayout, Dialog, NewMemberFormComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export default class DashboardComponent {
  private authService = inject(AuthService);
  private groupService = inject(GroupService);

  // Icons
  readonly UsersIcon = Users;
  readonly LogOutIcon = LogOut;
  readonly UserIcon = User;
  readonly CalendarIcon = Calendar;
  readonly ChevronRightIcon = ChevronRight;
  readonly UserPlusIcon = UserPlus;
  readonly groups = this.groupService.groups;

  // State from auth service
  readonly profile = this.authService.profile;

  // Modal state
  isNewMemberModalOpen = false;

  constructor(private router: Router) {}

  async signOut() {
    await this.authService.signOut();
  }

  openNewMemberModal(): void {
    this.isNewMemberModalOpen = true;
  }

  closeNewMemberModal(): void {
    this.isNewMemberModalOpen = false;
  }

  onMemberSaved(member: Member): void {
    console.log('Nuevo miembro creado:', member);
    this.closeNewMemberModal();
    // TODO: Show success notification or refresh member list
  }

  goToAttendances(group: number): void {
    this.router.navigate(['/attendances', group]);
  }
}
