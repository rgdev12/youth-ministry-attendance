import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MainLayout } from '@shared/layouts/main-layout/main-layout.component';
import { LucideAngularModule, ArrowLeft, Search, Users, Pencil, Trash2, RotateCcw, TrendingUp } from 'lucide-angular';
import { MemberService } from '@core/services/member.service';
import { GroupService } from '@core/services/group.service';
import { Member } from '@core/models/member.model';
import { Group } from '@core/models/group.model';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { EditMemberFormComponent } from '@shared/components/edit-member-form/edit-member-form.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MainLayout,
    LucideAngularModule,
    Dialog,
    InputTextModule,
    ToggleSwitch,
    EditMemberFormComponent
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export default class MembersComponent implements OnInit {
  // Icons
  readonly ArrowLeftIcon = ArrowLeft;
  readonly SearchIcon = Search;
  readonly UsersIcon = Users;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly RestoreIcon = RotateCcw;
  readonly TrendingUpIcon = TrendingUp;

  // Services
  private memberService = inject(MemberService);
  private groupService = inject(GroupService);
  private messageService = inject(MessageService);

  // State
  members = signal<Member[]>([]);
  searchQuery = signal('');
  selectedGroupId = signal<number | null>(null);
  showInactive = signal(false);
  isLoading = signal(false);
  
  // Modal state
  isEditModalOpen = signal(false);
  selectedMember = signal<Member | null>(null);

  // Groups from service
  readonly groups = this.groupService.groups;

  // Computed: filtered members
  filteredMembers = computed(() => {
    let result = this.members();
    
    // Filter by active status
    if (!this.showInactive()) {
      result = result.filter(m => m.is_active !== false);
    }

    // Filter by group
    const groupId = this.selectedGroupId();
    if (groupId !== null) {
      result = result.filter(m => m.group_id === groupId);
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      result = result.filter(m => m.name.toLowerCase().includes(query));
    }

    return result;
  });

  // Computed: total active members count
  totalMembersCount = computed(() => {
    return this.members().filter(m => m.is_active !== false).length;
  });

  // Computed: new members this month
  newMembersThisMonth = computed(() => {
    const now = new Date();
    const startOfMonthUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);

    return this.members().filter(m => {
      if (!m.created_at || m.is_active === false) return false;

      const createdUTC = new Date(m.created_at).getTime();

      return createdUTC >= startOfMonthUTC;
    }).length;
  });

  // Computed: members by group
  membersByGroup = computed(() => {
    const activeMembers = this.members().filter(m => m.is_active !== false);
    const result: Record<number, number> = {};
    for (const group of this.groups()) {
      result[group.id] = activeMembers.filter(m => m.group_id === group.id).length;
    }
    return result;
  });

  // Computed: gender distribution
  genderDistribution = computed(() => {
    const activeMembers = this.members().filter(m => m.is_active !== false);
    const total = activeMembers.length;
    if (total === 0) return { M: 0, F: 0, malePercent: 50, femalePercent: 50 };
    
    const males = activeMembers.filter(m => m.gender === 'M').length;
    const females = activeMembers.filter(m => m.gender === 'F').length;
    
    return {
      M: males,
      F: females,
      malePercent: Math.round((males / total) * 100),
      femalePercent: Math.round((females / total) * 100)
    };
  });

  async ngOnInit(): Promise<void> {
    await this.loadMembers();
  }

  async loadMembers(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.memberService.getMembers();
      this.members.set(data);
    } catch (error) {
      console.error('Error loading members:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar los miembros'
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  selectGroup(groupId: number | null): void {
    this.selectedGroupId.set(groupId);
  }

  getGroupName(groupId: number): string {
    const group = this.groups().find(g => g.id === groupId);
    return group?.name || '';
  }

  getGroupColor(groupId: number): string {
    const group = this.groups().find(g => g.id === groupId);
    return group?.color || '#6B7280';
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0]?.[0]?.toUpperCase() || '?';
  }

  openEditModal(member: Member): void {
    this.selectedMember.set(member);
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.selectedMember.set(null);
  }

  async onMemberSaved(updatedMember: Member): Promise<void> {
    // Update member in local list
    this.members.update(members => 
      members.map(m => m.id === updatedMember.id ? updatedMember : m)
    );
    this.closeEditModal();
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Miembro actualizado correctamente'
    });
  }

  async deactivateMember(member: Member): Promise<void> {
    if (!member.id) return;
    
    try {
      const updated = await this.memberService.setMemberActive(member.id, false);
      this.members.update(members => 
        members.map(m => m.id === updated.id ? updated : m)
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Miembro desactivado'
      });
    } catch (error) {
      console.error('Error deactivating member:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al desactivar el miembro'
      });
    }
  }

  async reactivateMember(member: Member): Promise<void> {
    if (!member.id) return;
    
    try {
      const updated = await this.memberService.setMemberActive(member.id, true);
      this.members.update(members => 
        members.map(m => m.id === updated.id ? updated : m)
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Miembro reactivado'
      });
    } catch (error) {
      console.error('Error reactivating member:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al reactivar el miembro'
      });
    }
  }
}
