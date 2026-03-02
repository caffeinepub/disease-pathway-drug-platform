import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DatabaseStatus,
  DiseaseResult,
  SearchHistoryEntry,
} from "../backend.d.ts";
import { useActor } from "./useActor";

export function useDatabaseStatus() {
  const { actor, isFetching } = useActor();
  return useQuery<DatabaseStatus>({
    queryKey: ["databaseStatus"],
    queryFn: async () => {
      if (!actor) {
        return {
          drugbank: false,
          kegg: false,
          ncbi: false,
          pubchem: false,
          uniprot: false,
        };
      }
      return actor.getDatabaseStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
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

  return useMutation<DiseaseResult, Error, string>({
    mutationFn: async (diseaseName: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.searchDisease(diseaseName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchHistory"] });
    },
  });
}
