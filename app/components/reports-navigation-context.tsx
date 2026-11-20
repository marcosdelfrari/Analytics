"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";

type ReportsNavigationContextValue = {
  navigationPending: boolean;
  beginNavigation: () => void;
};

const ReportsNavigationContext =
  createContext<ReportsNavigationContextValue | null>(null);

export function ReportsNavigationProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [navigationPending, setNavigationPending] = useState(false);

  useEffect(() => {
    setNavigationPending(false);
  }, [query]);

  const value = useMemo(
    () => ({
      navigationPending,
      beginNavigation: () => setNavigationPending(true),
    }),
    [navigationPending],
  );

  return (
    <ReportsNavigationContext.Provider value={value}>
      {children}
    </ReportsNavigationContext.Provider>
  );
}

const fallbackNavigation: ReportsNavigationContextValue = {
  navigationPending: false,
  beginNavigation: () => {},
};

export function useReportsNavigation() {
  return useContext(ReportsNavigationContext) ?? fallbackNavigation;
}
