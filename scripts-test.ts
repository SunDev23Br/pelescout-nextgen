import { createClient } from '@supabase/supabase-js';
const s = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!);
for (const [email, pw] of [['admin@gmail.com','admin123'],['flamengo@gmail.com','flamengo123']]) {
  const { data, error } = await s.auth.signInWithPassword({ email, password: pw });
  console.log(email, 'err:', error?.message, 'uid:', data?.user?.id);
  if (data?.user) {
    const { data: roles, error: re } = await s.from('user_roles').select('role').eq('user_id', data.user.id);
    console.log(' roles:', JSON.stringify(roles), 'err:', re?.message);
    await s.auth.signOut();
  }
}
