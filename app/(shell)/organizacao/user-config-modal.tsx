"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  removeUserFromOrgFlowAction,
  resetUserPasswordInOrgAction,
  saveUserFlowConfigAction,
} from "@/app/(shell)/organizacao/actions";
import { ConfirmDialog } from "@/app/components/confirm-dialog";
import {
  ORG_OWNER_SCOPE_LABEL,
  ORG_PROPRIETARIO_LABEL,
  OrgMemberRole,
} from "@/lib/access-roles";
import {
  COMPANY_ACCESS_ROLE_LABELS,
  type OrgMemberRole as OrgMemberRoleType,
} from "@/lib/company-access-role";
import type {
  AccessGrantSummary,
  OrganizationSummary,
} from "@/lib/organizations-store";

type AccessScopeMode = "owner" | "all_companies" | "by_company";

function getInitialScopeMode(grant: AccessGrantSummary): AccessScopeMode {
  if (grant.isOrgProprietario) return "owner";
  if (grant.allCompanies) return "all_companies";
  return "by_company";
}

function generateStrongPassword(length = 12): string {
  const chars =
    "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let result = "";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i]! % chars.length];
  }
  return result;
}

export function UserConfigModal({
  grant,
  organization,
  allowOwnerRole = false,
  initialTab = "access",
  onClose,
}: {
  grant: AccessGrantSummary;
  organization: OrganizationSummary;
  allowOwnerRole?: boolean;
  initialTab?: "access" | "password";
  onClose: () => void;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"access" | "password">(initialTab);
  const [name, setName] = useState(grant.userName);
  const [scopeMode, setScopeMode] = useState<AccessScopeMode>(() =>
    getInitialScopeMode(grant),
  );
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(() =>
    grant.allCompanies || grant.isOrgProprietario
      ? organization.companies.map((c) => c.id)
      : [...grant.companyIds],
  );
  const [companyRoles, setCompanyRoles] = useState<
    Record<string, OrgMemberRoleType>
  >(() => {
    const initial: Record<string, OrgMemberRoleType> = {};
    for (const company of organization.companies) {
      initial[company.id] = grant.companyRoles[company.id] ?? OrgMemberRole.analista;
    }
    return initial;
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [hasPasswordState, setHasPasswordState] = useState(grant.hasPassword);

  const [confirmRemove, setConfirmRemove] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setName(grant.userName);
    setScopeMode(getInitialScopeMode(grant));
    setSelectedCompanyIds(
      grant.allCompanies || grant.isOrgProprietario
        ? organization.companies.map((c) => c.id)
        : [...grant.companyIds],
    );
    const updatedRoles: Record<string, OrgMemberRoleType> = {};
    for (const company of organization.companies) {
      updatedRoles[company.id] = grant.companyRoles[company.id] ?? "analyst";
    }
    setCompanyRoles(updatedRoles);
    setHasPasswordState(grant.hasPassword);
    setConfirmRemove(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [grant, organization.companies]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose]);

  const canManageAllCompanies =
    allowOwnerRole || organization.viewerIsOrgProprietario !== false;
  const canChangeOwner = allowOwnerRole;
  const canRemoveUser =
    (allowOwnerRole || !grant.isOrgProprietario) &&
    (canManageAllCompanies ||
      (!grant.allCompanies &&
        grant.companyIds.every((id) =>
          organization.companies.some((company) => company.id === id),
        )));
  const orgWideGrantLocked =
    !canManageAllCompanies &&
    (grant.isOrgProprietario || grant.allCompanies);

  const toggleCompany = (companyId: string) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId],
    );
  };

  const setRoleForCompany = (companyId: string, role: OrgMemberRoleType) => {
    setCompanyRoles((prev) => ({
      ...prev,
      [companyId]: role,
    }));
  };

  const handleGeneratePassword = () => {
    const generated = generateStrongPassword(12);
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generated).then(() => {
        setCopiedPassword(true);
        window.setTimeout(() => setCopiedPassword(false), 2200);
      });
    }
  };

  const handleResetPasswordOnly = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.trim().length < 8) {
      setErrorMessage("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setErrorMessage("As senhas informadas não coincidem.");
      return;
    }

    startTransition(async () => {
      const result = await resetUserPasswordInOrgAction({
        organizationId: organization.id,
        grantId: grant.id,
        newPassword,
        confirmPassword,
      });

      if (!result.ok) {
        setErrorMessage(result.error ?? "Não foi possível redefinir a senha.");
        return;
      }

      setHasPasswordState(true);
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage("Senha redefinida com sucesso.");
      router.refresh();
    });
  };

  const handleSaveAll = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await saveUserFlowConfigAction(
        orgWideGrantLocked
          ? {
              organizationId: organization.id,
              grantId: grant.id,
              name: name.trim(),
              newPassword: newPassword.trim() || undefined,
              confirmPassword: confirmPassword.trim() || undefined,
            }
          : {
              organizationId: organization.id,
              grantId: grant.id,
              name: name.trim(),
              isOrgProprietario: canManageAllCompanies
                ? scopeMode === "owner"
                : false,
              allCompanies: canManageAllCompanies
                ? scopeMode === "owner" || scopeMode === "all_companies"
                : false,
              companyIds:
                !canManageAllCompanies || scopeMode === "by_company"
                  ? selectedCompanyIds
                  : [],
              companyRoles,
              newPassword: newPassword.trim() || undefined,
              confirmPassword: confirmPassword.trim() || undefined,
            },
      );

      if (!result.ok) {
        setErrorMessage(
          result.error ?? "Não foi possível salvar as configurações.",
        );
        return;
      }

      if (result.passwordUpdated) {
        setHasPasswordState(true);
        setNewPassword("");
        setConfirmPassword("");
      }

      setSuccessMessage(
        result.passwordUpdated
          ? "Configurações e nova senha salvas com sucesso."
          : "Configurações de acesso salvas com sucesso.",
      );
      router.refresh();
      window.setTimeout(() => {
        onClose();
      }, 650);
    });
  };

  const handleRemoveUser = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await removeUserFromOrgFlowAction({
        organizationId: organization.id,
        grantId: grant.id,
      });

      if (!result.ok) {
        setErrorMessage(
          result.error ?? "Não foi possível remover o usuário da organização.",
        );
        return;
      }

      router.refresh();
      onClose();
    });
  };

  const initials = (name || grant.email)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-config-modal-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#121212] shadow-2xl">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-surface-elevated font-mono text-sm font-semibold text-foreground">
              {initials || "U"}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="user-config-modal-title"
                  className="truncate text-base font-semibold text-foreground"
                >
                  {grant.userName}
                </h2>
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium ${
                    scopeMode === "owner"
                      ? "border-positive/35 bg-positive/10 text-positive"
                      : scopeMode === "all_companies"
                        ? "border-foreground/30 bg-surface-elevated text-foreground"
                        : "border-border bg-background/80 text-muted-foreground"
                  }`}
                >
                  {scopeMode === "owner"
                    ? ORG_PROPRIETARIO_LABEL
                    : scopeMode === "all_companies"
                      ? "Todas as empresas"
                      : "Acesso por empresa"}
                </span>
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] ${
                    hasPasswordState
                      ? "border-positive/30 bg-positive/10 text-positive"
                      : "border-amber-400/30 bg-amber-400/10 text-amber-300"
                  }`}
                >
                  {hasPasswordState ? "Senha ativa" : "Sem senha definida"}
                </span>
              </div>
              <p className="mt-0.5 truncate font-mono text-[11.5px] text-muted-foreground">
                {grant.email} · Organização {organization.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-background/60 text-muted-foreground transition hover:border-white/25 hover:text-foreground disabled:opacity-50"
            aria-label="Fechar configurações do usuário"
          >
            ✕
          </button>
        </div>

        {/* Navegação de Abas */}
        <div className="flex items-center gap-2 border-b border-border bg-background/40 px-6 py-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("access")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
              activeTab === "access"
                ? "bg-surface-elevated text-foreground ring-1 ring-white/15"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Empresas de acesso e papel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition ${
              activeTab === "password"
                ? "bg-surface-elevated text-foreground ring-1 ring-white/15"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Redefinir senha</span>
            {!hasPasswordState && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            )}
          </button>
        </div>

        {/* Corpo rolável */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {activeTab === "access" ? (
            <>
              {/* Nome de exibição */}
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground">
                  Nome de exibição do usuário
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome completo"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-background px-3.5 py-2 text-[13px] text-foreground outline-none transition focus:border-white/25"
                  />
                </label>
              </div>

              {/* Escopo de Pertencimento */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
                    Nível de pertencimento na organização
                  </span>
                </div>

                {orgWideGrantLocked ? (
                  <p className="rounded-xl border border-border bg-background/50 px-3.5 py-3 text-[12px] leading-5 text-muted-foreground">
                    Este usuário tem acesso ampliado à organização. Você vê
                    apenas o vínculo com as empresas que gerencia e não pode
                    alterar o escopo completo.
                  </p>
                ) : (
                  <div
                    className={`grid gap-2.5 ${
                      canManageAllCompanies ? "sm:grid-cols-3" : "sm:grid-cols-1"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={grant.isOrgProprietario && !canChangeOwner}
                      onClick={() => setScopeMode("by_company")}
                      className={`flex cursor-pointer flex-col items-start rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        scopeMode === "by_company"
                          ? "border-foreground/50 bg-surface-elevated ring-1 ring-white/15"
                          : "border-border bg-background/50 hover:border-white/20"
                      }`}
                    >
                      <span className="text-[12.5px] font-semibold text-foreground">
                        Por empresa
                      </span>
                      <span className="mt-1 text-[11px] leading-snug text-muted-foreground">
                        Escolha quais empresas acessa e o papel em cada uma.
                      </span>
                    </button>

                    {canManageAllCompanies && (
                      <button
                        type="button"
                        disabled={grant.isOrgProprietario && !canChangeOwner}
                        onClick={() => setScopeMode("all_companies")}
                        className={`flex cursor-pointer flex-col items-start rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          scopeMode === "all_companies"
                            ? "border-foreground/50 bg-surface-elevated ring-1 ring-white/15"
                            : "border-border bg-background/50 hover:border-white/20"
                        }`}
                      >
                        <span className="text-[12.5px] font-semibold text-foreground">
                          Todas as empresas
                        </span>
                        <span className="mt-1 text-[11px] leading-snug text-muted-foreground">
                          Acesso automático a todas as empresas de{" "}
                          {organization.name}.
                        </span>
                      </button>
                    )}

                    {canManageAllCompanies && (
                      <button
                        type="button"
                        disabled={!canChangeOwner && !grant.isOrgProprietario}
                        onClick={() => {
                          if (canChangeOwner) setScopeMode("owner");
                        }}
                        className={`flex cursor-pointer flex-col items-start rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          scopeMode === "owner"
                            ? "border-positive/50 bg-positive/10 ring-1 ring-positive/30"
                            : "border-border bg-background/50 hover:border-white/20"
                        }`}
                      >
                        <span className="text-[12.5px] font-semibold text-positive">
                          {ORG_OWNER_SCOPE_LABEL}
                        </span>
                        <span className="mt-1 text-[11px] leading-snug text-muted-foreground">
                          Gestão total de empresas, usuários e acessos da
                          organização.
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Lista de empresas e papel por empresa */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
                      Empresas com acesso e papel ({organization.companies.length})
                    </p>
                    <p className="text-[11.5px] text-muted-foreground">
                      {scopeMode === "owner"
                        ? "Como proprietário da organização, este usuário gerencia empresas, usuários e acessos em toda a organização."
                        : scopeMode === "all_companies"
                          ? "Este usuário acessa todas as empresas da organização como analista."
                          : "Marque as empresas permitidas e defina se atua como Proprietário ou Analista."}
                    </p>
                  </div>

                  {scopeMode === "by_company" &&
                    organization.companies.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCompanyIds(
                              organization.companies.map((c) => c.id),
                            )
                          }
                          className="cursor-pointer rounded-lg border border-border-subtle bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-white/20 hover:text-foreground"
                        >
                          Marcar todas
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCompanyIds([])}
                          className="cursor-pointer rounded-lg border border-border-subtle bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-white/20 hover:text-foreground"
                        >
                          Limpar
                        </button>
                      </div>
                    )}
                </div>

                {organization.companies.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-6 text-center text-[12px] text-muted">
                    Nenhuma empresa cadastrada nesta organização.
                  </div>
                ) : (
                  <div className="divide-y divide-border-subtle overflow-hidden rounded-xl border border-border bg-background/40">
                    {organization.companies.map((company) => {
                      const isLinked =
                        scopeMode === "owner" ||
                        scopeMode === "all_companies" ||
                        selectedCompanyIds.includes(company.id);
                      const roleValue =
                        scopeMode === "owner"
                          ? OrgMemberRole.proprietario
                          : scopeMode === "all_companies"
                            ? "analyst"
                            : (companyRoles[company.id] ?? "analyst");

                      return (
                        <div
                          key={company.id}
                          className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition ${
                            isLinked ? "bg-surface/70" : "opacity-60"
                          }`}
                        >
                          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isLinked}
                              disabled={
                                orgWideGrantLocked || scopeMode !== "by_company"
                              }
                              onChange={() => toggleCompany(company.id)}
                              className="h-4 w-4 rounded border-border accent-emerald-400"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-[13px] font-medium text-foreground">
                                  {company.name}
                                </span>
                                <span
                                  className={`rounded-full border px-2 py-0.5 font-mono text-[9.5px] ${
                                    company.planActive
                                      ? "border-positive/30 bg-positive/10 text-positive"
                                      : "border-border bg-background text-muted"
                                  }`}
                                >
                                  {company.planActive
                                    ? "Plano ativo"
                                    : "Gratuito"}
                                </span>
                              </div>
                            </div>
                          </label>

                          <div className="flex items-center gap-2">
                            {scopeMode === "by_company" ? (
                              <div className="inline-flex rounded-lg border border-border-subtle bg-background p-0.5">
                                {(
                                  Object.keys(
                                    COMPANY_ACCESS_ROLE_LABELS,
                                  ) as OrgMemberRoleType[]
                                ).map((roleKey) => {
                                  const selectedRole = roleValue === roleKey;
                                  return (
                                    <button
                                      key={roleKey}
                                      type="button"
                                      disabled={!isLinked}
                                      onClick={() =>
                                        setRoleForCompany(company.id, roleKey)
                                      }
                                      className={`cursor-pointer rounded-md px-2.5 py-1 text-[11px] font-medium transition disabled:cursor-not-allowed ${
                                        selectedRole && isLinked
                                          ? roleKey === OrgMemberRole.proprietario
                                            ? "bg-positive/20 text-positive ring-1 ring-positive/40"
                                            : "bg-surface-elevated text-foreground ring-1 ring-white/15"
                                          : "text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      {COMPANY_ACCESS_ROLE_LABELS[roleKey]}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <span
                                className={`rounded-md border px-2.5 py-1 font-mono text-[10.5px] ${
                                  scopeMode === "owner"
                                    ? "border-positive/30 bg-positive/10 text-positive"
                                    : "border-border-subtle bg-background text-muted-foreground"
                                }`}
                              >
                                {scopeMode === "owner"
                                  ? ORG_PROPRIETARIO_LABEL
                                  : "Analista (organização)"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Atalho rápido para senha na mesma tela */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-background/50 px-4 py-3">
                <div>
                  <p className="text-[12.5px] font-medium text-foreground">
                    Precisa definir ou alterar a senha deste usuário?
                  </p>
                  <p className="text-[11.5px] text-muted-foreground">
                    {hasPasswordState
                      ? "O usuário já possui senha cadastrada. Você pode redefini-la a qualquer momento."
                      : "Este usuário ainda não possui senha para login direto com e-mail e senha."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("password")}
                  className="cursor-pointer rounded-xl border border-border bg-surface-elevated px-3.5 py-1.5 text-[12px] font-medium text-foreground transition hover:border-white/30"
                >
                  Redefinir senha →
                </button>
              </div>
            </>
          ) : (
            /* Aba Redefinir Senha */
            <div className="space-y-4">
              <div className="rounded-xl border border-border-subtle bg-background/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-[13px] font-semibold text-foreground">
                      Credencial de acesso com e-mail e senha
                    </h3>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">
                      Defina uma nova senha para{" "}
                      <span className="font-mono text-foreground">
                        {grant.email}
                      </span>
                      . O usuário poderá entrar imediatamente com ela.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="cursor-pointer rounded-xl border border-border bg-surface-elevated px-3 py-1.5 text-[11.5px] font-medium text-foreground transition hover:border-white/30"
                  >
                    {copiedPassword
                      ? "✓ Gerada e copiada!"
                      : "Gerar senha forte"}
                  </button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="block text-[12px] text-muted-foreground">
                    Nova senha (mín. 8 caracteres)
                    <div className="relative mt-1.5">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite a nova senha"
                        autoComplete="new-password"
                        className="w-full rounded-xl border border-white/10 bg-background px-3.5 py-2 pr-16 text-[13px] text-foreground outline-none transition focus:border-white/25"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                  </label>

                  <label className="block text-[12px] text-muted-foreground">
                    Confirmar nova senha
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      autoComplete="new-password"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-background px-3.5 py-2 text-[13px] text-foreground outline-none transition focus:border-white/25"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
                  <p className="text-[11.5px] text-muted">
                    Você pode aplicar somente a senha agora ou salvar tudo no
                    botão principal abaixo.
                  </p>
                  <button
                    type="button"
                    disabled={isPending || !newPassword.trim()}
                    onClick={handleResetPasswordOnly}
                    className="cursor-pointer rounded-xl border border-positive/40 bg-positive/15 px-3.5 py-1.5 text-[12px] font-medium text-positive transition hover:bg-positive/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? "Redefinindo..." : "Redefinir senha agora"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-negative/35 bg-negative/10 px-4 py-2.5 text-[12px] text-negative">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-positive/35 bg-positive/10 px-4 py-2.5 text-[12px] text-positive">
              {successMessage}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/60 px-6 py-4">
          <div>
            {canRemoveUser ? (
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmRemove(true)}
                className="cursor-pointer rounded-xl border border-border px-3 py-1.5 text-[12px] text-muted-foreground transition hover:border-negative/40 hover:bg-negative/10 hover:text-negative disabled:opacity-50"
              >
                Remover da organização
              </button>
            ) : (
              <span className="font-mono text-[11px] text-muted">
                {ORG_PROPRIETARIO_LABEL} protegido
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-border px-4 py-2 text-[12.5px] text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground disabled:opacity-50"
            >
              Fechar
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSaveAll}
              className="cursor-pointer rounded-xl bg-foreground px-4 py-2 text-[12.5px] font-medium text-background transition hover:opacity-90 disabled:opacity-60"
            >
              {isPending ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmRemove}
        tone="danger"
        pending={isPending}
        title={`Remover ${grant.userName} da organização?`}
        description={`Isso remove o acesso de ${grant.email} em ${organization.name}. A conta na plataforma não é apagada por esta ação.`}
        confirmLabel="Sim, remover"
        cancelLabel="Cancelar"
        onCancel={() => {
          if (!isPending) setConfirmRemove(false);
        }}
        onConfirm={handleRemoveUser}
      />
    </div>
  );
}
