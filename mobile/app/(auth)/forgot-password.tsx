import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { BrandLogo } from "../../src/components/BrandLogo";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { TextField } from "../../src/components/TextField";
import { colors, spacing } from "../../src/constants/theme";
import { getApiErrorMessage } from "../../src/services/api";
import { forgotPasswordRequest } from "../../src/services/auth.service";

const schema = z.object({
  identifier: z.string().trim().min(1, "Phone or email is required."),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    defaultValues: {
      identifier: "",
    },
    resolver: zodResolver(schema),
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devToken, setDevToken] = useState("");

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    setMessage("");
    setDevToken("");

    try {
      const response = await forgotPasswordRequest(values.identifier);
      setMessage(
        response.message ||
          "If an account exists, password reset instructions have been sent."
      );

      if (response.devResetToken) {
        setDevToken(response.devResetToken);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  });

  return (
    <Screen>
      <View style={styles.header}>
        <BrandLogo size={76} />
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>
          Enter the phone number or email linked to your Vuta account.
        </Text>
      </View>

      <Controller
        control={control}
        name="identifier"
        render={({ field }) => (
          <TextField
            error={errors.identifier?.message}
            keyboardType="email-address"
            label="Phone or email"
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder="0712 345 678 or jane@example.com"
            value={field.value}
          />
        )}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}
      {devToken ? (
        <View style={styles.devTokenBox}>
          <Text style={styles.devTokenLabel}>Local reset code</Text>
          <Text selectable style={styles.devToken}>
            {devToken}
          </Text>
        </View>
      ) : null}

      <PrimaryButton
        label="Send reset instructions"
        loading={isSubmitting}
        onPress={onSubmit}
      />
      <PrimaryButton
        label="I have a reset code"
        onPress={() =>
          router.push(
            devToken
              ? {
                  pathname: "/(auth)/reset-password",
                  params: { token: devToken },
                }
              : "/(auth)/reset-password"
          )
        }
        variant="secondary"
      />

      <Text style={styles.footerText}>
        Remembered it?{" "}
        <Link href="/(auth)/login" style={styles.link}>
          Log in
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
    lineHeight: 20,
  },
  devTokenBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  devTokenLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  devToken: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 18,
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
