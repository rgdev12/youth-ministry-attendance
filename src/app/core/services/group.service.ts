import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Group } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private supabase = inject(SupabaseService);

  async getGroups(): Promise<Group[]> {
    const { data, error } = await this.supabase.client
      .from('groups')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    return data || [];
  }

  async getGroupById(id: string): Promise<Group | null> {
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
