export interface AttendanceReportItem {
  member_id: number;
  full_name: string;
  gender: 'M' | 'F';
  group_name: string;
  attendance_count: number;
  last_attendance: string | null;
  needs_alert: boolean;
}
