import { removePlatformUser } from "@/app/(shell)/admin/actions";
import { adminEmail } from "@/lib/access-code";
import type { Account } from "@/lib/types";

type UsersPanelProps = {
  users: Account[];
};

export function UsersPanel({ users }: UsersPanelProps) {
  const clients = users.filter((user) => user.email !== adminEmail);

  return (
    <section className="border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Usuários da plataforma</h2>
        <p className="text-[12px] text-muted">
          Contas que já entraram com Google. Proprietários e membros são
          liberados por organização.
        </p>
      </div>
      {clients.length === 0 ? (
        <p className="px-4 py-6 text-[12px] text-muted">
          Nenhum usuário além do administrador.
        </p>
      ) : (
        <ul>
          {clients.map((user) => (
            <li
              key={user.id}
              className="flex items-start justify-between gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                  {user.email}
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  {user.role === "admin"
                    ? "Administrador da plataforma"
                    : user.planActive
                      ? "Plano legado ativo no cadastro"
                      : "Acesso via organização"}
                </p>
              </div>
              <form action={removePlatformUser}>
                <input type="hidden" name="id" value={user.id} />
                <button
                  type="submit"
                  className="shrink-0 border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-surface-elevated"
                >
                  Remover cadastro
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
