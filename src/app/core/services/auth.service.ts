import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { ProfileService } from './profile.service';
import { Profile } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  // Signals for reactive state
  private _user = signal<User | null>(null);
  private _profile = signal<Profile | null>(null);
  private _session = signal<Session | null>(null);
  private _loading = signal<boolean>(true);

  // Public computed values
  readonly user = this._user.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly session = this._session.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._session());

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Get initial session
    const { data: { session } } = await this.supabaseService.auth.getSession();
    
    if (session) {
      this._session.set(session);
      this._user.set(session.user);
      await this.loadProfile(session.user.id);
    }
    
    this._loading.set(false);

    // Listen for auth changes
    this.supabaseService.onAuthStateChange(async (event, session) => {
      this._session.set(session);
      this._user.set(session?.user ?? null);

      if (event === 'SIGNED_IN' && session) {
        await this.loadProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        this._profile.set(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token was refreshed automatically by Supabase
        console.log('Token refreshed successfully');
      }
    });
  }

  private async loadProfile(userId: string) {
    const profile = await this.profileService.getProfile(userId);
    this._profile.set(profile);
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    const { data, error } = await this.supabaseService.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { error: error.message };
    }

    if (data.session) {
      this._session.set(data.session);
      this._user.set(data.user);
      await this.loadProfile(data.user.id);
    }

    return { error: null };
  }

  async signUp(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await this.supabaseService.auth.signUp({
      email,
      password
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  }

  async signOut(): Promise<void> {
    await this.supabaseService.auth.signOut();
    this._session.set(null);
    this._user.set(null);
    this._profile.set(null);
    this.router.navigate(['/login']);
  }

  async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await this.supabaseService.auth.getSession();
    return session?.access_token ?? null;
  }
}
