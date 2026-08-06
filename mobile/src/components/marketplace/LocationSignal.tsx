import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../constants/theme";

type LocationSignalProps = {
  isRequestingLocation: boolean;
  isUsingDeviceLocation: boolean;
  label: string;
  locationPermission: "denied" | "granted" | "undetermined" | "unknown";
  onUseCurrentLocation: () => void;
};

export function LocationSignal({
  isRequestingLocation,
  isUsingDeviceLocation,
  label,
  locationPermission,
  onUseCurrentLocation,
}: LocationSignalProps) {
  const canRequestLocation =
    locationPermission !== "granted" || !isUsingDeviceLocation;

  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Ionicons
          color={isUsingDeviceLocation ? colors.success : colors.premium}
          name={isUsingDeviceLocation ? "navigate-circle" : "location-outline"}
          size={18}
        />
        <View style={styles.textGroup}>
          <Text style={styles.title}>
            {isUsingDeviceLocation ? "Nearby first" : "Using saved area"}
          </Text>
          <Text numberOfLines={1} style={styles.label}>
            {label}
          </Text>
        </View>
      </View>

      {canRequestLocation ? (
        <Pressable
          disabled={isRequestingLocation}
          onPress={onUseCurrentLocation}
          style={({ pressed }) => [
            styles.button,
            pressed ? styles.buttonPressed : null,
            isRequestingLocation ? styles.buttonDisabled : null,
          ]}
        >
          <Text style={styles.buttonText}>
            {isRequestingLocation ? "Loading" : "Use location"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  copy: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minWidth: 0,
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 1,
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "800",
  },
});
