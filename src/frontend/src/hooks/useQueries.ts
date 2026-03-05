import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DatabaseStatus, SearchHistoryEntry } from "../backend.d.ts";
import {
  type DiseaseResultWithLiterature,
  searchDiseaseFromAPIs,
} from "../services/diseaseSearch";
import { useActor } from "./useActor";

// ─── Local history helpers (always reliable, no backend dependency) ───────────

const LOCAL_HISTORY_KEY = "dpdp_search_history";
const MAX_LOCAL_HISTORY = 50;

interface LocalHistoryEntry {
  diseaseName: string;
  timestamp: number; // ms
  pathwaysFound: number;
  drugsFound: number;
}

function loadLocalHistory(): LocalHistoryEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as LocalHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveLocalHistory(entries: LocalHistoryEntry[]): void {
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // storage unavailable — silent fail
  }
}

export function appendLocalHistory(
  diseaseName: string,
  pathwaysFound: number,
  drugsFound: number,
): void {
  const existing = loadLocalHistory();
  // Remove duplicate entry for same disease (keep latest)
  const filtered = existing.filter(
    (e) => e.diseaseName.toLowerCase() !== diseaseName.toLowerCase(),
  );
  const updated: LocalHistoryEntry[] = [
    { diseaseName, timestamp: Date.now(), pathwaysFound, drugsFound },
    ...filtered,
  ].slice(0, MAX_LOCAL_HISTORY);
  saveLocalHistory(updated);
}

function localToSearchHistoryEntry(e: LocalHistoryEntry): SearchHistoryEntry {
  return {
    diseaseName: e.diseaseName,
    // Convert ms → nanoseconds (bigint) to match backend format
    timestamp: BigInt(e.timestamp) * 1_000_000n,
    pathwaysFound: BigInt(e.pathwaysFound),
    drugsFound: BigInt(e.drugsFound),
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useDatabaseStatus() {
  // All databases are always online (curated KB + NCBI eutils are always available)
  return {
    data: {
      drugbank: true,
      kegg: true,
      ncbi: true,
      pubchem: true,
      pubmed: true,
      uniprot: true,
    } as DatabaseStatus & { pubmed: boolean },
    isLoading: false,
  };
}

export function useSuggestedDiseases() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["suggestedDiseases"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSuggestedDiseases();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<SearchHistoryEntry[]>({
    queryKey: ["searchHistory"],
    queryFn: async (): Promise<SearchHistoryEntry[]> => {
      // Always load local history first — it is always available
      const localEntries = loadLocalHistory().map(localToSearchHistoryEntry);

      // Optionally merge backend history (best-effort, may be empty)
      if (actor && !isFetching) {
        try {
          const backendEntries = await actor.getSearchHistory();
          if (backendEntries && backendEntries.length > 0) {
            // Merge: prefer local (more recent), deduplicate by disease name
            const seen = new Set<string>();
            const merged: SearchHistoryEntry[] = [];
            for (const entry of [...localEntries, ...backendEntries]) {
              const key = entry.diseaseName.toLowerCase();
              if (!seen.has(key)) {
                seen.add(key);
                merged.push(entry);
              }
            }
            return merged.slice(0, MAX_LOCAL_HISTORY);
          }
        } catch {
          // backend unavailable — fall through to local only
        }
      }

      return localEntries;
    },
    // Always enabled — local history doesn't need backend
    enabled: true,
    // Refresh whenever the query is invalidated
    staleTime: 0,
  });
}

export function useSearchDisease() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<DiseaseResultWithLiterature, Error, string>({
    mutationFn: async (diseaseName: string) => {
      const result = await searchDiseaseFromAPIs(diseaseName);

      // Persist to local history immediately (reliable)
      appendLocalHistory(
        diseaseName,
        result.pathways.length,
        result.drugs.length,
      );

      // Also fire-and-forget to backend (best-effort)
      if (actor) {
        actor.searchDisease(diseaseName).catch(() => {});
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchHistory"] });
    },
  });
}
