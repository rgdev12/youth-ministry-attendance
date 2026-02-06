import { Component, inject, signal, computed, effect } from '@angular/core';
import { MainLayout } from '@shared/layouts/main-layout/main-layout.component';
import { AttendanceService } from '@core/services/attendance.service';
import { GroupService } from '@core/services/group.service';
import { AttendanceReportItem } from '@core/models/attendance.model';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { LucideAngularModule, Search, Users, ArrowLeft, Download, AlertTriangle, Calendar, Clock, Sheet } from 'lucide-angular';

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
  readonly SheetIcon = Sheet;

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

  /**
   * Download report as Excel file
   */
  async downloadReport(): Promise<void> {
    const ExcelJS = await import('exceljs');
    const { saveAs } = await import('file-saver');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Youth Ministry Attendance';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Reporte de Asistencia');

    // Title row
    const startDateStr = this.formatDate(this.startDate());
    const endDateStr = this.formatDate(this.endDate());
    const groupName = this.selectedGroupName() || 'Todos los grupos';
    
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `Reporte de Asistencia - ${groupName}`;
    titleCell.font = { bold: true, size: 16, color: { argb: 'FF2C50A5' } };
    titleCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:E2');
    const dateRangeCell = worksheet.getCell('A2');
    dateRangeCell.value = `Período: ${startDateStr} al ${endDateStr}`;
    dateRangeCell.font = { size: 11, color: { argb: 'FF666666' } };
    dateRangeCell.alignment = { horizontal: 'center' };

    // Empty row
    worksheet.addRow([]);

    // Headers
    const headerRow = worksheet.addRow([
      'Nombre',
      'Género',
      'Grupo',
      'Asistencias',
      'Última Asistencia'
    ]);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2C50A5' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Data rows
    const data = this.filteredMembers();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    data.forEach((member) => {
      const lastAttendanceDate = member.last_attendance ? new Date(member.last_attendance) : null;
      const isAbsentTwoWeeks = !lastAttendanceDate || lastAttendanceDate < twoWeeksAgo;

      const row = worksheet.addRow([
        member.full_name,
        member.gender === 'M' ? 'Masculino' : 'Femenino',
        member.group_name,
        member.attendance_count,
        member.last_attendance ? this.formatDisplayDate(member.last_attendance) : 'Sin registro'
      ]);

      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
        
        // Highlight 'Última Asistencia' in red if absent for 2+ weeks
        if (colNumber === 5 && isAbsentTwoWeeks) {
          cell.font = { bold: true, color: { argb: 'FFDC2626' } };
        }
        
        // Center numeric and short columns
        if (colNumber >= 2) {
          cell.alignment = { horizontal: 'center' };
        }
      });
    });

    // Empty row before summary
    worksheet.addRow([]);

    // Summary section
    const summaryHeaderRow = worksheet.addRow(['Resumen']);
    summaryHeaderRow.getCell(1).font = { bold: true, size: 12 };

    worksheet.addRow(['Total de miembros:', data.length]);
    worksheet.addRow(['Con asistencia:', data.filter(m => m.attendance_count > 0).length]);

    // Set column widths
    worksheet.columns = [
      { width: 30 }, // Nombre
      { width: 12 }, // Género
      { width: 15 }, // Grupo
      { width: 12 }, // Asistencias
      { width: 18 }  // Última Asistencia
    ];

    // Generate file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileName = `reporte_asistencia_${startDateStr}_${endDateStr}.xlsx`;
    saveAs(blob, fileName);
  }
}

