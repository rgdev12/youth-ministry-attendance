import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DashboardStats } from '@core/models/statistics.model';

@Injectable({
  providedIn: 'root'
})

export class StatisticsService {
  private supabase = inject(SupabaseService);
  /**
   * Get attendance statistics by group for a date range
   * @param startDate Start date in YYYY-MM-DD format
   * @param endDate End date in YYYY-MM-DD format
   */
  async getDashboardStats(
    startDate: string,
    endDate: string
  ): Promise<DashboardStats> {
    const { data, error } = await this.supabase.client.rpc('get_dashboard_stats', {
      start_date: startDate,
      end_date: endDate
    });

    if (error) {
      throw error;
    }

    return data || {};
  } 
}