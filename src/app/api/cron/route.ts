import { NextResponse } from 'next/server';
import { createBrowserClient } from '@supabase/ssr';

export async function GET(request: Request) {
  // 🟢 1. ตรวจสอบ Security: เช็คว่าคนที่ยิงมาคือ Vercel Cron จริงไหม
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 🟢 2. ทำการเคาะประตู Database (ดึงข้อมูลแผนกออกมา 1 แถว)
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