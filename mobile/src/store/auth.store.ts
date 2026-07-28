import { create } from "zustand";
import axios from "axios";
import {
  configureAuthRefresh,
  getApiErrorMessage,
  setAccessToken,
} from "../services/api";
import {
  loginRequest,
  logoutRequest,
  refreshTokenRequest,
  registerRequest,
} from "../services/auth.service";
import {
  clearSession,
  readSession,
  saveSession,
} from "../services/session.service";
import { revokeStoredPushToken } from "../services/pushToken.service";
import {
  AuthSession,
  LoginPayload,
  RegisterPayload,
  User,
} from "../types/auth";

type AuthState = {
  accessToken: string | null;
  error: string | null;
  isHydrated: boolean;
  isLoading: boolean;
  refreshToken: string | null;
  user: User | null;
  bootstrap: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  setSession: (session: AuthSession | null) => Promise<void>;
  setUser: (user: User) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  error: null,
  isHydrated: false,
  isLoading: false,
  refreshToken: null,
  user: null,

  bootstrap: async () => {
    const session = await readSession();

    if (!session) {
      set({ isHydrated: true });
      return;
    }

    setAccessToken(session.accessToken);
    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    });

    try {
      const refreshedSession = await refreshTokenRequest(session.refreshToken);
      await get().setSession(refreshedSession);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await get().setSession(null);
      }
    } finally {
      set({ isHydrated: true });
    }
  },

  login: async (payload) => {
    set({ error: null, isLoading: true });

    try {
      const session = await loginRequest(payload);
      await get().setSession(session);
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const { refreshToken } = get();

    try {
      await revokeStoredPushToken();

      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    } finally {
      await get().setSession(null);
    }
  },

  register: async (payload) => {
    set({ error: null, isLoading: true });

    try {
      const session = await registerRequest(payload);
      await get().setSession(session);
    } catch (error) {
      set({ error: getApiErrorMessage(error) });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setSession: async (session) => {
    if (!session) {
      setAccessToken(null);
      await clearSession();
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
      });
      return;
    }

    setAccessToken(session.accessToken);
    await saveSession(session);
    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    });
  },

  setUser: async (user) => {
    const { accessToken, refreshToken } = get();

    set({ user });

    if (accessToken && refreshToken) {
      await saveSession({
        accessToken,
        refreshToken,
        user,
      });
    }
  },
}));

configureAuthRefresh({
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  onLogout: async () => {
    await useAuthStore.getState().setSession(null);
  },
  onRefresh: async (session) => {
    await useAuthStore.getState().setSession(session);
  },
});
