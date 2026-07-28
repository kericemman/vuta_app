import { api } from "./api";
import {
  FavouriteSummary,
  MarketplaceListParams,
  ProviderDetails,
  ProviderSummary,
  ServiceSummary,
} from "../types/marketplace";
import { BusinessEmployee } from "../types/provider";

type Pagination = {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  page: number;
  pages: number;
  total: number;
};

type ListResponse<T> = {
  count: number;
  data: T[];
  pagination?: Pagination;
  success: boolean;
};

const buildParams = (params: Record<string, string | number | undefined>) =>
  Object.entries(params).reduce<Record<string, string | number>>(
    (cleanParams, [key, value]) => {
      if (value !== undefined && value !== "") {
        cleanParams[key] = value;
      }

      return cleanParams;
    },
    {}
  );

export const listProviders = async (params: MarketplaceListParams = {}) => {
  const response = await api.get<ListResponse<ProviderSummary>>("/providers", {
    params: buildParams(params),
  });

  return response.data.data;
};

export const listServices = async (params: MarketplaceListParams = {}) => {
  const response = await api.get<ListResponse<ServiceSummary>>("/services", {
    params: buildParams(params),
  });

  return response.data.data;
};

export const getServiceById = async (serviceId: string) => {
  const response = await api.get<{ data: ServiceSummary; success: boolean }>(
    `/services/${serviceId}`
  );

  return response.data.data;
};

export const getProviderById = async (providerId: string) => {
  const response = await api.get<{ data: ProviderDetails; success: boolean }>(
    `/providers/${providerId}`
  );

  return response.data.data;
};

export const listProviderEmployees = async (
  providerId: string,
  serviceId?: string,
  bookingDate?: string,
  bookingTime?: string
) => {
  const response = await api.get<ListResponse<BusinessEmployee>>(
    `/providers/${providerId}/employees`,
    {
      params: buildParams({ bookingDate, bookingTime, serviceId }),
    }
  );

  return response.data.data;
};

export const listFavourites = async (
  params: Pick<MarketplaceListParams, "limit" | "page"> = {}
) => {
  const response = await api.get<ListResponse<FavouriteSummary>>(
    "/favourites",
    {
      params: buildParams(params),
    }
  );

  return response.data.data;
};

export const addFavourite = async (providerId: string) => {
  const response = await api.post<{ data: FavouriteSummary; success: boolean }>(
    `/favourites/${providerId}`
  );

  return response.data.data;
};

export const removeFavourite = async (providerId: string) => {
  await api.delete(`/favourites/${providerId}`);
};
