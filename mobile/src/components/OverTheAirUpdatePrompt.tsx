import { Ionicons } from "@expo/vector-icons";
import * as Updates from "expo-updates";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AppState,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radii, spacing } from "../constants/theme";
import { useAppConfigStore } from "../store/appConfig.store";
import { BrandLogo } from "./BrandLogo";
import { PrimaryButton } from "./PrimaryButton";

type UpdatePromptStatus =
  | "idle"
  | "checking"
  | "downloading"
  | "ready"
  | "restarting";

const CHECK_COOLDOWN_MS = 30 * 60 * 1000;

export function OverTheAirUpdatePrompt() {
  const { t } = useTranslation();
  const { isUpdatePending } = Updates.useUpdates();
  const isBlockingMode = useAppConfigStore(
    (state) => state.config.security.isBlockingMode
  );
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatusState] = useState<UpdatePromptStatus>("idle");
  const checkInFlightRef = useRef(false);
  const lastCheckAtRef = useRef(0);
  const statusRef = useRef<UpdatePromptStatus>("idle");

  const setStatus = useCallback((nextStatus: UpdatePromptStatus) => {
    statusRef.current = nextStatus;
    setStatusState(nextStatus);
  }, []);

  const checkForUpdate = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      const now = Date.now();
      const isBusy =
        checkInFlightRef.current ||
        statusRef.current === "ready" ||
        statusRef.current === "restarting";

      if (
        __DEV__ ||
        !Updates.isEnabled ||
        isBlockingMode ||
        isBusy ||
        (!force && now - lastCheckAtRef.current < CHECK_COOLDOWN_MS)
      ) {
        return;
      }

      checkInFlightRef.current = true;
      lastCheckAtRef.current = now;
      setError("");
      setStatus("checking");

      try {
        const update = await Updates.checkForUpdateAsync();

        if (!update.isAvailable && !update.isRollBackToEmbedded) {
          setStatus("idle");
          return;
        }

        setStatus("downloading");
        const fetchedUpdate = await Updates.fetchUpdateAsync();

        if (fetchedUpdate.isNew || fetchedUpdate.isRollBackToEmbedded) {
          setStatus("ready");
          setIsVisible(true);
          return;
        }

        setStatus("idle");
      } catch {
        setStatus("idle");
      } finally {
        checkInFlightRef.current = false;
      }
    },
    [isBlockingMode, setStatus]
  );

  useEffect(() => {
    const firstCheck = setTimeout(() => {
      void checkForUpdate({ force: true });
    }, 2500);

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void checkForUpdate();
      }
    });

    return () => {
      clearTimeout(firstCheck);
      subscription.remove();
    };
  }, [checkForUpdate]);

  useEffect(() => {
    if (
      __DEV__ ||
      !Updates.isEnabled ||
      isBlockingMode ||
      !isUpdatePending ||
      statusRef.current === "restarting"
    ) {
      return;
    }

    setError("");
    setStatus("ready");
    setIsVisible(true);
  }, [isBlockingMode, isUpdatePending, setStatus]);

  const dismiss = () => {
    setIsVisible(false);
  };

  const restartApp = async () => {
    setError("");
    setStatus("restarting");

    try {
      await Updates.reloadAsync();
    } catch {
      setStatus("ready");
      setError(
        t("otaUpdate.restartError", {
          defaultValue: "The update is ready. Close and reopen Vuta to apply it.",
        })
      );
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={dismiss}
      transparent
      visible={isVisible}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <BrandLogo size={46} />
            <View style={styles.copy}>
              <Text style={styles.title}>
                {t("otaUpdate.title", { defaultValue: "Vuta update ready" })}
              </Text>
              <Text style={styles.body}>
                {t("otaUpdate.body", {
                  defaultValue:
                    "A newer version has downloaded. Restart now to use the latest fixes.",
                })}
              </Text>
            </View>
            <View style={styles.badge}>
              <Ionicons color={colors.primary} name="sparkles" size={18} />
            </View>
          </View>

          {status === "downloading" ? (
            <Text style={styles.meta}>
              {t("otaUpdate.downloading", { defaultValue: "Downloading..." })}
            </Text>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              disabled={status === "restarting"}
              onPress={dismiss}
              style={({ pressed }) => [
                styles.laterButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.laterText}>
                {t("otaUpdate.later", { defaultValue: "Later" })}
              </Text>
            </Pressable>
            <PrimaryButton
              label={
                status === "restarting"
                  ? t("otaUpdate.restarting", { defaultValue: "Restarting..." })
                  : t("otaUpdate.restartNow", { defaultValue: "Restart now" })
              }
              loading={status === "restarting"}
              onPress={restartApp}
              style={styles.restartButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  backdrop: {
    backgroundColor: "rgba(33, 26, 32, 0.3)",
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.md,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 17,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  copy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "700",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  laterButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  laterText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "800",
  },
  meta: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.72,
  },
  restartButton: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
});
