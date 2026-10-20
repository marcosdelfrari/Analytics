import { fractalSkillMarkdown } from "@/lib/fractal-skill";

export function GET() {
  return new Response(fractalSkillMarkdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
