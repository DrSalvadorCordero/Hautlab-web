import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({
    openai: Boolean(process.env.OPENAI_API_KEY),
    supabaseUrl: Boolean(process.env.SUPABASE_URL),
    supabaseSecret: Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
    internalKey: Boolean(process.env.HAUTLAB_INTERNAL_API_KEY),
    whatsappAccessToken: Boolean(process.env.WHATSAPP_ACCESS_TOKEN),
    whatsappPhoneNumberId: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
    metaAppSecret: Boolean(process.env.META_APP_SECRET || process.env.WHATSAPP_APP_SECRET),
    metaAppId: Boolean(process.env.META_APP_ID),
  }, { headers: { "Cache-Control": "no-store" } });
}
