import { Component, inject, signal, computed, effect } from '@angular/core';
import { MainLayout } from '@shared/layouts/main-layout/main-layout.component';
import { AttendanceService } from '@core/services/attendance.service';
import { GroupService } from '@core/services/group.service';
import { AttendanceReportItem } from '@core/models/attendance-report.model';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { LucideAngularModule, Search, Users, ArrowLeft, Download, AlertTriangle, Calendar, Clock } from 'lucide-angular';

@Component({
  selector: 'app-reports',
  imports: [
    MainLayout,
    DatePickerModule,
    FormsModule,
    InputTextModule,
    LucideAngularModule,
    RouterLink
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export default class ReportsComponent {
  private attendanceService = inject(AttendanceService);
  private groupService = inject(GroupService);

  // Icons
  readonly SearchIcon = Search;
  readonly UsersIcon = Users;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly DownloadIcon = Download;
  readonly AlertIcon = AlertTriangle;
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;

  // State
  startDate = signal<Date>(this.getOneMonthAgo());
  endDate = signal<Date>(new Date());
  selectedGroupId = signal<number | null>(null);
  searchQuery = signal<string>('');
  reportData = signal<AttendanceReportItem[]>([]);
  isLoading = signal<boolean>(false);

  // Groups from service
  readonly groups = this.groupService.groups;

  // Filtered members based on search query
  filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const data = this.reportData();
    if (!query) return data;
    return data.filter(m => m.full_name.toLowerCase().includes(query));
  });

  // Total count (Only members with attendance > 0)
  totalCount = computed(() => {
    const data = this.reportData();
    return data.filter(m => m.attendance_count > 0).length;
  });

  // Count by group (Only members with attendance > 0)
  countByGroup = computed(() => {
    const data = this.reportData();
    const groups = this.groups();
    const counts: { [key: string]: number } = {};
    
    groups.forEach(g => {
      counts[g.name] = data.filter(m => m.group_name === g.name && m.attendance_count > 0).length;
    });
    
    return counts;
  });

  // Alert count
  alertCount = computed(() => {
    return this.reportData().filter(m => m.needs_alert).length;
  });

  // Selected group name
  selectedGroupName = computed(() => {
    const id = this.selectedGroupId();
    if (!id) return null;
    return this.groups().find(g => g.id === id)?.name ?? null;
  });

  constructor() {
    // Load report when dates or group filter changes
    effect(() => {
      const start = this.startDate();
      const end = this.endDate();
      const groupId = this.selectedGroupId();
      this.loadReport(start, end, groupId ?? undefined);
    });
  }

  private getOneMonthAgo(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async loadReport(start: Date, end: Date, groupId?: number): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.attendanceService.getAttendanceReport(
        this.formatDate(start),
        this.formatDate(end),
        groupId
      );
      this.reportData.set(data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectGroup(groupId: number | null): void {
    this.selectedGroupId.set(groupId);
  }

  onStartDateChange(date: Date): void {
    this.startDate.set(date);
  }

  onEndDateChange(date: Date): void {
    this.endDate.set(date);
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
   * Format date for display
   */
  formatDisplayDate(dateStr: string | null): string {
    if (!dateStr) return 'Sin registro';
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('es-ES', options);
  }
}
