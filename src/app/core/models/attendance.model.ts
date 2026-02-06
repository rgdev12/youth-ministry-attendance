export interface Attendance {
  id?: number;
  member_id: number;
  date: string;
  group_id: number;
  created_by?: string;
  created_at?: string;
}

export interface AttendanceReportItem {
  member_id: number;
  full_name: string;
  gender: 'M' | 'F';
  group_name: string;
  attendance_count: number;
  last_attendance: string | null;
  needs_alert: boolean;
}