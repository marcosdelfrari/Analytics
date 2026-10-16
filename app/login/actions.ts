"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionCookie } from "@/lib/session";

export async function logout() {
  const jar = await cookies();
  jar.delete(sessionCookie);
  redirect("/login");
}
