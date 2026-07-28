import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { BrandLogo } from "../../src/components/BrandLogo";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { Screen } from "../../src/components/Screen";
import { TextField } from "../../src/components/TextField";
import { colors, spacing } from "../../src/constants/theme";
import { useAuthStore } from "../../src/store/auth.store";

const schema = z.object({
  identifier: z.string().trim().min(1, "Phone or email is required."),
  password: z.string().min(1, "Password is required."),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginScreen() {
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
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
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Log in to find beauty services or manage your professional or business profile.
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

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextField
            error={errors.password?.message}
            label="Password"
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
        Forgot password?
      </Link>

      <PrimaryButton label="Log in" loading={isLoading} onPress={onSubmit} />

      <Text style={styles.footerText}>
        New to Vuta?{" "}
        <Link href="/(auth)/register" style={styles.link}>
          Create account
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
