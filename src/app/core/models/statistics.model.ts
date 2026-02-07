export interface DashboardStats {
  summary: {
    total_attendance: number;
    attendance_jovenes: number;
    attendance_prejovenes: number;
  };
  by_gender: {
    M: number;
    F: number;
  };
  timeline: {
    date: string;
    jovenes_count: number;
    prejovenes_count: number;
  }[];
}