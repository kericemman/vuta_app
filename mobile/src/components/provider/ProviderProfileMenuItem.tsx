import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../constants/theme";

type ProviderProfileMenuItemProps = {
  badge?: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  meta?: string;
  onPress: () => void;
};

export function ProviderProfileMenuItem({
  badge,
  icon,
  label,
  meta,
  onPress,
}: ProviderProfileMenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed ? styles.menuItemPressed : null,
      ]}
    >
      <View style={styles.menuIcon}>
        <Ionicons color={colors.primary} name={icon} size={20} />
      </View>
      <View style={styles.menuCopy}>
        <Text style={styles.menuLabel}>{label}</Text>
        {meta ? <Text style={styles.menuMeta}>{meta}</Text> : null}
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons color={colors.muted} name="chevron-forward" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    alignItems: "center",
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  menuCopy: {
    flex: 1,
    gap: 3,
  },
  menuLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  menuMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.cta,
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "900",
  },
});
