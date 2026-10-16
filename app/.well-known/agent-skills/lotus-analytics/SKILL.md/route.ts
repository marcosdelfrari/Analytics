import { lotusSkillMarkdown } from "@/lib/lotus-skill";

export function GET() {
  return new Response(lotusSkillMarkdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
