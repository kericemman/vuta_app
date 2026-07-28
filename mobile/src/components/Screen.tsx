import { ReactNode, useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../constants/theme";
import { BackButton } from "./BackButton";

type ScreenProps = {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  fixedHeader?: ReactNode;
  resetScrollOnFocus?: boolean;
  scroll?: boolean;
  scrollContentStyle?: StyleProp<ViewStyle>;
  showBackButton?: boolean;
};

export function Screen({
  children,
  contentStyle,
  fixedHeader,
  resetScrollOnFocus = true,
  scroll = true,
  scrollContentStyle,
  showBackButton = true,
}: ScreenProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const stickyHeader = fixedHeader ?? (showBackButton ? <BackButton /> : null);

  useFocusEffect(
    useCallback(() => {
      if (!scroll || !resetScrollOnFocus) {
        return undefined;
      }

      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({ animated: false, y: 0 });
      });

      return undefined;
    }, [resetScrollOnFocus, scroll])
  );

  const content = (
    <View
      style={[
        styles.content,
        stickyHeader ? styles.contentAfterFixedHeader : null,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        {stickyHeader ? (
          <View style={styles.fixedHeader}>{stickyHeader}</View>
        ) : null}
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
            keyboardShouldPersistTaps="handled"
            ref={scrollViewRef}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  fixedHeader: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  contentAfterFixedHeader: {
    paddingTop: spacing.sm,
  },
});
