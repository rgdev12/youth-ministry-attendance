import { inject, Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Group } from '@core/models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private supabase = inject(SupabaseService);

  // Signals for reactive state
  private _groups = signal<Group[]>([]);
  private _loading = signal<boolean>(true);
  private _initialized = false;

  // Public readonly signals
  readonly groups = this._groups.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {
    this.initializeGroups();
  }

  /**
   * Initialize groups by loading them once from the database
   */
  private async initializeGroups(): Promise<void> {
    if (this._initialized) return;
    
    try {
      const { data, error } = await this.supabase.client
        .from('groups')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading groups:', error);
        return;
      }

      this._groups.set(data || []);
      this._initialized = true;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Force reload groups from the database
   */
  async reloadGroups(): Promise<void> {
    this._loading.set(true);
    this._initialized = false;
    await this.initializeGroups();
  }

  /**
   * Get a group by ID from the cached groups
   */
  getGroupById(id: string): Group | undefined {
    return this._groups().find(group => group.id === id);
  }

  /**
   * Get a group by ID from the database (for cases where fresh data is needed)
   */
  async fetchGroupById(id: string): Promise<Group | null> {
    const { data, error } = await this.supabase.client
      .from('groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
