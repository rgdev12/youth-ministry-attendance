export interface DashboardStats {
  summary: {
    total_attendance: number;
    attendance_jovenes: number;
    attendance_prejovenes: number;
    absent_jovenes: number;    // Calculado matemáticamente en BD
    absent_prejovenes: number; // Calculado matemáticamente en BD
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