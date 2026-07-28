import { api } from "./api";
import { AdCard, AdPlacement } from "../types/ad-card";

type ListAdCardsResponse = {
  count: number;
  data: AdCard[];
  success: boolean;
};

export const listAdCards = async (placement: AdPlacement) => {
  const response = await api.get<ListAdCardsResponse>("/ad-cards", {
    params: {
      placement,
    },
  });

  return response.data.data;
};
