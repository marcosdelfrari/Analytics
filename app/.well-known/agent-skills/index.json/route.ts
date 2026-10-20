import { createHash } from "node:crypto";
import {
  fractalSkillDescription,
  fractalSkillMarkdown,
  fractalSkillName,
} from "@/lib/fractal-skill";

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
        name: fractalSkillName,
        type: "skill-md",
        description: fractalSkillDescription,
        url: `/.well-known/agent-skills/${fractalSkillName}/SKILL.md`,
        digest: digest(fractalSkillMarkdown),
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
