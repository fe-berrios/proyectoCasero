//Instancia una sola vez el cliente de supabase
import { createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import type { SupabaseClient } from '@supabase/supabase-js';

export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl,
  environment.supabaseKey
);