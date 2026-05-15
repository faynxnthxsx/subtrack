// src/app/page.tsx
// Landing page — redirect ไปตามสถานะ login

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

//Nested Object Destructuring Instance Method
export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}