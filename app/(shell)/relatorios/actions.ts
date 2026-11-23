"use server";

import { refresh, revalidatePath, updateTag } from "next/cache";
import { SITE_TRACKING_CACHE_TAG } from "@/lib/tracking-analytics";

export async function refreshReportsData() {
  updateTag(SITE_TRACKING_CACHE_TAG);
  revalidatePath("/relatorios");
  refresh();
}
