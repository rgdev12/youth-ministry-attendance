import { Injectable, NgZone, inject } from '@angular/core';
import { createClient, SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private ngZone = inject(NgZone);

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        }
      }
    );

    this.initVisibilityListener();
  }

  // Método que nos ayudará para evitar el error de aplicación congelada al cambiar de pestaña o minimizarla
  private initVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.ngZone.runOutsideAngular(async () => { // Usamos runOutsideAngular para no disparar ciclos de detección innecesarios
          
          if (document.visibilityState === 'hidden') {
            this.supabase.auth.stopAutoRefresh();
          } else if (document.visibilityState === 'visible') {
            this.supabase.auth.startAutoRefresh();
            
            const { data, error } = await this.supabase.auth.getSession();
            if (error) console.log('Error recuperando sesión al volver', error);
          }
        });
      });
    }
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  get auth() {
    return this.supabase.auth;
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}
