export type Review = {
  _id: string;
  booking?: string;
  client?: {
    _id?: string;
    name?: string;
    profileImage?: string;
  };
  comment?: string;
  createdAt?: string;
  provider?: string;
  rating: number;
  updatedAt?: string;
};

export type CreateReviewPayload = {
  bookingId: string;
  comment?: string;
  rating: number;
};
