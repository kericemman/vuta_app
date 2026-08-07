import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { CategoryScroller } from "../../src/components/marketplace/CategoryScroller";
import { ProviderCard } from "../../src/components/marketplace/ProviderCard";
import { SectionHeader } from "../../src/components/marketplace/SectionHeader";
import { ServiceCard } from "../../src/components/marketplace/ServiceCard";
import { Screen } from "../../src/components/Screen";
import {
  sampleProviders,
  sampleServices,
  serviceCategories,
} from "../../src/constants/marketplace";
import { colors, radii, spacing } from "../../src/constants/theme";
import { useDebouncedValue } from "../../src/hooks/useDebouncedValue";
import { useMarketplaceLocation } from "../../src/hooks/useMarketplaceLocation";
import {
  canSaveProvider,
  useSavedProviders,
} from "../../src/hooks/useSavedProviders";
import {
  listProviders,
  listServices,
} from "../../src/services/marketplace.service";
import {
  filterProviders,
  filterServices,
} from "../../src/utils/marketplace";
import { getGridItemPercentWidth } from "../../src/utils/responsiveGrid";

const EXPLORE_LIMIT = 20;

const openProviderDetails = (providerId: string) =>
  router.push({
    pathname: "/(client)/providers/[id]",
    params: { id: providerId },
  });

export default function ExploreScreen() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const debouncedQuery = useDebouncedValue(query.trim());
  const hasFilters = Boolean(debouncedQuery || selectedCategory);
  const marketplaceLocation = useMarketplaceLocation();
  const { isSavedProvider, isSavingProvider, toggleSavedProvider } =
    useSavedProviders();

  const providersQuery = useQuery({
    queryKey: [
      "explore-providers",
      debouncedQuery,
      selectedCategory,
      marketplaceLocation.params,
    ],
    queryFn: () =>
      listProviders({
        ...marketplaceLocation.params,
        category: selectedCategory,
        limit: EXPLORE_LIMIT,
        q: debouncedQuery,
      }),
    retry: 1,
    staleTime: 60_000,
  });

  const servicesQuery = useQuery({
    queryKey: [
      "explore-services",
      debouncedQuery,
      selectedCategory,
      marketplaceLocation.params,
    ],
    queryFn: () =>
      listServices({
        ...marketplaceLocation.params,
        category: selectedCategory,
        limit: EXPLORE_LIMIT,
        q: debouncedQuery,
      }),
    retry: 1,
    staleTime: 60_000,
  });

  const providers = useMemo(() => {
    if (providersQuery.data?.length) {
      return providersQuery.data;
    }

    return __DEV__
      ? filterProviders(sampleProviders, debouncedQuery, selectedCategory)
      : [];
  }, [debouncedQuery, providersQuery.data, selectedCategory]);

  const services = useMemo(() => {
    if (servicesQuery.data?.length) {
      return servicesQuery.data;
    }

    return __DEV__
      ? filterServices(sampleServices, debouncedQuery, selectedCategory)
      : [];
  }, [debouncedQuery, selectedCategory, servicesQuery.data]);

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory(undefined);
  };
  const providerCardWidth = getGridItemPercentWidth(2);

  if (providersQuery.isLoading || servicesQuery.isLoading) {
    return (
      <LoadingScreen
        label="Searching marketplace..."
        showBackButton
        size={82}
      />
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>
          {marketplaceLocation.isUsingDeviceLocation
            ? "Explore nearby"
            : "Explore services"}
        </Text>
        <Text style={styles.subtitle}>
          Search approved professionals and businesses, compare prices, and find the right beauty service.
        </Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          autoCapitalize="none"
          onChangeText={setQuery}
          placeholder="Search hair, makeup, nails, spa"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          value={query}
        />
        <Pressable
          disabled={!hasFilters}
          onPress={clearFilters}
          style={[
            styles.filterButton,
            hasFilters ? styles.activeFilterButton : null,
          ]}
        >
          <Text
            style={[
              styles.filterText,
              hasFilters ? styles.activeFilterText : null,
            ]}
          >
            {hasFilters ? "Clear" : "Filter"}
          </Text>
        </Pressable>
      </View>

      <CategoryScroller
        categories={serviceCategories}
        onSelect={setSelectedCategory}
        selectedCategory={selectedCategory}
      />

      <SectionHeader title="Beauty profiles" />
      {providers.length ? (
        <View style={styles.grid}>
          {providers.map((provider) => (
            <ProviderCard
              key={provider._id}
              onPress={() => openProviderDetails(provider._id)}
              provider={provider}
              style={{ width: providerCardWidth }}
            />
          ))}
        </View>
      ) : (
        <EmptyState message="No beauty profiles match this search yet." />
      )}

      <SectionHeader title="Services" />
      {services.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.serviceRail}>
            {services.map((service) => {
              const providerId = service.provider?._id;

              return (
                <ServiceCard
                  isSaved={isSavedProvider(providerId)}
                  isSaving={isSavingProvider(providerId)}
                  key={service._id}
                  onPress={() =>
                    router.push({
                      pathname: "/(client)/services/[id]",
                      params: { id: service._id },
                    })
                  }
                  onToggleSave={() => toggleSavedProvider(providerId)}
                  saveDisabled={!canSaveProvider(providerId)}
                  service={service}
                />
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <EmptyState message="No services match this search yet." />
      )}
    </Screen>
  );
}

type EmptyStateProps = {
  message: string;
};

function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  searchRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 58,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    minHeight: 54,
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 24,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  activeFilterText: {
    color: colors.surface,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
  },
  serviceRail: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  emptyState: {
    paddingVertical: spacing.sm,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
