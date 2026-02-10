import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Member } from '@core/models/member.model';

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

  async getMembersByGroup(groupId: number): Promise<Member[]> {
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

  async updateMember(id: number, member: Partial<Omit<Member, 'id' | 'created_at'>>): Promise<Member> {
    const { data, error } = await this.supabase.client
      .from('members')
      .update(member)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async setMemberActive(id: number, isActive: boolean): Promise<Member> {
    const { data, error } = await this.supabase.client
      .from('members')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
