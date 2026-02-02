import { Component, inject, input, numberAttribute, signal } from '@angular/core';
import { MainLayout } from '@shared/layouts/main-layout/main-layout.component';
import { MemberService } from '@core/services/member.service';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { computed, effect } from '@angular/core';
import { GroupService } from '@core/services/group.service';
import { InputTextModule } from 'primeng/inputtext';
import { LucideAngularModule, Search, Users, UserPlus } from 'lucide-angular';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Member } from '@core/models/member.model';
import { Dialog } from 'primeng/dialog';
import { NewMemberFormComponent } from '@shared/components/new-member-form/new-member-form.component';

interface MemberAttendance extends Member {
  isPresent: boolean;
}

@Component({
  selector: 'app-attendances',
  imports: [
    MainLayout, 
    DatePickerModule, 
    FormsModule, 
    InputTextModule, 
    LucideAngularModule, 
    ToggleSwitchModule, 
    Dialog, 
    NewMemberFormComponent
  ],
  templateUrl: './attendances.component.html',
  styleUrl: './attendances.component.scss',
})
export default class Attendances {
  private memberService = inject(MemberService);
  private groupService = inject(GroupService);

  groupId = input.required<number, string | number>({ 
    alias: 'group',
    transform: numberAttribute 
  });
  selectedDate: Date = new Date();
  searchQuery: string = '';
  isNewMemberModalOpen = false;

  // Icons
  readonly SearchIcon = Search;
  readonly UsersIcon = Users;
  readonly UserPlusIcon = UserPlus;

  // Members with attendance status
  members = signal<MemberAttendance[]>([]);

  group = computed(() => {
    return this.groupService.groups().find(g => g.id === this.groupId());
  });

  // Filtered members based on search query
  filteredMembers = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.members();
    return this.members().filter(m => m.name.toLowerCase().includes(query));
  });

  // Count of present members
  presentCount = computed(() => {
    return this.members().filter(m => m.isPresent).length;
  });

  // Count of absent members
  absentCount = computed(() => {
    return this.members().filter(m => !m.isPresent).length;
  });

  constructor() {
    effect(() => {
      const id = this.groupId();
      this.memberService.getMembersByGroup(id).then(members => {
        // Initialize all members as absent by default
        this.members.set(members.map(m => ({ ...m, isPresent: false })));
      });
    });
  }

  /**
   * Get initials from a member's name
   * Example: "Román Antonio González" -> "RA"
   * Example: "Román González" -> "RG"
   */
  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0]?.substring(0, 2).toUpperCase() || '';
  }

  /**
   * Toggle attendance for a specific member
   */
  toggleAttendance(memberId: number | undefined): void {
    if (!memberId) return;
    this.members.update(members => 
      members.map(m => m.id === memberId ? { ...m, isPresent: !m.isPresent } : m)
    );
  }

  /**
   * Save attendance records
   */
  saveAttendance(): void {
    const attendanceData = this.members().map(m => ({
      member_id: m.id,
      date: this.selectedDate,
      is_present: m.isPresent
    }));
    console.log('Guardando asistencia:', attendanceData);
    // TODO: Implement actual save logic
  }

  openNewMemberModal(): void {
    this.isNewMemberModalOpen = true;
  }

  closeNewMemberModal(): void {
    this.isNewMemberModalOpen = false;
  }

  onMemberSaved(member: Member): void {
    this.closeNewMemberModal();
    this.memberService.getMembersByGroup(this.groupId()).then(members => {
      this.members.set(members.map(m => ({ ...m, isPresent: false })));
    });
  }
}
