import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "./BackButton";
import { LogoLoader } from "./BrandLogo";
import { colors, spacing } from "../constants/theme";

type LoadingScreenProps = {
  fixedHeader?: ReactNode;
  label?: string;
  showBackButton?: boolean;
  size?: number;
};

export function LoadingScreen({
  fixedHeader,
  label = "Loading Vuta",
  showBackButton = false,
  size = 92,
}: LoadingScreenProps) {
  const header = fixedHeader ?? (showBackButton ? <BackButton /> : null);

  return (
    <SafeAreaView style={styles.safeArea}>
      {header ? <View style={styles.fixedHeader}>{header}</View> : null}
      <View style={styles.container}>
        <View style={styles.shadowPlate}>
          <LogoLoader label={label} size={size} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  fixedHeader: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  shadowPlate: {
    alignItems: "center",
    elevation: 12,
    justifyContent: "center",
    minHeight: 180,
    minWidth: 180,
    shadowColor: colors.primary,
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
});
