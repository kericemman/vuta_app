import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { DashboardCard } from "../../src/components/DashboardCard";
import { LogoLoader } from "../../src/components/BrandLogo";
import { LoadingScreen } from "../../src/components/LoadingScreen";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { TextField } from "../../src/components/TextField";
import { providerCategories } from "../../src/constants/provider";
import { colors, radii, spacing } from "../../src/constants/theme";
import { getApiErrorMessage } from "../../src/services/api";
import {
  createProviderService,
  deactivateProviderService,
  getBusinessStats,
  getMyProviderProfileStatus,
  listMyBookings,
  listMyServices,
  updateProviderService,
  uploadServiceImage,
} from "../../src/services/provider.service";
import { ServiceSummary } from "../../src/types/marketplace";
import { ProviderBooking } from "../../src/types/provider";
import { formatMoney } from "../../src/utils/provider";

type TopServiceMetric = {
  bookings: number;
  category?: string;
  currency?: string;
  name: string;
  revenue: number;
  serviceId: string;
};

export default function ProviderServicesScreen() {
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ action?: string; intent?: string }>();
  const action = Array.isArray(params.action) ? params.action[0] : params.action;
  const intent = Array.isArray(params.intent) ? params.intent[0] : params.intent;
  const [category, setCategory] = useState("Hair");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(action === "add");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [serviceImage, setServiceImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [serviceImageUrl, setServiceImageUrl] = useState("");

  const profileQuery = useQuery({
    queryKey: ["provider-profile"],
    queryFn: getMyProviderProfileStatus,
  });

  const profile = profileQuery.data ?? null;
  const isBusinessProfile = profile?.accountType === "business";

  const servicesQuery = useQuery({
    queryKey: ["provider-services"],
    queryFn: listMyServices,
    enabled: Boolean(profile),
  });

  const businessStatsQuery = useQuery({
    queryKey: ["business-stats"],
    queryFn: getBusinessStats,
    enabled: Boolean(isBusinessProfile),
  });

  const bookingsQuery = useQuery({
    queryKey: ["provider-bookings"],
    queryFn: listMyBookings,
    enabled: Boolean(profile) && !isBusinessProfile,
  });

  const resetForm = useCallback((options: { keepOpen?: boolean } = {}) => {
    setCategory("Hair");
    setDescription("");
    setDuration("");
    setEditingServiceId(null);
    setError("");
    setMessage("");
    setName("");
    setPrice("");
    setServiceImage(null);
    setServiceImageUrl("");
    setIsFormVisible(Boolean(options.keepOpen));
  }, []);

  useEffect(() => {
    if (action === "add") {
      resetForm({ keepOpen: true });
    }
  }, [action, intent, resetForm]);

  const openNewServiceForm = () => {
    resetForm({ keepOpen: true });
  };

  const refreshServicesWorkspace = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["provider-services"] }),
      queryClient.invalidateQueries({ queryKey: ["business-stats"] }),
      queryClient.invalidateQueries({ queryKey: ["provider-bookings"] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const numericPrice = Number(price);
      const numericDuration = duration ? Number(duration) : undefined;

      if (!name.trim() || !category.trim()) {
        throw new Error("Service name and category are required.");
      }

      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        throw new Error("Enter a valid service price.");
      }

      if (numericDuration !== undefined && Number.isNaN(numericDuration)) {
        throw new Error("Enter a valid duration in minutes.");
      }

      const payload = {
        category,
        currency: "KES",
        description: description.trim() || undefined,
        duration: numericDuration,
        isActive: true,
        name: name.trim(),
        price: numericPrice,
      };

      const service = editingServiceId
        ? updateProviderService(editingServiceId, payload)
        : createProviderService(payload);

      const savedService = await service;

      if (serviceImage) {
        return uploadServiceImage(savedService._id, serviceImage);
      }

      return savedService;
    },
    onMutate: () => {
      setError("");
      setMessage("");
    },
    onSuccess: async () => {
      await refreshServicesWorkspace();
      resetForm();
      setMessage("Service saved.");
    },
    onError: (saveError) => {
      setError(getApiErrorMessage(saveError));
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateProviderService,
    onSuccess: async () => {
      await refreshServicesWorkspace();
      resetForm();
      setMessage("Service deactivated.");
    },
    onError: (deactivateError) => {
      setError(getApiErrorMessage(deactivateError));
    },
  });

  const editService = (service: ServiceSummary) => {
    setEditingServiceId(service._id);
    setName(service.name);
    setCategory(service.category);
    setPrice(String(service.price));
    setDuration(service.duration ? String(service.duration) : "");
    setDescription(service.description || "");
    setServiceImage(null);
    setServiceImageUrl(service.imageUrl || "");
    setError("");
    setMessage("");
    setIsFormVisible(true);
  };

  const pickServiceImage = async () => {
    setError("");
    setMessage("");

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError("Allow photo library access to add a service image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.86,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    setServiceImage(result.assets[0]);
    setServiceImageUrl(result.assets[0].uri);
  };

  const deactivateService = (service: ServiceSummary) => {
    Alert.alert(
      "Deactivate service",
      `Hide ${service.name} from clients?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: () => deactivateMutation.mutate(service._id),
        },
      ]
    );
  };

  if (profileQuery.isLoading) {
    return (
      <LoadingScreen label="Loading services..." showBackButton size={82} />
    );
  }

  if (!profile) {
    return (
      <Screen>
        <Text style={styles.title}>Services</Text>
        <DashboardCard title="Profile setup required">
          <Text style={styles.body}>
            Complete your professional profile before adding services.
          </Text>
          <PrimaryButton
            label="Set up profile"
            onPress={() => router.push("/(provider)/profile")}
          />
        </DashboardCard>
      </Screen>
    );
  }

  const services = servicesQuery.data ?? [];
  const activeServices = services.filter((service) => service.isActive !== false);
  const activeCount = activeServices.length;
  const categoryCount = new Set(activeServices.map((service) => service.category)).size;
  const averagePrice =
    activeCount > 0
      ? activeServices.reduce((sum, service) => sum + service.price, 0) / activeCount
      : 0;
  const businessStats = businessStatsQuery.data ?? null;
  const providerBookings = bookingsQuery.data ?? [];
  const bookingCount = isBusinessProfile
    ? Object.values(businessStats?.bookingStatusBreakdown || {}).reduce(
        (sum, count) => sum + count,
        0
      )
    : providerBookings.length;
  const topServices = isBusinessProfile
    ? (businessStats?.topServices || []).map((service) => ({
        ...service,
        currency: businessStats?.currency || services[0]?.currency || "KES",
      }))
    : getTopServicesFromBookings(providerBookings, services[0]?.currency || "KES");
  const isTopServicesLoading = isBusinessProfile
    ? businessStatsQuery.isLoading
    : bookingsQuery.isLoading;

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Services</Text>
          <Text style={styles.subtitle}>
            {activeCount} active of {services.length} total
          </Text>
        </View>
        {isFormVisible ? (
          <Pressable onPress={() => resetForm()} style={styles.clearButton}>
            <Text style={styles.clearText}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="list-outline"
          label="Total services"
          value={String(services.length)}
        />
        <StatCard
          icon="checkmark-circle-outline"
          label="Active"
          value={String(activeCount)}
        />
        <StatCard
          icon="calendar-outline"
          label="Bookings"
          value={String(bookingCount)}
        />
        <StatCard
          icon="pricetag-outline"
          label="Avg price"
          value={activeCount ? formatMoney(averagePrice, services[0]?.currency) : "0"}
        />
      </View>

      {!isFormVisible ? (
        <Pressable onPress={openNewServiceForm} style={styles.addServiceButton}>
          <View style={styles.addServiceIcon}>
            <Ionicons color={colors.primary} name="add" size={22} />
          </View>
          <View style={styles.addServiceCopy}>
            <Text style={styles.addServiceTitle}>Add service</Text>
            <Text style={styles.addServiceMeta}>
              {categoryCount ? `${categoryCount} categories active` : "Create your menu"}
            </Text>
          </View>
          <Ionicons color={colors.surface} name="chevron-forward" size={18} />
        </Pressable>
      ) : null}

      {!isFormVisible && error ? <Text style={styles.error}>{error}</Text> : null}
      {!isFormVisible && message ? (
        <Text style={styles.success}>{message}</Text>
      ) : null}

      {isFormVisible ? (
        <DashboardCard title={editingServiceId ? "Edit service" : "Add service"}>
          <TextField
            label="Service name"
            onChangeText={setName}
            placeholder="Silk press"
            value={name}
          />

          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.chipGrid}>
            {providerCategories.map((item) => {
              const selected = category === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[styles.chip, selected ? styles.selectedChip : null]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected ? styles.selectedChipText : null,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.formGrid}>
            <View style={styles.formColumn}>
              <TextField
                keyboardType="numeric"
                label="Price"
                onChangeText={setPrice}
                placeholder="18000"
                value={price}
              />
            </View>
            <View style={styles.formColumn}>
              <TextField
                keyboardType="numeric"
                label="Duration"
                onChangeText={setDuration}
                placeholder="90"
                value={duration}
              />
            </View>
          </View>

          <TextField
            label="Description"
            multiline
            onChangeText={setDescription}
            placeholder="What is included in this service?"
            style={styles.descriptionInput}
            textAlignVertical="top"
            value={description}
          />

          <View style={styles.imagePickerRow}>
            {serviceImageUrl ? (
              <Image source={{ uri: serviceImageUrl }} style={styles.serviceImage} />
            ) : (
              <View style={styles.serviceImageFallback}>
                <Ionicons color={colors.primary} name="image-outline" size={24} />
              </View>
            )}
            <View style={styles.imagePickerCopy}>
              <Text style={styles.imagePickerTitle}>Service image</Text>
              <Text style={styles.imagePickerBody}>
                This appears on client cards and booking details.
              </Text>
            </View>
            <Pressable onPress={pickServiceImage} style={styles.imagePickerButton}>
              <Text style={styles.imagePickerButtonText}>
                {serviceImageUrl ? "Change" : "Add"}
              </Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {message ? <Text style={styles.success}>{message}</Text> : null}

          <PrimaryButton
            label={editingServiceId ? "Save service" : "Add service"}
            loading={saveMutation.isPending}
            onPress={() => saveMutation.mutate()}
          />
        </DashboardCard>
      ) : null}

      <DashboardCard title="Services list">
        {servicesQuery.isLoading ? (
          <LogoLoader label="Loading service menu..." size={32} />
        ) : services.length ? (
          services.map((service) => (
            <ServiceRow
              key={service._id}
              onDeactivate={() => deactivateService(service)}
              onEdit={() => editService(service)}
              service={service}
            />
          ))
        ) : (
          <Text style={styles.body}>No services yet. Tap Add service to start.</Text>
        )}
      </DashboardCard>

      <DashboardCard title="Top booked services">
        {isTopServicesLoading ? (
          <LogoLoader label="Loading service ranking..." size={32} />
        ) : topServices.length ? (
          topServices.map((service, index) => (
            <TopServiceRow
              currency={service.currency}
              index={index}
              key={service.serviceId}
              service={service}
            />
          ))
        ) : (
          <Text style={styles.body}>
            Top services will appear after clients start booking.
          </Text>
        )}
      </DashboardCard>
    </Screen>
  );
}

const getTopServicesFromBookings = (
  bookings: ProviderBooking[],
  fallbackCurrency: string
) => {
  const metrics = new Map<string, TopServiceMetric>();

  bookings.forEach((booking) => {
    if (
      booking.status === "cancelled" ||
      booking.status === "declined" ||
      !booking.service?._id
    ) {
      return;
    }

    const current = metrics.get(booking.service._id) || {
      bookings: 0,
      category: booking.service.category,
      currency: booking.currency || booking.service.currency || fallbackCurrency,
      name: booking.service.name,
      revenue: 0,
      serviceId: booking.service._id,
    };

    current.bookings += 1;
    current.revenue += booking.price || 0;
    metrics.set(booking.service._id, current);
  });

  return Array.from(metrics.values())
    .sort((first, second) => {
      if (second.bookings !== first.bookings) {
        return second.bookings - first.bookings;
      }

      return second.revenue - first.revenue;
    })
    .slice(0, 5);
};

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Ionicons color={colors.primary} name={icon} size={20} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

type ServiceRowProps = {
  onDeactivate: () => void;
  onEdit: () => void;
  service: ServiceSummary;
};

function ServiceRow({ onDeactivate, onEdit, service }: ServiceRowProps) {
  const isInactive = service.isActive === false;

  return (
    <View style={[styles.serviceRow, isInactive ? styles.inactiveRow : null]}>
      {service.imageUrl ? (
        <Image source={{ uri: service.imageUrl }} style={styles.rowImage} />
      ) : (
        <View style={styles.rowImageFallback}>
          <Text style={styles.rowImageText}>{service.category.slice(0, 2)}</Text>
        </View>
      )}
      <View style={styles.serviceCopy}>
        <View style={styles.serviceTitleRow}>
          <Text style={styles.serviceName}>{service.name}</Text>
          {isInactive ? (
            <View style={styles.inactivePill}>
              <Text style={styles.inactiveText}>Inactive</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.serviceMeta}>
          {service.category} · {service.duration || 0} min
        </Text>
        <Text style={styles.servicePrice}>
          {formatMoney(service.price, service.currency)}
        </Text>
      </View>
      <View style={styles.serviceActions}>
        <Pressable onPress={onEdit} style={styles.iconButton}>
          <Ionicons color={colors.primary} name="create-outline" size={18} />
        </Pressable>
        {!isInactive ? (
          <Pressable onPress={onDeactivate} style={styles.iconButton}>
            <Ionicons color={colors.danger} name="eye-off-outline" size={18} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

type TopServiceRowProps = {
  currency?: string;
  index: number;
  service: TopServiceMetric;
};

function TopServiceRow({ currency, index, service }: TopServiceRowProps) {
  const rank = index + 1;

  return (
    <View style={styles.topServiceRow}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      <View style={styles.topServiceCopy}>
        <Text numberOfLines={1} style={styles.topServiceName}>
          {service.name}
        </Text>
        <Text numberOfLines={1} style={styles.topServiceMeta}>
          {service.category || "Service"}
        </Text>
      </View>
      <View style={styles.topServiceNumbers}>
        <Text style={styles.topServiceBookings}>
          {service.bookings} {service.bookings === 1 ? "booking" : "bookings"}
        </Text>
        <Text style={styles.topServiceRevenue}>
          {formatMoney(service.revenue, currency)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
  },
  clearButton: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  clearText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    gap: 4,
    padding: spacing.md,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  addServiceButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  addServiceIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  addServiceCopy: {
    flex: 1,
    gap: 2,
  },
  addServiceTitle: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "900",
  },
  addServiceMeta: {
    color: colors.surface,
    fontSize: 12,
    opacity: 0.78,
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "400",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  selectedChipText: {
    color: colors.surface,
  },
  formGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  formColumn: {
    flex: 1,
  },
  descriptionInput: {
    minHeight: 96,
    paddingTop: spacing.md,
  },
  imagePickerRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  serviceImage: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    height: 62,
    width: 62,
  },
  serviceImageFallback: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  imagePickerCopy: {
    flex: 1,
    gap: 2,
  },
  imagePickerTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  imagePickerBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  imagePickerButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  imagePickerButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  success: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "700",
  },
  serviceRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  inactiveRow: {
    opacity: 0.68,
  },
  rowImage: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 54,
    width: 54,
  },
  rowImageFallback: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  rowImageText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  serviceCopy: {
    flex: 1,
    gap: 3,
  },
  serviceTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  serviceName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  inactivePill: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  inactiveText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
  },
  serviceMeta: {
    color: colors.muted,
    fontSize: 13,
  },
  servicePrice: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  serviceActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  topServiceRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  rankBadge: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  rankText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  topServiceCopy: {
    flex: 1,
    gap: 2,
  },
  topServiceName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  topServiceMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  topServiceNumbers: {
    alignItems: "flex-end",
    gap: 2,
  },
  topServiceBookings: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  topServiceRevenue: {
    color: colors.muted,
    fontSize: 12,
  },
});
