import { connection } from "next/server";
import { NextResponse } from "next/server";
import { registerClick } from "@/lib/links-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  await connection();
  const { code } = await context.params;
  const url = await registerClick(code.toLowerCase());
  if (!url) return new Response("Link não encontrado", { status: 404 });
  return NextResponse.redirect(url, 302);
}
