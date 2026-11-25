import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || secret.length < 16) {
    return NextResponse.json({ error: "Revalidación no configurada" }, { status: 503 });
  }
  const actual = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true, revalidatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
