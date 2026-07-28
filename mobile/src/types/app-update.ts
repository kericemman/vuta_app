export type AppUpdateAudience =
  | "all"
  | "beauty_business"
  | "beauty_professional"
  | "client";

export type AppUpdateMediaType = "image" | "video_link";

export type AppUpdateMedia = {
  caption?: string;
  publicId?: string;
  thumbnailUrl?: string;
  type: AppUpdateMediaType;
  url: string;
};

export type AppUpdate = {
  id: string;
  audiences: AppUpdateAudience[];
  body: string;
  createdAt: string;
  media: AppUpdateMedia[];
  publishedAt?: string | null;
  readAt?: string | null;
  status: "draft" | "published";
  summary?: string;
  title: string;
  updatedAt?: string;
};
