export function authSecret() {
  const configured = process.env.AUTH_SECRET?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET é obrigatório em produção.");
  }
  return "analytics-dev-secret";
}
