import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BackButton } from "../../../src/components/BackButton";
import { LogoLoader } from "../../../src/components/BrandLogo";
import { LoadingScreen } from "../../../src/components/LoadingScreen";
import { BusinessTeamRail } from "../../../src/components/marketplace/BusinessTeamRail";
import { PortfolioGrid } from "../../../src/components/marketplace/PortfolioGrid";
import { SectionHeader } from "../../../src/components/marketplace/SectionHeader";
import { ServiceCard } from "../../../src/components/marketplace/ServiceCard";
import { Screen } from "../../../src/components/Screen";
import { colors, radii, spacing } from "../../../src/constants/theme";
import {
  canSaveProvider,
  useSavedProviders,
} from "../../../src/hooks/useSavedProviders";
import { getApiErrorMessage } from "../../../src/services/api";
import { startConversation } from "../../../src/services/message.service";
import {
  getProviderById,
  listProviderEmployees,
} from "../../../src/services/marketplace.service";
import { listProviderReviews } from "../../../src/services/review.service";
import { ProviderSummary, ServiceSummary } from "../../../src/types/marketplace";
import { Review } from "../../../src/types/review";
import {
  formatDistance,
  getInitials,
  getLocationLabel,
  getProviderCategory,
  getProviderImage,
  getProviderName,
} from "../../../src/utils/marketplace";

export default function ClientProviderDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const providerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const queryClient = useQueryClient();
  const { isSavedProvider, isSavingProvider, toggleSavedProvider } =
    useSavedProviders();

  const providerQuery = useQuery({
    enabled: Boolean(providerId),
    queryKey: ["provider-details", providerId],
    queryFn: () => getProviderById(providerId || ""),
    retry: 1,
  });

  const reviewsQuery = useQuery({
    enabled: Boolean(providerId),
    queryKey: ["provider-reviews", providerId],
    queryFn: () => listProviderReviews(providerId || "", 3),
    retry: 1,
  });

  const employeesQuery = useQuery({
    enabled: Boolean(
      providerId && providerQuery.data?.provider?.accountType === "business"
    ),
    queryKey: ["provider-employees", providerId, "public-profile"],
    queryFn: () => listProviderEmployees(providerId || ""),
    retry: 1,
    staleTime: 60_000,
  });

  const messageMutation = useMutation({
    mutationFn: () => {
      if (!providerId) {
        throw new Error("This profile is not ready for messaging.");
      }

      return startConversation({ providerId });
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/(client)/chat/${conversation._id}`);
    },
  });

  if (providerQuery.isLoading) {
    return (
      <LoadingScreen label="Opening profile..." showBackButton size={82} />
    );
  }

  const provider = providerQuery.data?.provider;
  const services = providerQuery.data?.services ?? [];

  if (!provider) {
    return (
      <Screen fixedHeader={<BackButton label="Back" />}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Profile unavailable</Text>
          <Text style={styles.emptyText}>
            This profile may be inactive or waiting for approval.
          </Text>
        </View>
      </Screen>
    );
  }

  const providerName = getProviderName(provider);
  const imageUrl = getProviderImage(provider);
  const location = getLocationLabel(provider);
  const distance = formatDistance(provider.distanceKm);
  const isBusiness = provider.accountType === "business";
  const saveDisabled = !canSaveProvider(provider._id);
  const portfolio = isBusiness ? [] : provider.portfolio ?? [];
  const saved = isSavedProvider(provider._id);
  const saving = isSavingProvider(provider._id);
  const messageError = messageMutation.error
    ? getApiErrorMessage(messageMutation.error)
    : "";

  return (
    <Screen fixedHeader={<BackButton label="Back" />}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.heroImage} />
      ) : (
        <View style={styles.heroFallback}>
          <Text style={styles.heroFallbackText}>{getInitials(providerName)}</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <Text style={styles.eyebrow}>
              {isBusiness ? "Beauty business" : "Beauty professional"}
            </Text>
            <Text style={styles.title}>{providerName}</Text>
            <Text style={styles.subtitle}>
              {getProviderCategory(provider)}
              {location ? ` · ${location}` : ""}
            </Text>
          </View>
          <View style={styles.ratingPill}>
            <Ionicons color={colors.premium} name="star" size={15} />
            <Text style={styles.ratingText}>
              {(provider.averageRating || 0).toFixed(1)}
            </Text>
          </View>
        </View>

        {provider.bio ? <Text style={styles.bio}>{provider.bio}</Text> : null}

        <View style={styles.actionRow}>
          <Pressable
            disabled={saveDisabled || saving}
            onPress={() => toggleSavedProvider(provider._id)}
            style={({ pressed }) => [
              styles.actionButton,
              saved ? styles.savedButton : null,
              pressed && !saving ? styles.pressedButton : null,
              saveDisabled ? styles.disabledButton : null,
            ]}
          >
            <Ionicons
              color={saved ? colors.surface : colors.primary}
              name={saved ? "heart" : "heart-outline"}
              size={17}
            />
            <Text style={[styles.actionText, saved ? styles.savedText : null]}>
              {saved ? "Saved" : saving ? "Saving" : "Save"}
            </Text>
          </Pressable>

          <Pressable
            disabled={messageMutation.isPending}
            onPress={() => messageMutation.mutate()}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && !messageMutation.isPending ? styles.pressedButton : null,
            ]}
          >
            <Ionicons color={colors.primary} name="chatbubble-outline" size={17} />
            <Text style={styles.actionText}>
              {messageMutation.isPending ? "Opening" : "Message"}
            </Text>
          </Pressable>
        </View>

        {messageError ? <Text style={styles.error}>{messageError}</Text> : null}
      </View>

      <View style={styles.statsRow}>
        <StatCard
          label="Reviews"
          value={String(provider.reviewCount || 0)}
        />
        <StatCard label="Services" value={String(services.length)} />
        <StatCard
          label="Distance"
          value={distance || (provider.city ? provider.city : "Open")}
        />
      </View>

      {!isBusiness ? (
        <View style={styles.section}>
          <SectionHeader title="Portfolio" />
          <PortfolioGrid
            emptyMessage="This professional has not uploaded portfolio work yet."
            images={portfolio}
            showEmpty
          />
        </View>
      ) : null}

      {isBusiness ? (
        <View style={styles.section}>
          <SectionHeader title="Team" />
          {employeesQuery.isLoading ? (
            <View style={styles.inlineLoader}>
              <LogoLoader label="Loading team..." size={28} />
            </View>
          ) : employeesQuery.data?.length ? (
            <BusinessTeamRail
              employees={employeesQuery.data}
              onEmployeePress={(employeeId) =>
                router.push({
                  pathname: "/(client)/providers/[id]/team/[employeeId]",
                  params: {
                    employeeId,
                    id: provider._id,
                  },
                })
              }
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Team coming soon</Text>
              <Text style={styles.emptyText}>
                This business has not added public team members yet.
              </Text>
            </View>
          )}
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader
          title={isBusiness ? "Services by this business" : "Services"}
        />
        {services.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.serviceRail}>
              {services.map((service) => (
                <ServiceCard
                  isSaved={saved}
                  isSaving={saving}
                  key={service._id}
                  onPress={() =>
                    router.push({
                      pathname: "/(client)/services/[id]",
                      params: { id: service._id },
                    })
                  }
                  onToggleSave={() => toggleSavedProvider(provider._id)}
                  saveDisabled={saveDisabled}
                  service={attachProvider(service, provider)}
                />
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No services yet</Text>
            <Text style={styles.emptyText}>
              This profile is visible, but services have not been added.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Reviews" />
        {reviewsQuery.isLoading ? (
          <View style={styles.inlineLoader}>
            <LogoLoader label="Loading reviews..." size={28} />
          </View>
        ) : reviewsQuery.data?.length ? (
          <View style={styles.reviewList}>
            {reviewsQuery.data.map((review) => (
              <ReviewSnippet key={review._id} review={review} />
            ))}
          </View>
        ) : (
          <Text style={styles.bio}>
            No reviews yet. Completed bookings will build this profile's rating.
          </Text>
        )}
      </View>
    </Screen>
  );
}

function attachProvider(service: ServiceSummary, provider: ProviderSummary) {
  return {
    ...service,
    provider,
  };
}

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text numberOfLines={1} style={styles.statValue}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

function ReviewSnippet({ review }: { review: Review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text numberOfLines={1} style={styles.reviewClient}>
          {review.client?.name || "Client"}
        </Text>
        <View style={styles.reviewStars}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Ionicons
              color={value <= review.rating ? colors.premium : colors.border}
              key={value}
              name={value <= review.rating ? "star" : "star-outline"}
              size={14}
            />
          ))}
        </View>
      </View>
      {review.comment ? (
        <Text style={styles.reviewText}>{review.comment}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    aspectRatio: 1.22,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.lg,
    width: "100%",
  },
  heroFallback: {
    alignItems: "center",
    aspectRatio: 1.22,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    justifyContent: "center",
    width: "100%",
  },
  heroFallbackText: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: "900",
  },
  header: {
    gap: spacing.sm,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  titleCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  ratingPill: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  ratingText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  bio: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 44,
  },
  savedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressedButton: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  disabledButton: {
    opacity: 0.45,
  },
  actionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  savedText: {
    color: colors.surface,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    gap: 3,
    minHeight: 70,
    padding: spacing.sm,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    gap: spacing.sm,
  },
  serviceRail: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  inlineLoader: {
    alignItems: "flex-start",
  },
  reviewList: {
    gap: spacing.sm,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  reviewHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  reviewClient: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
