import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  addFavourite,
  listFavourites,
  removeFavourite,
} from "../services/marketplace.service";
import { FavouriteSummary } from "../types/marketplace";

const SAVED_PROVIDERS_QUERY_KEY = ["client-favourites"] as const;
const mongoObjectIdPattern = /^[a-f\d]{24}$/i;

export const canSaveProvider = (providerId?: string): providerId is string =>
  Boolean(providerId && mongoObjectIdPattern.test(providerId));

export function useSavedProviders() {
  const queryClient = useQueryClient();

  const favouritesQuery = useQuery({
    queryKey: SAVED_PROVIDERS_QUERY_KEY,
    queryFn: () => listFavourites({ limit: 100 }),
    retry: 1,
    staleTime: 60_000,
  });

  const savedProviderIds = useMemo(
    () =>
      new Set(
        (favouritesQuery.data ?? [])
          .map((favourite) => favourite.provider?._id)
          .filter(Boolean)
      ),
    [favouritesQuery.data]
  );

  const toggleMutation = useMutation({
    mutationFn: async ({
      isSaved,
      providerId,
    }: {
      isSaved: boolean;
      providerId: string;
    }) => {
      if (isSaved) {
        await removeFavourite(providerId);
        return;
      }

      await addFavourite(providerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_PROVIDERS_QUERY_KEY });
    },
  });

  const toggleSavedProvider = (providerId?: string) => {
    if (!canSaveProvider(providerId)) {
      return;
    }

    toggleMutation.mutate({
      isSaved: savedProviderIds.has(providerId),
      providerId,
    });
  };

  const isSavingProvider = (providerId?: string) =>
    Boolean(
      providerId &&
        toggleMutation.isPending &&
        toggleMutation.variables?.providerId === providerId
    );

  return {
    favourites: (favouritesQuery.data ?? []) as FavouriteSummary[],
    isLoading: favouritesQuery.isLoading,
    isSavedProvider: (providerId?: string) =>
      Boolean(providerId && savedProviderIds.has(providerId)),
    isSavingProvider,
    toggleSavedProvider,
  };
}
