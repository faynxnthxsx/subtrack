import { NextResponse } from 'next/server';
// 🟢 1. เปลี่ยนมาใช้ createClient แบบปกติจาก supabase-js แทน ssr
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 🟢 2. ตรวจสอบ Security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 🟢 3. Initialize แบบ Server-side (Stateless)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 🟢 4. เคาะประตู Database
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase is awake!', 
      timestamp: new Date().toISOString() 
    });

  } catch (err: any) {
    console.error('Cron Job Error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}