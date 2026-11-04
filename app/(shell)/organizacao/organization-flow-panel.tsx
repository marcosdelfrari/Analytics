"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  hasElevatedCompanyAccess,
  isAdministratorAtCompany,
} from "@/lib/company-access-role";
import { associateCompanyWithUserInFlow } from "@/app/(shell)/organizacao/actions";
import { UserConfigModal } from "@/app/(shell)/organizacao/user-config-modal";
import type {
  AccessGrantSummary,
  CompanyAccount,
  OrganizationSummary,
} from "@/lib/organizations-store";

type HoveredNode =
  | { type: "company"; id: string }
  | { type: "grant"; id: string }
  | null;

type DragPayload =
  | { type: "company"; id: string }
  | { type: "grant"; id: string };

type SaveStatus = "idle" | "saving" | "saved" | "error";

function grantsForCompany(
  company: CompanyAccount,
  grants: AccessGrantSummary[],
  extraLinks: Record<string, string[]>,
) {
  return grants.filter((grant) => {
    const linked =
      grant.isOwner ||
      grant.allCompanies ||
      grant.companyIds.includes(company.id) ||
      (extraLinks[grant.id] ?? []).includes(company.id);
    return linked;
  });
}

function isConnected(
  grant: AccessGrantSummary,
  companyId: string,
  extraLinks: Record<string, string[]>,
) {
  return (
    grant.isOwner ||
    grant.allCompanies ||
    grant.companyIds.includes(companyId) ||
    (extraLinks[grant.id] ?? []).includes(companyId)
  );
}

function isDashedCompanyEdge(
  grant: AccessGrantSummary,
  companyId: string,
): boolean {
  if (grant.isOwner || grant.allCompanies) return false;
  return !isAdministratorAtCompany(grant, companyId);
}

function useIsNarrow(breakpoint = 768) {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return narrow;
}

function SingleOrganizationBpmnDiagram({
  organization,
  extraLinks,
  onAssociate,
  onOpenUserConfig,
  savePending,
}: {
  organization: OrganizationSummary;
  extraLinks: Record<string, string[]>;
  onAssociate: (companyId: string, grantId: string) => void;
  onOpenUserConfig: (
    grant: AccessGrantSummary,
    organization: OrganizationSummary,
  ) => void;
  savePending: boolean;
}) {
  const [selected, setSelected] = useState<HoveredNode>(null);
  const [hovered, setHovered] = useState<HoveredNode>(null);
  const [dropTarget, setDropTarget] = useState<HoveredNode>(null);
  const [dragActive, setDragActive] = useState<DragPayload | null>(null);
  const didDragRef = useRef(false);
  const isNarrow = useIsNarrow();

  const activeFilter = hovered ?? selected;
  const companies = organization.companies;
  const grants = organization.grants;

  const HEADER_H = isNarrow ? 36 : 44;
  const PAD = isNarrow ? 20 : 28;
  const NODE_H = isNarrow ? 64 : 68;
  const NODE_GAP = isNarrow ? 14 : 18;

  const parseDrag = (event: DragEvent): DragPayload | null => {
    try {
      const raw = event.dataTransfer.getData("application/x-org-flow");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as DragPayload;
      if (
        (parsed.type === "company" || parsed.type === "grant") &&
        typeof parsed.id === "string"
      ) {
        return parsed;
      }
    } catch {
      /* ignore */
    }
    return null;
  };

  const startDrag = (event: DragEvent, payload: DragPayload) => {
    didDragRef.current = true;
    setDragActive(payload);
    event.dataTransfer.effectAllowed = "link";
    event.dataTransfer.setData(
      "application/x-org-flow",
      JSON.stringify(payload),
    );
    event.dataTransfer.setData("text/plain", `${payload.type}:${payload.id}`);
  };

  const endDrag = () => {
    setDragActive(null);
    setDropTarget(null);
    window.setTimeout(() => {
      didDragRef.current = false;
    }, 0);
  };

  const handleDropOn = (target: DragPayload) => {
    const source = dragActive;
    if (!source || source.type === target.type) return;
    const companyId = source.type === "company" ? source.id : target.id;
    const grantId = source.type === "grant" ? source.id : target.id;
    onAssociate(companyId, grantId);
    endDrag();
  };

  const handleNodeClick = (node: HoveredNode) => {
    if (didDragRef.current) return;
    setSelected((prev) =>
      prev?.type === node?.type && prev?.id === node?.id ? null : node,
    );
  };

  if (isNarrow) {
    const COL_X = 16;
    const COL_W = 280;
    const totalWidth = 312;

    const orgY = HEADER_H + PAD + NODE_H / 2;
    const companyStart =
      HEADER_H + PAD + NODE_H + 36 + (companies.length === 0 ? NODE_H / 2 : 0);
    const companyBlockH =
      Math.max(1, companies.length) * NODE_H +
      Math.max(0, companies.length - 1) * NODE_GAP;
    const grantStart =
      HEADER_H +
      PAD +
      NODE_H +
      36 +
      companyBlockH +
      36 +
      (grants.length === 0 ? NODE_H / 2 : 0);
    const grantBlockH =
      Math.max(1, grants.length) * NODE_H +
      Math.max(0, grants.length - 1) * NODE_GAP;
    const totalHeight =
      HEADER_H +
      PAD +
      NODE_H +
      36 +
      companyBlockH +
      36 +
      grantBlockH +
      PAD;

    const companyY = (index: number) => {
      if (companies.length === 0) return companyStart;
      return companyStart + index * (NODE_H + NODE_GAP) + NODE_H / 2;
    };
    const grantY = (index: number) => {
      if (grants.length === 0) return grantStart;
      return grantStart + index * (NODE_H + NODE_GAP) + NODE_H / 2;
    };

    const isCompanyActive = (companyId: string) => {
      if (!activeFilter) return true;
      if (activeFilter.type === "company") return activeFilter.id === companyId;
      const grant = grants.find((g) => g.id === activeFilter.id);
      if (!grant) return true;
      return isConnected(grant, companyId, extraLinks);
    };

    const isGrantActive = (grant: AccessGrantSummary) => {
      if (!activeFilter) return true;
      if (activeFilter.type === "grant") return activeFilter.id === grant.id;
      return isConnected(grant, activeFilter.id, extraLinks);
    };

    const verticalPath = (x: number, y1: number, y2: number) => {
      const mid = (y1 + y2) / 2;
      return `M ${x} ${y1} C ${x} ${mid}, ${x} ${mid}, ${x} ${y2}`;
    };

    return (
      <div className="relative overflow-x-auto">
        <div
          className="relative mx-auto select-none"
          style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}
        >
          <svg
            width={totalWidth}
            height={totalHeight}
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            fill="none"
            className="pointer-events-none absolute inset-0"
          >
            <defs>
              <marker
                id={`arrow-default-v-${organization.id}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path
                  d="M 1 1.5 L 8.5 5 L 1 8.5 z"
                  fill="rgba(237,237,237,0.55)"
                />
              </marker>
              <marker
                id={`arrow-positive-v-${organization.id}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill="#4ade80" />
              </marker>
              <marker
                id={`arrow-muted-v-${organization.id}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path
                  d="M 1 1.5 L 8.5 5 L 1 8.5 z"
                  fill="rgba(161,161,161,0.22)"
                />
              </marker>
            </defs>

            <rect
              x="0.5"
              y="0.5"
              width={totalWidth - 1}
              height={totalHeight - 1}
              rx="14"
              fill="rgba(12,12,12,0.55)"
              stroke="rgba(255,255,255,0.08)"
            />

            {/* Org -> companies hub */}
            <path
              d={verticalPath(
                COL_X + COL_W / 2,
                orgY + NODE_H / 2,
                companies.length === 0
                  ? companyStart - NODE_H / 2
                  : companyY(0) - NODE_H / 2,
              )}
              stroke="rgba(237,237,237,0.45)"
              strokeWidth="1.5"
              markerEnd={`url(#arrow-default-v-${organization.id})`}
            />

            {companies.map((company, cIdx) => {
              const cy = companyY(cIdx);
              return grants.map((grant, gIdx) => {
                if (!isConnected(grant, company.id, extraLinks)) return null;
                const gy = grantY(gIdx);
                const active =
                  !activeFilter ||
                  (activeFilter.type === "company" &&
                    activeFilter.id === company.id) ||
                  (activeFilter.type === "grant" &&
                    activeFilter.id === grant.id);
                return (
                  <path
                    key={`v-edge-${company.id}-${grant.id}`}
                    d={verticalPath(
                      COL_X + COL_W / 2,
                      cy + NODE_H / 2,
                      gy - NODE_H / 2,
                    )}
                    stroke={
                      active
                        ? isAdministratorAtCompany(grant, company.id)
                          ? "rgba(74,222,128,0.7)"
                          : "rgba(237,237,237,0.5)"
                        : "rgba(255,255,255,0.08)"
                    }
                    strokeWidth={active ? "1.5" : "1.1"}
                    strokeDasharray={
                      isDashedCompanyEdge(grant, company.id) ? "5 4" : undefined
                    }
                    markerEnd={
                      active
                        ? isAdministratorAtCompany(grant, company.id)
                          ? `url(#arrow-positive-v-${organization.id})`
                          : `url(#arrow-default-v-${organization.id})`
                        : `url(#arrow-muted-v-${organization.id})`
                    }
                  />
                );
              });
            })}
          </svg>

          <div
            className="absolute inset-x-0 top-0 flex items-center px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted"
            style={{ height: `${HEADER_H}px` }}
          >
            Fluxo vertical · Organização → Empresas → Usuários
          </div>

          {/* Organização */}
          <div
            className="absolute flex flex-col justify-center rounded-xl border border-white/20 bg-[#161616] px-3.5 py-2.5 shadow-lg"
            style={{
              left: `${COL_X}px`,
              top: `${orgY - NODE_H / 2}px`,
              width: `${COL_W}px`,
              height: `${NODE_H}px`,
            }}
          >
            <p className="font-mono text-[9.5px] uppercase tracking-wider text-muted">
              Organização
            </p>
            <p className="truncate text-[13px] font-semibold text-foreground">
              {organization.name}
            </p>
          </div>

          {/* Empresas */}
          {companies.length === 0 ? (
            <div
              className="absolute flex items-center justify-center rounded-xl border border-dashed border-border bg-background/70 px-3 text-center text-[11.5px] text-muted"
              style={{
                left: `${COL_X}px`,
                top: `${companyStart - NODE_H / 2}px`,
                width: `${COL_W}px`,
                height: `${NODE_H}px`,
              }}
            >
              Nenhuma empresa cadastrada
            </div>
          ) : (
            companies.map((company, cIdx) => {
              const cy = companyY(cIdx);
              const active = isCompanyActive(company.id);
              const isSelected =
                selected?.type === "company" && selected.id === company.id;
              const isDrop =
                dropTarget?.type === "company" && dropTarget.id === company.id;
              const linkedGrants = grantsForCompany(
                company,
                grants,
                extraLinks,
              );
              const draggingGrant =
                dragActive?.type === "grant"
                  ? grants.find((g) => g.id === dragActive.id)
                  : undefined;
              const canDropHere =
                draggingGrant != null &&
                !isConnected(draggingGrant, company.id, extraLinks);

              return (
                <button
                  key={company.id}
                  type="button"
                  draggable={!savePending}
                  onDragStart={(e) =>
                    startDrag(e, { type: "company", id: company.id })
                  }
                  onDragEnd={endDrag}
                  onDragOver={(e) => {
                    if (dragActive?.type !== "grant") return;
                    e.preventDefault();
                    setDropTarget({ type: "company", id: company.id });
                  }}
                  onDragLeave={() =>
                    setDropTarget((prev) =>
                      prev?.type === "company" && prev.id === company.id
                        ? null
                        : prev,
                    )
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    const source = parseDrag(e) ?? dragActive;
                    if (source?.type === "grant") {
                      handleDropOn({ type: "company", id: company.id });
                    }
                  }}
                  onMouseEnter={() =>
                    setHovered({ type: "company", id: company.id })
                  }
                  onMouseLeave={() => setHovered(null)}
                  onClick={() =>
                    handleNodeClick({ type: "company", id: company.id })
                  }
                  style={{
                    left: `${COL_X}px`,
                    top: `${cy - NODE_H / 2}px`,
                    width: `${COL_W}px`,
                    height: `${NODE_H}px`,
                  }}
                  className={`absolute flex cursor-grab flex-col justify-center rounded-xl border px-3.5 py-2 text-left transition-all active:cursor-grabbing ${
                    isDrop && canDropHere
                      ? "border-positive/60 bg-positive/10 ring-1 ring-positive/40"
                      : isSelected
                        ? "border-foreground/60 bg-surface-elevated shadow-lg ring-1 ring-white/20"
                        : active
                          ? "border-border bg-[#151515] hover:border-white/30"
                          : "border-border-subtle bg-background/40 opacity-35"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[12.5px] font-semibold text-foreground">
                      {company.name}
                    </p>
                    <span className="shrink-0 rounded border border-border-subtle bg-background/80 px-1.5 py-0.5 font-mono text-[9.5px] text-muted-foreground">
                      {linkedGrants.length} usu.
                    </span>
                  </div>
                  <span
                    className={`mt-1 font-mono text-[10px] ${
                      company.planActive ? "text-positive" : "text-muted"
                    }`}
                  >
                    {company.planActive ? "Plano ativo" : "Gratuito"}
                  </span>
                </button>
              );
            })
          )}

          {/* Usuários */}
          {grants.length === 0 ? (
            <div
              className="absolute flex items-center justify-center rounded-xl border border-dashed border-border bg-background/70 px-3 text-center text-[11.5px] text-muted"
              style={{
                left: `${COL_X}px`,
                top: `${grantStart - NODE_H / 2}px`,
                width: `${COL_W}px`,
                height: `${NODE_H}px`,
              }}
            >
              Nenhum usuário vinculado
            </div>
          ) : (
            grants.map((grant, gIdx) => {
              const gy = grantY(gIdx);
              const active = isGrantActive(grant);
              const isSelected =
                selected?.type === "grant" && selected.id === grant.id;
              const isDrop =
                dropTarget?.type === "grant" && dropTarget.id === grant.id;
              const elevated = hasElevatedCompanyAccess(grant);
              const roleTitle = elevated ? "Proprietário" : "Por empresa";
              const canDropHere =
                dragActive?.type === "company" &&
                !isConnected(grant, dragActive.id, extraLinks);

              return (
                <button
                  key={grant.id}
                  type="button"
                  draggable={!savePending && !grant.isOwner}
                  onDragStart={(e) =>
                    startDrag(e, { type: "grant", id: grant.id })
                  }
                  onDragEnd={endDrag}
                  onDragOver={(e) => {
                    if (dragActive?.type !== "company") return;
                    e.preventDefault();
                    setDropTarget({ type: "grant", id: grant.id });
                  }}
                  onDragLeave={() =>
                    setDropTarget((prev) =>
                      prev?.type === "grant" && prev.id === grant.id
                        ? null
                        : prev,
                    )
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    const source = parseDrag(e) ?? dragActive;
                    if (source?.type === "company") {
                      handleDropOn({ type: "grant", id: grant.id });
                    }
                  }}
                  onMouseEnter={() =>
                    setHovered({ type: "grant", id: grant.id })
                  }
                  onMouseLeave={() => setHovered(null)}
                  onClick={() =>
                    handleNodeClick({ type: "grant", id: grant.id })
                  }
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onOpenUserConfig(grant, organization);
                  }}
                  title="Clique para isolar o fluxo · Duplo clique para editar acessos e senha"
                  style={{
                    left: `${COL_X}px`,
                    top: `${gy - NODE_H / 2}px`,
                    width: `${COL_W}px`,
                    height: `${NODE_H}px`,
                  }}
                  className={`group/grant absolute flex cursor-grab flex-col justify-center rounded-xl border px-3.5 py-2 text-left transition-all active:cursor-grabbing ${
                    isDrop && canDropHere
                      ? "border-positive/60 bg-positive/10 ring-1 ring-positive/40"
                      : isSelected
                        ? "border-foreground/60 bg-surface-elevated shadow-lg ring-1 ring-white/20"
                        : active
                          ? "border-border bg-[#151515] hover:border-white/30"
                          : "border-border-subtle bg-background/40 opacity-35"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] font-semibold text-foreground">
                      {grant.userName}
                    </p>
                    <span
                      className={`shrink-0 rounded border px-1.5 py-0.5 text-[9.5px] font-medium ${
                        elevated
                          ? "border-positive/30 bg-positive/10 text-positive"
                          : "border-border bg-background/70 text-muted-foreground"
                      }`}
                    >
                      {roleTitle}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[10.5px] text-muted">
                    {grant.email}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Desktop horizontal layout
  const maxRows = Math.max(1, companies.length, grants.length);
  const bodyHeight = Math.max(
    180,
    maxRows * NODE_H + Math.max(0, maxRows - 1) * NODE_GAP + PAD * 2,
  );
  const totalHeight = HEADER_H + bodyHeight;
  const totalWidth = 920;

  const COL1_X = 24;
  const COL1_W = 196;
  const GW1_X = 264;
  const COL2_X = 312;
  const COL2_W = 228;
  const GW2_X = 588;
  const COL3_X = 636;
  const COL3_W = 260;

  const centerYForIndex = (index: number, count: number) => {
    if (count <= 0) return HEADER_H + bodyHeight / 2;
    const stackH = count * NODE_H + (count - 1) * NODE_GAP;
    const startY = HEADER_H + (bodyHeight - stackH) / 2;
    return startY + index * (NODE_H + NODE_GAP) + NODE_H / 2;
  };

  const orgCenterY = HEADER_H + bodyHeight / 2;

  const isCompanyActive = (companyId: string) => {
    if (!activeFilter) return true;
    if (activeFilter.type === "company") return activeFilter.id === companyId;
    const grant = grants.find((g) => g.id === activeFilter.id);
    if (!grant) return true;
    return isConnected(grant, companyId, extraLinks);
  };

  const isGrantActive = (grant: AccessGrantSummary) => {
    if (!activeFilter) return true;
    if (activeFilter.type === "grant") return activeFilter.id === grant.id;
    return isConnected(grant, activeFilter.id, extraLinks);
  };

  const isEdgeActive = (companyId: string, grant: AccessGrantSummary) => {
    if (!isConnected(grant, companyId, extraLinks)) return false;
    if (!activeFilter) return true;
    if (activeFilter.type === "company") return activeFilter.id === companyId;
    return activeFilter.id === grant.id;
  };

  const bezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1) * 0.52;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  return (
    <div className="relative overflow-x-auto">
      <div
        className="relative mx-auto select-none"
        style={{ width: `${totalWidth}px`, height: `${totalHeight}px` }}
      >
        <svg
          width={totalWidth}
          height={totalHeight}
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          fill="none"
          className="pointer-events-none absolute inset-0"
        >
          <defs>
            <marker
              id={`arrow-default-${organization.id}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path
                d="M 1 1.5 L 8.5 5 L 1 8.5 z"
                fill="rgba(237,237,237,0.55)"
              />
            </marker>
            <marker
              id={`arrow-positive-${organization.id}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill="#4ade80" />
            </marker>
            <marker
              id={`arrow-muted-${organization.id}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path
                d="M 1 1.5 L 8.5 5 L 1 8.5 z"
                fill="rgba(161,161,161,0.22)"
              />
            </marker>
          </defs>

          <rect
            x="0.5"
            y="0.5"
            width={totalWidth - 1}
            height={totalHeight - 1}
            rx="14"
            fill="rgba(12,12,12,0.55)"
            stroke="rgba(255,255,255,0.08)"
          />
          <line
            x1="0"
            y1={HEADER_H}
            x2={totalWidth}
            y2={HEADER_H}
            stroke="rgba(255,255,255,0.08)"
          />
          <line
            x1={GW1_X}
            y1="0"
            x2={GW1_X}
            y2={totalHeight}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="4 4"
          />
          <line
            x1={GW2_X}
            y1="0"
            x2={GW2_X}
            y2={totalHeight}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="4 4"
          />

          <path
            d={bezierPath(
              COL1_X + COL1_W,
              orgCenterY,
              GW1_X - 12,
              orgCenterY,
            )}
            stroke="rgba(237,237,237,0.5)"
            strokeWidth="1.6"
          />

          {companies.map((company, cIdx) => {
            const cy = centerYForIndex(cIdx, companies.length);
            const active = isCompanyActive(company.id);
            return (
              <path
                key={`org-to-${company.id}`}
                d={bezierPath(GW1_X + 12, orgCenterY, COL2_X, cy)}
                stroke={
                  active
                    ? company.planActive
                      ? "rgba(74,222,128,0.65)"
                      : "rgba(237,237,237,0.45)"
                    : "rgba(255,255,255,0.1)"
                }
                strokeWidth={active ? "1.75" : "1.2"}
                markerEnd={
                  active
                    ? company.planActive
                      ? `url(#arrow-positive-${organization.id})`
                      : `url(#arrow-default-${organization.id})`
                    : `url(#arrow-muted-${organization.id})`
                }
              />
            );
          })}

          {companies.map((company, cIdx) => {
            const cy = centerYForIndex(cIdx, companies.length);
            return grants.map((grant, gIdx) => {
              if (!isConnected(grant, company.id, extraLinks)) return null;

              const gy = centerYForIndex(gIdx, grants.length);
              const active = isEdgeActive(company.id, grant);
              const isAdminEdge = isAdministratorAtCompany(grant, company.id);

              return (
                <path
                  key={`edge-${company.id}-${grant.id}`}
                  d={bezierPath(COL2_X + COL2_W, cy, COL3_X, gy)}
                  stroke={
                    active
                      ? isAdminEdge
                        ? "rgba(74,222,128,0.75)"
                        : "rgba(237,237,237,0.55)"
                      : "rgba(255,255,255,0.08)"
                  }
                  strokeWidth={active ? (isAdminEdge ? "1.9" : "1.5") : "1.1"}
                  strokeDasharray={
                    isDashedCompanyEdge(grant, company.id) ? "5 4" : undefined
                  }
                  markerEnd={
                    active
                      ? isAdminEdge
                        ? `url(#arrow-positive-${organization.id})`
                        : `url(#arrow-default-${organization.id})`
                      : `url(#arrow-muted-${organization.id})`
                  }
                />
              );
            });
          })}

          <g transform={`translate(${GW1_X}, ${orgCenterY})`}>
            <polygon
              points="0,-13 13,0 0,13 -13,0"
              fill="#141414"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1.4"
            />
            <path
              d="M -4 0 H 4 M 0 -4 V 4"
              stroke="rgba(237,237,237,0.8)"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </g>
        </svg>

        <div
          className="absolute inset-x-0 top-0 grid items-center text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted"
          style={{
            height: `${HEADER_H}px`,
            gridTemplateColumns: `${GW1_X}px ${GW2_X - GW1_X}px ${totalWidth - GW2_X}px`,
          }}
        >
          <div className="flex items-center gap-2 px-5">
            <span className="inline-block h-2 w-2 rounded-sm border border-foreground/60 bg-foreground/20" />
            <span>Raia 1 · Organização</span>
          </div>
          <div className="flex items-center gap-2 px-5">
            <span className="inline-block h-2 w-2 rotate-45 border border-positive/70 bg-positive/20" />
            <span>Raia 2 · Empresas ({companies.length})</span>
          </div>
          <div className="flex items-center gap-2 px-5">
            <span className="inline-block h-2 w-2 rounded-sm border border-foreground/60 bg-foreground/20" />
            <span>Raia 3 · Usuários e Pertencimento ({grants.length})</span>
          </div>
        </div>

        <div
          className="absolute flex flex-col justify-center rounded-xl border border-white/20 bg-[#161616] px-3.5 py-2.5 shadow-lg ring-1 ring-white/5"
          style={{
            left: `${COL1_X}px`,
            top: `${orgCenterY - NODE_H / 2}px`,
            width: `${COL1_W}px`,
            height: `${NODE_H}px`,
          }}
        >
          <div className="min-w-0">
            <p className="font-mono text-[9.5px] uppercase tracking-wider text-muted">
              Organização
            </p>
            <p className="truncate text-[13px] font-semibold text-foreground">
              {organization.name}
            </p>
          </div>
          <span
            aria-hidden
            className="absolute -right-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-sm border border-foreground bg-background"
          />
        </div>

        {companies.length === 0 ? (
          <div
            className="absolute flex items-center justify-center rounded-xl border border-dashed border-border bg-background/70 px-3 text-center text-[11.5px] text-muted"
            style={{
              left: `${COL2_X}px`,
              top: `${orgCenterY - NODE_H / 2}px`,
              width: `${COL2_W}px`,
              height: `${NODE_H}px`,
            }}
          >
            Nenhuma empresa cadastrada
          </div>
        ) : (
          companies.map((company, cIdx) => {
            const cy = centerYForIndex(cIdx, companies.length);
            const active = isCompanyActive(company.id);
            const isSelected =
              selected?.type === "company" && selected.id === company.id;
            const isDrop =
              dropTarget?.type === "company" && dropTarget.id === company.id;
            const linkedGrants = grantsForCompany(company, grants, extraLinks);
            const draggingGrant =
              dragActive?.type === "grant"
                ? grants.find((g) => g.id === dragActive.id)
                : undefined;
            const canDropHere =
              draggingGrant != null &&
              !isConnected(draggingGrant, company.id, extraLinks);

            return (
              <button
                key={company.id}
                type="button"
                draggable={!savePending}
                onDragStart={(e) =>
                  startDrag(e, { type: "company", id: company.id })
                }
                onDragEnd={endDrag}
                onDragOver={(e) => {
                  if (dragActive?.type !== "grant") return;
                  e.preventDefault();
                  setDropTarget({ type: "company", id: company.id });
                }}
                onDragLeave={() =>
                  setDropTarget((prev) =>
                    prev?.type === "company" && prev.id === company.id
                      ? null
                      : prev,
                  )
                }
                onDrop={(e) => {
                  e.preventDefault();
                  const source = parseDrag(e) ?? dragActive;
                  if (source?.type === "grant") {
                    handleDropOn({ type: "company", id: company.id });
                  }
                }}
                onMouseEnter={() =>
                  setHovered({ type: "company", id: company.id })
                }
                onMouseLeave={() => setHovered(null)}
                onClick={() =>
                  handleNodeClick({ type: "company", id: company.id })
                }
                style={{
                  left: `${COL2_X}px`,
                  top: `${cy - NODE_H / 2}px`,
                  width: `${COL2_W}px`,
                  height: `${NODE_H}px`,
                }}
                className={`absolute flex cursor-grab flex-col justify-center rounded-xl border px-3.5 py-2 text-left transition-all active:cursor-grabbing ${
                  isDrop && canDropHere
                    ? "border-positive/60 bg-positive/10 ring-1 ring-positive/40"
                    : isSelected
                      ? "border-foreground/60 bg-surface-elevated shadow-lg ring-1 ring-white/20"
                      : active
                        ? "border-border bg-[#151515] hover:border-white/30 hover:bg-surface-elevated"
                        : "border-border-subtle bg-background/40 opacity-35"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute -left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-sm border ${
                    company.planActive
                      ? "border-positive bg-background"
                      : "border-muted bg-background"
                  }`}
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-sm ${
                        company.planActive ? "bg-positive" : "bg-muted/60"
                      }`}
                    />
                    <p className="truncate text-[12.5px] font-semibold text-foreground">
                      {company.name}
                    </p>
                  </div>
                  <span className="shrink-0 rounded border border-border-subtle bg-background/80 px-1.5 py-0.5 font-mono text-[9.5px] text-muted-foreground">
                    {linkedGrants.length} usu.
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <span
                    className={`font-mono text-[10px] ${
                      company.planActive ? "text-positive" : "text-muted"
                    }`}
                  >
                    {company.planActive ? "Plano ativo" : "Gratuito"}
                  </span>
                  <span className="font-mono text-[9.5px] text-muted">
                    Empresa
                  </span>
                </div>

                <span
                  aria-hidden
                  className="absolute -right-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-sm border border-foreground/70 bg-background"
                />
              </button>
            );
          })
        )}

        {grants.length === 0 ? (
          <div
            className="absolute flex items-center justify-center rounded-xl border border-dashed border-border bg-background/70 px-3 text-center text-[11.5px] text-muted"
            style={{
              left: `${COL3_X}px`,
              top: `${orgCenterY - NODE_H / 2}px`,
              width: `${COL3_W}px`,
              height: `${NODE_H}px`,
            }}
          >
            Nenhum usuário vinculado
          </div>
        ) : (
          grants.map((grant, gIdx) => {
            const gy = centerYForIndex(gIdx, grants.length);
            const active = isGrantActive(grant);
            const isSelected =
              selected?.type === "grant" && selected.id === grant.id;
            const isDrop =
              dropTarget?.type === "grant" && dropTarget.id === grant.id;
            const elevated = hasElevatedCompanyAccess(grant);
            const roleTitle = elevated ? "Proprietário" : "Por empresa";
            const scopeSubtitle = grant.isOwner
              ? "Proprietário · Toda a org"
              : elevated
                ? "Proprietário · Admin de empresa"
                : grant.allCompanies
                  ? "Usuário comum · Toda a org"
                  : `Usuário comum · ${
                      grant.companyIds.length +
                      (extraLinks[grant.id]?.length ?? 0)
                    } emp.`;
            const canDropHere =
              dragActive?.type === "company" &&
              !isConnected(grant, dragActive.id, extraLinks);

            return (
              <button
                key={grant.id}
                type="button"
                draggable={!savePending && !grant.isOwner}
                onDragStart={(e) =>
                  startDrag(e, { type: "grant", id: grant.id })
                }
                onDragEnd={endDrag}
                onDragOver={(e) => {
                  if (dragActive?.type !== "company") return;
                  e.preventDefault();
                  setDropTarget({ type: "grant", id: grant.id });
                }}
                onDragLeave={() =>
                  setDropTarget((prev) =>
                    prev?.type === "grant" && prev.id === grant.id
                      ? null
                      : prev,
                  )
                }
                onDrop={(e) => {
                  e.preventDefault();
                  const source = parseDrag(e) ?? dragActive;
                  if (source?.type === "company") {
                    handleDropOn({ type: "grant", id: grant.id });
                  }
                }}
                onMouseEnter={() =>
                  setHovered({ type: "grant", id: grant.id })
                }
                onMouseLeave={() => setHovered(null)}
                onClick={() =>
                  handleNodeClick({ type: "grant", id: grant.id })
                }
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onOpenUserConfig(grant, organization);
                }}
                title="Clique para isolar o fluxo · Duplo clique para editar acessos e senha"
                style={{
                  left: `${COL3_X}px`,
                  top: `${gy - NODE_H / 2}px`,
                  width: `${COL3_W}px`,
                  height: `${NODE_H}px`,
                }}
                className={`group/grant absolute flex cursor-grab flex-col justify-center rounded-xl border px-3.5 py-2 text-left transition-all active:cursor-grabbing ${
                  isDrop && canDropHere
                    ? "border-positive/60 bg-positive/10 ring-1 ring-positive/40"
                    : isSelected
                      ? "border-foreground/60 bg-surface-elevated shadow-lg ring-1 ring-white/20"
                      : active
                        ? "border-border bg-[#151515] hover:border-white/30 hover:bg-surface-elevated"
                        : "border-border-subtle bg-background/40 opacity-35"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute -left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-sm border ${
                    elevated
                      ? "border-positive bg-positive/25"
                      : "border-foreground bg-background"
                  }`}
                />

                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[12px] font-semibold text-foreground">
                    {grant.userName}
                  </p>
                  <span
                    className={`shrink-0 rounded border px-1.5 py-0.5 text-[9.5px] font-medium ${
                      elevated
                        ? "border-positive/30 bg-positive/10 text-positive"
                        : "border-border bg-background/70 text-muted-foreground"
                    }`}
                  >
                    {roleTitle}
                  </span>
                </div>

                <p className="mt-0.5 truncate font-mono text-[10.5px] text-muted">
                  {grant.email} · {scopeSubtitle}
                </p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function OrganizationFlowPanel({
  organization,
  allOrganizations,
  defaultShowAll = false,
  allowOwnerRole = false,
}: {
  organization: OrganizationSummary;
  allOrganizations?: OrganizationSummary[];
  defaultShowAll?: boolean;
  allowOwnerRole?: boolean;
  showFooter?: boolean;
}) {
  const router = useRouter();
  const [showAllOrgs, setShowAllOrgs] = useState(defaultShowAll);
  const [extraLinks, setExtraLinks] = useState<Record<string, string[]>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<{
    grant: AccessGrantSummary;
    organization: OrganizationSummary;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setExtraLinks({});
  }, [organization.id]);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const displayedOrgs =
    showAllOrgs && allOrganizations && allOrganizations.length > 0
      ? allOrganizations
      : [organization];

  const handleAssociate = (companyId: string, grantId: string) => {
    const grant = organization.grants.find((g) => g.id === grantId);
    if (!grant) return;
    if (isConnected(grant, companyId, extraLinks)) {
      setSaveStatus("saved");
      setSaveError(null);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 1800);
      return;
    }

    setExtraLinks((prev) => ({
      ...prev,
      [grantId]: [...(prev[grantId] ?? []), companyId],
    }));
    setSaveStatus("saving");
    setSaveError(null);

    startTransition(async () => {
      const result = await associateCompanyWithUserInFlow({
        organizationId: organization.id,
        companyId,
        grantId,
      });

      if (!result.ok) {
        setExtraLinks((prev) => ({
          ...prev,
          [grantId]: (prev[grantId] ?? []).filter((id) => id !== companyId),
        }));
        setSaveStatus("error");
        setSaveError(result.error ?? "Não foi possível salvar a associação.");
        return;
      }

      setSaveStatus("saved");
      router.refresh();
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2200);
    });
  };

  const statusLabel =
    saveStatus === "saving" || isPending
      ? "Salvando…"
      : saveStatus === "saved"
        ? "Salvo"
        : saveStatus === "error"
          ? saveError ?? "Erro ao salvar"
          : null;

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div>
      
          <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">
            {showAllOrgs
              ? `Arquitetura de todas as organizações (${displayedOrgs.length})`
              : `Arquitetura: ${organization.name}`}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-3 rounded-lg border border-border-subtle bg-background/50 px-3 py-1.5 text-[11px] text-muted-foreground sm:flex">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-positive" />
              <span>Administrador</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-foreground/60" />
              <span>Analista (Total)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 border-t border-dashed border-foreground/60" />
              <span>Analista (Específico)</span>
            </span>
          </div>

          {allOrganizations && allOrganizations.length > 1 && (
            <button
              type="button"
              onClick={() => setShowAllOrgs((prev) => !prev)}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[11.5px] font-medium transition ${
                showAllOrgs
                  ? "border-foreground/40 bg-surface-elevated text-foreground"
                  : "border-border bg-background/70 text-muted-foreground hover:border-white/25 hover:text-foreground"
              }`}
            >
              {showAllOrgs
                ? `Focar em ${organization.name}`
                : `Exibir todas (${allOrganizations.length})`}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 bg-[radial-gradient(#252525_1px,transparent_1px)] [background-size:16px_16px] p-5">
        {displayedOrgs.map((org) => (
          <div key={org.id} className="space-y-2">
            {displayedOrgs.length > 1 && (
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-[11px] font-medium text-foreground">
                  Organização: {org.name}
                </span>
                <span className="font-mono text-[10.5px] text-muted">
                  {org.companies.length} empresa(s) · {org.grants.length}{" "}
                  usuário(s)
                </span>
              </div>
            )}
            <SingleOrganizationBpmnDiagram
              organization={org}
              extraLinks={org.id === organization.id ? extraLinks : {}}
              onAssociate={
                org.id === organization.id ? handleAssociate : () => undefined
              }
              onOpenUserConfig={(grant, targetOrg) =>
                setEditingUser({ grant, organization: targetOrg })
              }
              savePending={isPending || saveStatus === "saving"}
            />
          </div>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <p className="text-[11.5px] text-muted">
            Arraste uma <strong>empresa</strong> até um{" "}
            <strong>usuário</strong> (ou o contrário) para associar. Clique
            para isolar o fluxo ou dê <strong>duplo clique no usuário</strong>{" "}
            para editar acessos, papel e redefinir senha.
          </p>
          <p
            aria-live="polite"
            className={`min-h-[1.25rem] font-mono text-[11.5px] ${
              saveStatus === "saving" || isPending
                ? "text-muted-foreground"
                : saveStatus === "saved"
                  ? "text-positive"
                  : saveStatus === "error"
                    ? "text-negative"
                    : "text-transparent"
            }`}
          >
            {statusLabel ?? "—"}
          </p>
        </div>
      </div>

      {editingUser && (
        <UserConfigModal
          grant={
            (
              displayedOrgs
                .find((o) => o.id === editingUser.organization.id)
                ?.grants.find((g) => g.id === editingUser.grant.id) ??
              editingUser.grant
            )
          }
          organization={
            displayedOrgs.find((o) => o.id === editingUser.organization.id) ??
            editingUser.organization
          }
          allowOwnerRole={allowOwnerRole}
          onClose={() => setEditingUser(null)}
        />
      )}
    </section>
  );
}
