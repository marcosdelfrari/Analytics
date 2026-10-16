import { createHash } from "node:crypto";
import { lotusSkillDescription, lotusSkillMarkdown, lotusSkillName } from "@/lib/lotus-skill";

const schema = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

function digest(body: string) {
  const hex = createHash("sha256").update(body).digest("hex");
  return `sha256:${hex}`;
}

export function GET() {
  const index = {
    $schema: schema,
    skills: [
      {
        name: lotusSkillName,
        type: "skill-md",
        description: lotusSkillDescription,
        url: `/.well-known/agent-skills/${lotusSkillName}/SKILL.md`,
        digest: digest(lotusSkillMarkdown),
      },
    ],
  };

  return new Response(JSON.stringify(index), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
