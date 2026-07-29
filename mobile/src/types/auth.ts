export type UserRole =
  | "client"
  | "beauty_professional"
  | "beauty_business"
  | "admin";

export type User = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  country?: string;
  city?: string;
  area?: string;
  profileImage?: string;
  preferences?: string[];
  isVerified: boolean;
  isActive: boolean;
  language?: string;
};

export type AuthSession = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email?: string;
  phone: string;
  password: string;
  role: UserRole;
  country?: string;
  city?: string;
  area?: string;
};
