import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // In dev, this helps catch misconfiguration early.
  // In production, you may want to handle this differently.
  // eslint-disable-next-line no-console
  console.warn('Supabase environment variables are not set.');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

