import { supabase } from './supabaseClient';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

class AuthService {
  /**
   * Sign up with Email + Password and optional Display Name
   */
  public async signUp(email: string, password: string, displayName?: string): Promise<{ user: User | null; error: AuthError | null }> {
    const alias = displayName?.trim() || email.split('@')[0];
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: alias,
          name: alias,
          display_name: alias,
        },
      },
    });

    return { user: data.user, error };
  }

  /**
   * Sign in with Email + Password
   */
  public async signInWithEmail(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user: data.user, session: data.session, error };
  }

  /**
   * Sign in with Google OAuth
   */
  public async signInWithGoogle(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    return { error };
  }

  /**
   * Send Password Reset Email
   */
  public async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });

    return { error };
  }

  /**
   * Update password for an authenticated session
   */
  public async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error };
  }

  /**
   * Sign out current user
   */
  public async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  /**
   * Get current authenticated user
   */
  public async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  /**
   * Get current session
   */
  public async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  /**
   * Fetch public user profile from profiles table
   */
  public async getProfile(userId: string): Promise<{ username: string; avatar_url: string | null } | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return data as { username: string; avatar_url: string | null };
    } catch {
      return null;
    }
  }

  /**
   * Subscribe to auth state changes (sign in, sign out, token refresh)
   */
  public onAuthStateChange(callback: (user: User | null, session: Session | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }
}

export const authService = new AuthService();
