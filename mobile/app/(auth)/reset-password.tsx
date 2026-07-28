import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { BrandLogo } from "../../src/components/BrandLogo";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { TextField } from "../../src/components/TextField";
import { colors, spacing } from "../../src/constants/theme";
import { getApiErrorMessage } from "../../src/services/api";
import { resetPasswordRequest } from "../../src/services/auth.service";

const schema = z
  .object({
    confirmPassword: z.string().min(8, "Confirm your new password."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    token: z.string().trim().min(1, "Reset code is required."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const resetToken = Array.isArray(params.token) ? params.token[0] : params.token;
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      confirmPassword: "",
      password: "",
      token: resetToken || "",
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (resetToken) {
      setValue("token", resetToken);
    }
  }, [resetToken, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    setMessage("");

    try {
      const response = await resetPasswordRequest(values.token, values.password);
      setMessage(response.message || "Password reset successfully.");
      setTimeout(() => router.replace("/(auth)/login"), 900);
    } catch (resetError) {
      setError(getApiErrorMessage(resetError));
    }
  });

  return (
    <Screen>
      <View style={styles.header}>
        <BrandLogo size={76} />
        <Text style={styles.title}>Create new password</Text>
        <Text style={styles.subtitle}>
          Paste your reset code and choose a new password.
        </Text>
      </View>

      <Controller
        control={control}
        name="token"
        render={({ field }) => (
          <TextField
            autoCapitalize="none"
            error={errors.token?.message}
            label="Reset code"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder="Paste reset code"
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
            label="New password"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder="At least 8 characters"
            secureTextEntry
            value={field.value}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <TextField
            error={errors.confirmPassword?.message}
            label="Confirm password"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder="Re-enter password"
            secureTextEntry
            value={field.value}
          />
        )}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}

      <PrimaryButton
        label="Reset password"
        loading={isSubmitting}
        onPress={onSubmit}
      />

      <Text style={styles.footerText}>
        Need a code?{" "}
        <Link href="/(auth)/forgot-password" style={styles.link}>
          Request reset
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
  success: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "700",
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
