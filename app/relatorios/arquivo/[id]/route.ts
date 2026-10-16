import { readFile } from "node:fs/promises";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { authEnabled } from "@/lib/auth-config";
import { getReport, uploadPath } from "@/lib/reports-store";

const contentTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".csv": "text/csv; charset=utf-8",
  ".xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await connection();
  const session = await getSession();
  const { id } = await context.params;
  const report = await getReport(id);
  const allowed =
    !authEnabled ||
    (session &&
      (session.role === "admin" || session.userId === report?.clientId));
  if (!allowed || !report?.storedFile || report.storedFile.includes("..")) {
    return new Response("Arquivo não encontrado", { status: 404 });
  }

  const extension = report.storedFile.slice(report.storedFile.lastIndexOf("."));
  const bytes = await readFile(uploadPath(report.storedFile));
  const fileName = report.fileName ?? report.storedFile;

  return new Response(bytes, {
    headers: {
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
    },
  });
}
