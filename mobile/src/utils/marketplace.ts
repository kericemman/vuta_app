import { ProviderSummary, ServiceSummary } from "../types/marketplace";

export const getProviderName = (provider: ProviderSummary) =>
  provider.businessName || provider.user?.name || "Beauty profile";

export const getProviderCategory = (provider: ProviderSummary) =>
  provider.categories?.[0] || "Beauty specialist";

export const getProviderImage = (provider: ProviderSummary) =>
  provider.user?.profileImage || provider.portfolio?.[0]?.url;

export const getServiceImage = (service: ServiceSummary) =>
  service.imageUrl ||
  service.provider?.portfolio?.[0]?.url ||
  service.provider?.user?.profileImage;

export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "V";

export const getLocationLabel = (
  item: Pick<ProviderSummary, "area" | "city" | "country">
) =>
  [item.area, item.city, item.country]
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");

export const formatMoney = (currency: string, amount: number) =>
  `${currency} ${Math.round(amount).toLocaleString()}`;

export const formatDistance = (distanceKm?: number) => {
  if (distanceKm === undefined || !Number.isFinite(distanceKm)) {
    return "";
  }

  if (distanceKm < 1) {
    return `${Math.max(1, Math.round(distanceKm * 1000))} m away`;
  }

  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km away`;
};

export const filterProviders = (
  providers: ProviderSummary[],
  query: string,
  category?: string
) => {
  const normalizedQuery = query.trim().toLowerCase();

  return providers.filter((provider) => {
    const categoryMatch = category
      ? provider.categories?.includes(category)
      : true;
    const searchable = [
      getProviderName(provider),
      provider.area,
      provider.city,
      provider.country,
      ...(provider.categories || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return categoryMatch && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
};

export const filterServices = (
  services: ServiceSummary[],
  query: string,
  category?: string
) => {
  const normalizedQuery = query.trim().toLowerCase();

  return services.filter((service) => {
    const categoryMatch = category ? service.category === category : true;
    const searchable = [
      service.name,
      service.category,
      service.description,
      service.provider?.businessName,
      service.provider?.area,
      service.provider?.city,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return categoryMatch && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
};
