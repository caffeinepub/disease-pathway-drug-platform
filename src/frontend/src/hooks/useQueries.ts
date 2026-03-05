import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DatabaseStatus, SearchHistoryEntry } from "../backend.d.ts";
import {
  type DiseaseResultWithLiterature,
  searchDiseaseFromAPIs,
} from "../services/diseaseSearch";
import { useActor } from "./useActor";

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
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSearchHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchDisease() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<DiseaseResultWithLiterature, Error, string>({
    mutationFn: async (diseaseName: string) => {
      const result = await searchDiseaseFromAPIs(diseaseName);
      // fire-and-forget history storage via backend
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
