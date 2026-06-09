import { NextResponse } from "next/server";
import { expireCertifications } from "@/lib/data/certifications";
import { getServiceSupabase } from "@/lib/supabase/service";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role not configured" }, { status: 503 });
  }

  const { expired } = await expireCertifications(supabase);

  return NextResponse.json({
    ok: true,
    expired,
    ran_at: new Date().toISOString(),
  });
}
