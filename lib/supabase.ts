import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side client with service role
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Set wallet context for RLS policies
export async function setWalletContext(
  client: ReturnType<typeof createClient<Database>>,
  walletAddress: string
) {
  await (client as any).rpc('set_config', {
    key: 'app.current_wallet',
    value: walletAddress.toLowerCase(),
  });
}
