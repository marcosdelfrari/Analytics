import { AppShell } from "@/app/components/app-shell";
import { Skeleton, SkeletonScreenReader } from "@/app/components/skeleton";

export function DashboardLoadingFallback() {
  return (
    <AppShell mode="client" title="" subtitle="" headerSkeleton>
      <SkeletonScreenReader label="Carregando dashboard" />
      <div className="pointer-events-none space-y-6" aria-hidden>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="border border-border bg-surface p-4"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-7 w-28" />
            </div>
          ))}
        </div>
        <div className="border border-border bg-surface p-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-56 max-w-full" />
          <Skeleton className="mt-6 h-44 w-full" />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="border border-border bg-surface p-4"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-4 h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export function ReportsLoadingFallback() {
  return (
    <AppShell mode="client" title="" subtitle="" headerSkeleton>
      <SkeletonScreenReader label="Carregando relatórios" />
      <div className="pointer-events-none space-y-4" aria-hidden>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-6 w-52 max-w-full" />
        <Skeleton className="h-9 w-56" />
        <div className="border border-border bg-surface p-4">
          <Skeleton className="h-4 w-28" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-full" />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export function CampaignsLoadingFallback() {
  return (
    <AppShell mode="client" title="" subtitle="" headerSkeleton>
      <SkeletonScreenReader label="Carregando campanhas" />
      <div className="pointer-events-none space-y-4" aria-hidden>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-64 max-w-full" />
        <Skeleton className="h-9 w-56" />
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border border-border bg-surface px-4 py-4"
          >
            <Skeleton className="h-4 w-48" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-[80%]" />
            <Skeleton className="mt-4 h-16 w-full" />
          </div>
        ))}
      </div>
    </AppShell>
  );
}

export function AdminLoadingFallback() {
  return (
    <AppShell mode="admin" title="" subtitle="" headerSkeleton>
      <SkeletonScreenReader label="Carregando painel" />
      <div className="pointer-events-none grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="border border-border bg-surface p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-9 w-full" />
            <Skeleton className="mt-2 h-9 w-full" />
          </div>
          <div className="border border-border bg-surface p-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="mb-2 h-14 w-full last:mb-0" />
            ))}
          </div>
        </div>
        <div className="border border-border bg-surface p-6">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-6 h-64 w-full" />
        </div>
      </div>
    </AppShell>
  );
}

export function EncurtadorLoadingFallback() {
  return (
    <AppShell mode="admin" title="" subtitle="" headerSkeleton>
      <SkeletonScreenReader label="Carregando encurtador" />
      <div className="pointer-events-none grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="border border-border bg-surface p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-9 w-full" />
          <Skeleton className="mt-2 h-9 w-full" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>
        <div className="border border-border bg-surface p-4">
          <Skeleton className="h-4 w-20" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="mt-4 h-20 w-full" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export function RastreamentoLoadingFallback() {
  return (
    <AppShell mode="admin" title="" subtitle="" headerSkeleton>
      <SkeletonScreenReader label="Carregando script" />
      <div className="pointer-events-none space-y-6" aria-hidden>
        <div className="border border-border bg-surface p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-3 w-72 max-w-full" />
          <Skeleton className="mt-4 h-16 w-full" />
        </div>
        <div className="border border-border bg-surface p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-10 w-full" />
        </div>
      </div>
    </AppShell>
  );
}

export function ParametrosLoadingFallback() {
  return (
    <AppShell mode="admin" title="" subtitle="" headerSkeleton>
      <SkeletonScreenReader label="Carregando parâmetros" />
      <div className="pointer-events-none border border-border bg-surface p-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-64 max-w-full" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
        <Skeleton className="mt-6 h-24 w-full" />
      </div>
    </AppShell>
  );
}
