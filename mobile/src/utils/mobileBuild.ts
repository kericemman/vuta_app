import Constants from "expo-constants";
import { Platform } from "react-native";
import { AppSecurityConfig } from "../types/app-config";

const toStringValue = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const toVersionParts = (value: string) =>
  value
    .match(/\d+/g)
    ?.map((part) => Number(part))
    .filter((part) => Number.isFinite(part)) ?? [];

export const getInstalledBuildNumber = () => {
  const nativeBuildNumber = toStringValue(Constants.nativeBuildVersion);

  if (nativeBuildNumber) {
    return nativeBuildNumber;
  }

  if (Platform.OS === "android") {
    return toStringValue(Constants.expoConfig?.android?.versionCode);
  }

  if (Platform.OS === "ios") {
    return toStringValue(Constants.expoConfig?.ios?.buildNumber);
  }

  return "";
};

export const getRequiredMinimumBuild = (security: AppSecurityConfig) => {
  if (Platform.OS === "android") {
    return security.minAndroidBuild || security.minMobileBuild || "";
  }

  if (Platform.OS === "ios") {
    return security.minIosBuild || security.minMobileBuild || "";
  }

  return security.minMobileBuild || "";
};

export const isBuildBelowMinimum = (
  installedBuild: string,
  requiredMinimumBuild: string
) => {
  if (__DEV__) {
    return false;
  }

  const installed = toVersionParts(installedBuild);
  const required = toVersionParts(requiredMinimumBuild);

  if (!installed.length || !required.length) {
    return false;
  }

  const partCount = Math.max(installed.length, required.length);

  for (let index = 0; index < partCount; index += 1) {
    const installedPart = installed[index] ?? 0;
    const requiredPart = required[index] ?? 0;

    if (installedPart < requiredPart) {
      return true;
    }

    if (installedPart > requiredPart) {
      return false;
    }
  }

  return false;
};
