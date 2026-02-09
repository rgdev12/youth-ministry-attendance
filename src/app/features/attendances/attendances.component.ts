import { Component, ElementRef, inject, input, numberAttribute, signal, ViewChild } from '@angular/core';
import { MainLayout } from '@shared/layouts/main-layout/main-layout.component';
import { MemberService } from '@core/services/member.service';
import { AttendanceService } from '@core/services/attendance.service';
import { DatePickerModule } from 'primeng/datepicker';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { computed, effect } from '@angular/core';
import { GroupService } from '@core/services/group.service';
import { InputTextModule } from 'primeng/inputtext';
import { LucideAngularModule, Search, Users, UserPlus, ArrowLeft, Save, LoaderCircle, X } from 'lucide-angular';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Member } from '@core/models/member.model';
import { Dialog } from 'primeng/dialog';
import { NewMemberFormComponent } from '@shared/components/new-member-form/new-member-form.component';
import { MessageService } from 'primeng/api';

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
    NewMemberFormComponent,
    RouterLink
  ],
  templateUrl: './attendances.component.html',
  styleUrl: './attendances.component.scss',
})
export default class Attendances {
  private memberService = inject(MemberService);
  private attendanceService = inject(AttendanceService);
  private groupService = inject(GroupService);
  private messageService = inject(MessageService);

  groupId = input.required<number, string | number>({ 
    alias: 'group',
    transform: numberAttribute 
  });
  
  selectedDate = signal<Date>(new Date());
  searchQuery = signal<string>('');
  isNewMemberModalOpen = false;
  isSaving = signal<boolean>(false);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Auxiliary variable: tracks member IDs that user manually marked as present
  // Persists across date changes, cleared only when attendance is saved
  private manuallyMarkedMembers = new Set<number>();

  // Icons
  readonly SearchIcon = Search;
  readonly UsersIcon = Users;
  readonly UserPlusIcon = UserPlus;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly SaveIcon = Save;
  readonly LoaderCircleIcon = LoaderCircle;
  readonly XIcon = X;

  // Members with attendance status
  members = signal<MemberAttendance[]>([]);

  group = computed(() => {
    return this.groupService.groups().find(g => g.id === this.groupId());
  });

  // Filtered members based on search query
  filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
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
    // Load members and their attendance status when groupId or selectedDate changes
    effect(() => {
      const groupId = this.groupId();
      const date = this.selectedDate();
      this.loadMembersWithAttendance(groupId, date);
    });
  }

  /**
   * Load members and mark those with existing attendance for the selected date.
   * Also marks members that were manually marked by the user (persists across date changes).
   */
  private async loadMembersWithAttendance(groupId: number, date: Date): Promise<void> {
    const dateStr = this.formatDate(date);
    
    const [members, attendances] = await Promise.all([
      this.memberService.getMembersByGroup(groupId),
      this.attendanceService.getAttendancesByDateAndGroup(dateStr, groupId)
    ]);

    // Create a Set of member IDs that have attendance in DB for this date
    const savedPresentMemberIds = new Set(attendances.map(a => a.member_id));

    // Map members with their attendance status
    // A member is marked as present if:
    // 1. They have saved attendance in DB for this date, OR
    // 2. They were manually marked by the user (auxiliary variable)
    this.members.set(members.map(m => ({
      ...m,
      isPresent: savedPresentMemberIds.has(m.id!) || this.manuallyMarkedMembers.has(m.id!)
    })));
  }

  /**
   * Format date to YYYY-MM-DD string for database queries
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get initials from a member's name
   */
  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0]?.substring(0, 2).toUpperCase() || '';
  }

  /**
   * Toggle attendance for a specific member.
   * If user was searching, maintains focus on search input after toggle.
   * Updates the auxiliary variable to track manual marks.
   */
  toggleAttendance(memberId: number | undefined): void {
    if (!memberId) return;
    
    const wasSearching = this.searchQuery().trim().length > 0;
    const member = this.members().find(m => m.id === memberId);
    
    if (member) {
      if (member.isPresent) {
        this.manuallyMarkedMembers.delete(memberId); // Unmarking: remove from manually marked set
      } else {
        this.manuallyMarkedMembers.add(memberId); // Marking: add to manually marked set
      }
    }
    
    this.members.update(members => 
      members.map(m => m.id === memberId ? { ...m, isPresent: !m.isPresent } : m)
    );
    
    // Restore focus to search input if user was searching
    if (wasSearching && this.searchInput?.nativeElement) {
      // Use setTimeout to ensure focus is restored after the click event completes
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 0);
    }
  }

  /**
   * Save attendance records using the bulk_take_attendance RPC function
   */
  async saveAttendance(): Promise<void> {
    if (this.isSaving()) return;

    const presentMemberIds = this.members()
      .filter(m => m.isPresent && m.id)
      .map(m => m.id!);

    const dateStr = this.formatDate(this.selectedDate());
    const groupId = this.groupId();

    this.isSaving.set(true);

    try {
      await this.attendanceService.bulkTakeAttendance(presentMemberIds, dateStr, groupId);
      
      this.manuallyMarkedMembers.clear();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `Asistencia guardada: ${presentMemberIds.length} presentes`,
        life: 3000
      });
    } catch (error) {
      console.error('Error saving attendance:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar la asistencia',
        life: 5000
      });
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Handle date change from datepicker
   */
  onDateChange(date: Date): void {
    this.selectedDate.set(date);
  }

  openNewMemberModal(): void {
    this.isNewMemberModalOpen = true;
  }

  closeNewMemberModal(): void {
    this.isNewMemberModalOpen = false;
  }

  onMemberSaved(member: Member): void {
    this.closeNewMemberModal();
    this.loadMembersWithAttendance(this.groupId(), this.selectedDate());
  }
}
