export type IncomingEvent = {
  id?: string;
  kind: string;
  name: string;
  url: string;
  referrer?: string;
  params?: unknown;
  properties?: unknown;
};

export type NormalizedHit = {
  clientEventId: string | null;
  kind: "event" | "pageview";
  name: string;
  url: string;
  path: string;
  referrer: string;
  params: Record<string, string>;
  properties: Record<string, string>;
};
