"use client";
import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { MockDatabase } from "@/features/mock-data/types/mock-database";
import { mockDataSnapshot, readMockDatabase, subscribeMockData } from "@/features/mock-data/services/mock-data-store";

type MockDataState = { data: MockDatabase | null; loading: boolean; error: string };
const Context = createContext<MockDataState | null>(null);
const serverSnapshot = () => undefined;
export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore<string | undefined>(subscribeMockData, mockDataSnapshot, serverSnapshot);
  const state = useMemo<MockDataState>(() => {
    if (raw === undefined) return { data: null, loading: true, error: "" };
    try { return { data: readMockDatabase(), loading: false, error: "" }; }
    catch (cause) { return { data: null, loading: false, error: cause instanceof Error ? cause.message : "Unable to read mock data." }; }
  }, [raw]);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
export function useMockData(): MockDataState {
  const context = useContext(Context);
  if (!context) throw new Error("useMockData requires MockDataProvider.");
  return context;
}
