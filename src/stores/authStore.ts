import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  initialized: boolean;
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => Promise<void>;
  // Role helpers
  isOwner: () => boolean;
  isManager: () => boolean;
  isStaff: () => boolean;
  hasRole: (roles: Array<'owner' | 'manager' | 'staff'>) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  initialized: false,

  // Role helpers
  isOwner: () => get().profile?.role === 'owner',
  isManager: () => get().profile?.role === 'manager',
  isStaff: () => get().profile?.role === 'staff',
  hasRole: (roles) => {
    const userRole = get().profile?.role;
    return userRole ? roles.includes(userRole) : false;
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user });
        await get().fetchProfile();
      }
      set({ initialized: true });
    } catch (error) {
      console.error('Initialize error:', error);
      set({ initialized: true });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (session?.user) {
        set({ user: session.user });
        await get().fetchProfile();
      } else {
        set({ user: null, profile: null });
      }
    });
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Fetch profile error:', error);
        return;
      }

      if (data) {
        const profile: Profile = {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: data.role as 'owner' | 'manager' | 'staff',
          managerType: data.manager_type,
          avatarUrl: data.avatar_url,
          phone: data.phone,
          hireDate: data.hire_date,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        set({ profile });
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  },

  signIn: async (email: string, password: string) => {
    console.log('Starting signIn with:', email);
    set({ isLoading: true });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase signIn response:', { data, error });

      if (error) {
        console.error('SignIn error:', error);
        set({ isLoading: false });
        throw error;
      }

      if (data.user) {
        set({ user: data.user });
        await get().fetchProfile();
      }

      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, fullName: string, role: string) => {
    console.log('Starting signUp with:', email);
    set({ isLoading: true });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      console.log('Supabase signUp response:', { data, error });

      if (error) {
        console.error('SignUp error:', error);
        set({ isLoading: false });
        throw error;
      }

      if (data.user) {
        set({ user: data.user });
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        await get().fetchProfile();
      }

      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('SignOut error:', error);
        throw error;
      }
      set({ user: null, profile: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
