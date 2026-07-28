import { create } from "zustand";
import axios from "axios";
import { getApiErrorMessage } from "../services/api";
import { getAppConfig } from "../services/appConfig.service";
import { AppConfig, AppSecurityConfig } from "../types/app-config";

const normalSecurity: AppSecurityConfig = {
  disabledFeatures: [],
  isBlockingMode: false,
  mode: "normal",
};

const createNormalConfig = (): AppConfig => ({
  security: {
    ...normalSecurity,
    disabledFeatures: [],
  },
});

const isMissingAppConfigRoute = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404;

type AppConfigState = {
  config: AppConfig;
  error: string | null;
  isLoading: boolean;
  bootstrap: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const useAppConfigStore = create<AppConfigState>((set) => ({
  config: createNormalConfig(),
  error: null,
  isLoading: true,

  bootstrap: async () => {
    set({ error: null, isLoading: true });

    try {
      const config = await getAppConfig();
      set({ config, error: null });
    } catch (error) {
      if (isMissingAppConfigRoute(error)) {
        set({ config: createNormalConfig(), error: null });
        return;
      }

      set({
        config: {
          security: {
            disabledFeatures: [],
            isBlockingMode: true,
            message:
              "Vuta cannot verify platform safety right now. Please try again shortly.",
            mode: "maintenance",
          },
        },
        error: getApiErrorMessage(error),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  refresh: async () => {
    set({ error: null, isLoading: true });

    try {
      const config = await getAppConfig();
      set({ config, error: null });
    } catch (error) {
      if (isMissingAppConfigRoute(error)) {
        set({ config: createNormalConfig(), error: null });
        return;
      }

      set({ error: getApiErrorMessage(error) });
    } finally {
      set({ isLoading: false });
    }
  },
}));
