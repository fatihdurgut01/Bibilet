import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

// Cookie-based storage — session middleware tarafından da okunabilir
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
