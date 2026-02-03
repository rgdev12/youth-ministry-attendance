import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Attendance } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private supabase = inject(SupabaseService);

  /**
   * Get attendances for a specific date and group
   */
  async getAttendancesByDateAndGroup(date: string, groupId: number): Promise<Attendance[]> {
    const { data, error } = await this.supabase.client
      .from('attendance')
      .select('*')
      .eq('date', date)
      .eq('group_id', groupId);

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Save attendance records using the bulk_take_attendance RPC function
   * @param memberIds Array of member IDs that are present
   * @param date Attendance date in YYYY-MM-DD format
   * @param groupId Group ID
   */
  async bulkTakeAttendance(memberIds: number[], date: string, groupId: number): Promise<void> {
    const { error } = await this.supabase.client.rpc('bulk_take_attendance', {
      member_ids: memberIds,
      attendance_date: date,
      group_id_param: groupId
    });

    if (error) {
      throw error;
    }
  }
}
