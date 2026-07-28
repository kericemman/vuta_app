export type AdPlacement =
  | "business_home"
  | "client_home"
  | "professional_home";

export type AdCard = {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl: string;
  placements: AdPlacement[];
  sortOrder: number;
  isActive: boolean;
};
