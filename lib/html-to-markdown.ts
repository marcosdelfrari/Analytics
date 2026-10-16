const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

export function acceptsMarkdown(accept: string | null) {
  if (!accept) return false;
  return accept.split(",").some((part) => {
    const media = part.split(";")[0]?.trim().toLowerCase();
    return media === "text/markdown";
  });
}

export function estimateMarkdownTokens(markdown: string) {
  const trimmed = markdown.trim();
  if (!trimmed) return 0;
  return Math.max(1, Math.ceil(trimmed.length / 4));
}

export function htmlToAgentMarkdown(html: string) {
  const title = decode(textContent(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""));
  const description =
    metaContent(html, "description") || metaContent(html, "og:description");
  const image = metaContent(html, "og:image");
  const jsonLd = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);

  let body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  body = body.replace(/<header\b[^>]*>[\s\S]*?<\/header>/i, "");
  body = stripTag(body, "footer");
  body = stripTag(body, "nav");
  body = stripTag(body, "script");
  body = stripTag(body, "style");
  body = stripTag(body, "svg");
  body = stripTag(body, "noscript");
  body = body.replace(/<([a-z0-9]+)[^>]*\saria-hidden(?:=["']true["'])?[^>]*>[\s\S]*?<\/\1>/gi, "");

  body = replaceTag(body, "a", (attrs, inner) => {
    const href = attrs.match(/\bhref=["']([^"']+)["']/i)?.[1];
    const label = visibleText(inner);
    if (!label) return "";
    return href ? `[${label}](${href})` : label;
  });
  body = replaceTag(body, "button", (_attrs, inner) => {
    const label = visibleText(inner);
    return label ? `**${label}**` : "";
  });

  for (let level = 1; level <= 6; level += 1) {
    body = replaceTag(body, `h${level}`, (_attrs, inner) => {
      const label = visibleText(inner);
      return label ? `${"#".repeat(level)} ${label}` : "";
    });
  }

  body = replaceTag(body, "li", (_attrs, inner) => {
    const label = visibleText(inner);
    return label ? `- ${label}` : "";
  });
  body = replaceTag(body, "p", (_attrs, inner) => visibleText(inner));
  body = visibleText(body);
  body = body
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const frontmatter = [
    title ? `title: ${yamlString(title)}` : "",
    description ? `description: ${yamlString(description)}` : "",
    image ? `image: ${yamlString(image)}` : "",
  ].filter(Boolean);

  const parts = [];
  if (frontmatter.length > 0) {
    parts.push(`---\n${frontmatter.join("\n")}\n---`);
  }
  if (body) parts.push(body);
  if (jsonLd.length > 0) {
    parts.push(`\`\`\`json\n${jsonLd.join("\n")}\n\`\`\``);
  }
  return `${parts.join("\n\n")}\n`;
}

function metaContent(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const byName = new RegExp(
    `<meta[^>]*(?:name|property)=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  const byContent = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${escaped}["'][^>]*>`,
    "i",
  );
  return decode(html.match(byName)?.[1] ?? html.match(byContent)?.[1] ?? "");
}

function stripTag(html: string, tag: string) {
  return html.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, "gi"), "");
}

function replaceTag(
  html: string,
  tag: string,
  render: (attrs: string, inner: string) => string,
) {
  return html.replace(
    new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)</${tag}>`, "gi"),
    (_match, attrs: string, inner: string) => {
      const rendered = render(attrs, inner).trim();
      return rendered ? `\n\n${rendered}\n\n` : "";
    },
  );
}

function visibleText(value: string) {
  return decode(value.replace(/<[^>]+>/g, " "))
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function textContent(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decode(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (entity, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? entity);
}

function yamlString(value: string) {
  return JSON.stringify(value);
}
