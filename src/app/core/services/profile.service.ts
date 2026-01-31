import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Profile } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private supabaseService = inject(SupabaseService);

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }

    return data as Profile;
  }
}
