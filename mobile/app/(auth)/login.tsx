import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { BrandLogo } from "../../src/components/BrandLogo";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { TextField } from "../../src/components/TextField";
import { colors, spacing } from "../../src/constants/theme";
import { useAuthStore } from "../../src/store/auth.store";

type LoginForm = {
  identifier: string;
  password: string;
};

export default function LoginScreen() {
  const { t } = useTranslation();
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const schema = useMemo(
    () =>
      z.object({
        identifier: z.string().trim().min(1, t("auth.identifierRequired")),
        password: z.string().min(1, t("auth.passwordRequired")),
      }),
    [t]
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      identifier: "",
      password: "",
    },
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      router.replace("/");
    } catch {
      // The auth store already exposes a friendly form error.
    }
  });

  return (
    <Screen>
      <View style={styles.header}>
        <BrandLogo size={76} />
        <Text style={styles.title}>{t("auth.welcomeBack")}</Text>
        <Text style={styles.subtitle}>
          {t("auth.loginSubtitle")}
        </Text>
      </View>

      <Controller
        control={control}
        name="identifier"
        render={({ field }) => (
          <TextField
            error={errors.identifier?.message}
            keyboardType="email-address"
            label={t("auth.phoneOrEmail")}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder="0712 345 678 or jane@example.com"
            value={field.value}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextField
            error={errors.password?.message}
            label={t("auth.password")}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder="Enter your password"
            secureTextEntry
            value={field.value}
          />
        )}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
        {t("auth.forgotPassword")}
      </Link>

      <PrimaryButton
        label={t("actions.logIn")}
        loading={isLoading}
        onPress={onSubmit}
      />

      <Text style={styles.footerText}>
        {t("auth.newToVuta")}{" "}
        <Link href="/(auth)/register" style={styles.link}>
          {t("actions.createAccount")}
        </Link>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  forgotLink: {
    alignSelf: "flex-end",
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  footerText: {
    color: colors.muted,
    fontSize: 15,
    textAlign: "center",
  },
  link: {
    color: colors.primary,
    fontWeight: "900",
  },
});
