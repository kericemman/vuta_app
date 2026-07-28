import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, spacing } from "../constants/theme";

const logoSource = require("../../assets/vuta-logo.png");

type BrandLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function BrandLogo({ size = 52, style }: BrandLogoProps) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel="Vuta"
      resizeMode="contain"
      source={logoSource}
      style={[styles.logo, { height: size, width: size }, style]}
    />
  );
}

type LogoLoaderProps = {
  label?: string;
  size?: number;
};

export function LogoLoader({ label = "Loading Vuta", size = 92 }: LogoLoaderProps) {
  const pulse = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 700,
          toValue: 1.04,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration: 700,
          toValue: 0.96,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

  return (
    <View style={styles.loader}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <BrandLogo size={size} />
      </Animated.View>
      {label ? <Text style={styles.loaderText}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    borderRadius: 999,
  },
  loader: {
    alignItems: "center",
    gap: spacing.md,
  },
  loaderText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "500",
  },
});
