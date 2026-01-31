import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Member } from '../models/member.model';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private supabase = inject(SupabaseService);

  async createMember(member: Omit<Member, 'id' | 'created_at'>): Promise<Member> {
    const { data, error } = await this.supabase.client
      .from('members')
      .insert(member)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getMembers(): Promise<Member[]> {
    const { data, error } = await this.supabase.client
      .from('members')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    return data || [];
  }

  async getMembersByGroup(groupId: string): Promise<Member[]> {
    const { data, error } = await this.supabase.client
      .from('members')
      .select('*')
      .eq('group_id', groupId)
      .order('name');

    if (error) {
      throw error;
    }

    return data || [];
  }
}
