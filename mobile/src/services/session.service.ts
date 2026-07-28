import * as SecureStore from "expo-secure-store";
import { AuthSession } from "../types/auth";

const SESSION_KEY = "vuta.auth.session";

export const saveSession = async (session: AuthSession) => {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
};

export const readSession = async () => {
  const rawSession = await SecureStore.getItemAsync(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  return JSON.parse(rawSession) as AuthSession;
};

export const clearSession = async () => {
  await SecureStore.deleteItemAsync(SESSION_KEY);
};
