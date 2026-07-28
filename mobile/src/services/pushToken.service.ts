import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { api } from "./api";

const REGISTERED_PUSH_TOKEN_KEY = "vuta.push.token";

type RegisterPushTokenPayload = {
  appOwnership?: string | null;
  appVersion?: string | null;
  deviceId?: string;
  platform: "android" | "ios" | "unknown" | "web";
  token: string;
};

const getProjectId = () =>
  Constants.easConfig?.projectId ||
  Constants.expoConfig?.extra?.eas?.projectId;

const getPlatform = (): RegisterPushTokenPayload["platform"] => {
  if (Platform.OS === "android" || Platform.OS === "ios" || Platform.OS === "web") {
    return Platform.OS;
  }

  return "unknown";
};

export const getCurrentExpoPushToken = async () => {
  const projectId = getProjectId();

  if (!projectId) {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
};

export const registerPushToken = async (payload: RegisterPushTokenPayload) => {
  const response = await api.post("/notifications/push-tokens", payload);
  return response.data.data;
};

export const registerCurrentDeviceForPush = async () => {
  const token = await getCurrentExpoPushToken();

  if (!token) {
    return null;
  }

  await registerPushToken({
    appOwnership: Constants.executionEnvironment,
    appVersion: Constants.expoConfig?.version,
    platform: getPlatform(),
    token,
  });
  await SecureStore.setItemAsync(REGISTERED_PUSH_TOKEN_KEY, token);

  return token;
};

export const revokePushToken = async (token: string) => {
  await api.delete("/notifications/push-tokens", {
    data: {
      token,
    },
  });
};

export const revokeStoredPushToken = async () => {
  const token = await SecureStore.getItemAsync(REGISTERED_PUSH_TOKEN_KEY);

  if (!token) {
    return;
  }

  try {
    await revokePushToken(token);
  } finally {
    await SecureStore.deleteItemAsync(REGISTERED_PUSH_TOKEN_KEY);
  }
};
