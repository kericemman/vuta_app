import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import { z } from "zod";
import {
  CountrySelectField,
  getSelectedCountryName,
} from "../../src/components/CountrySelectField";
import { BrandLogo } from "../../src/components/BrandLogo";
import { PhoneNumberField } from "../../src/components/PhoneNumberField";
import { PrimaryButton } from "../../src/components/PrimaryButton";
import { RolePicker, SignupRole } from "../../src/components/RolePicker";
import { Screen } from "../../src/components/Screen";
import { TextField } from "../../src/components/TextField";
import { colors, spacing } from "../../src/constants/theme";
import { useAuthStore } from "../../src/store/auth.store";
import { normalizePhoneNumber } from "../../src/utils/phone";

type RegisterForm = {
  area?: string;
  city?: string;
  country: string;
  email?: string;
  name: string;
  password: string;
  phone: string;
  role: SignupRole;
};

export default function RegisterScreen() {
  const { t } = useTranslation();
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const register = useAuthStore((state) => state.register);
  const schema = useMemo(
    () =>
      z.object({
        area: z.string().trim().optional(),
        city: z.string().trim().optional(),
        country: z.string().trim().min(1, t("auth.countryRequired")),
        email: z
          .string()
          .trim()
          .email(t("auth.invalidEmail"))
          .optional()
          .or(z.literal("")),
        name: z.string().trim().min(1, t("auth.nameRequired")),
        password: z.string().min(8, t("auth.passwordMin")),
        phone: z.string().trim().min(1, t("auth.phoneRequired")),
        role: z.enum(["client", "beauty_professional", "beauty_business"]),
      }),
    [t]
  );
  const [accountCountryCode, setAccountCountryCode] =
    useState<CountryCode>("KE");
  const [accountCountryName, setAccountCountryName] = useState("Kenya");
  const [phoneCountryCode, setPhoneCountryCode] = useState<CountryCode>("KE");
  const [phoneCallingCode, setPhoneCallingCode] = useState("254");
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      area: "",
      city: "",
      country: "Kenya",
      email: "",
      name: "",
      password: "",
      phone: "",
      role: "client",
    },
    resolver: zodResolver(schema),
  });
  const role = watch("role");

  const handleAccountCountrySelect = (country: Country) => {
    const countryName = getSelectedCountryName(country);

    setAccountCountryCode(country.cca2);
    setAccountCountryName(countryName);
    setValue("country", countryName, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handlePhoneCountrySelect = (country: Country) => {
    setPhoneCountryCode(country.cca2);
    setPhoneCallingCode(country.callingCode[0] || "");
  };

  const onSubmit = handleSubmit(async (values) => {
    const normalizedPhone = normalizePhoneNumber(
      values.phone,
      phoneCountryCode
    );

    if (!normalizedPhone) {
      setError("phone", {
        message: t("auth.validPhoneForCode", { code: phoneCallingCode }),
        type: "validate",
      });
      return;
    }

    try {
      await register({
        ...values,
        email: values.email || undefined,
        phone: normalizedPhone,
      });
      router.replace("/");
    } catch {
      // The auth store already exposes a friendly form error.
    }
  });

  return (
    <Screen>
      <View style={styles.header}>
        <BrandLogo size={76} />
        <Text style={styles.title}>{t("auth.createAccountTitle")}</Text>
        <Text style={styles.subtitle}>
          {t("auth.joinSubtitle")}
        </Text>
      </View>

      <Text style={styles.sectionLabel}>{t("auth.accountType")}</Text>
      <RolePicker
        onChange={(value: SignupRole) => setValue("role", value)}
        value={role}
      />

      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextField
            error={errors.name?.message}
            label={t("auth.fullName")}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder="Jane Wanjiku"
            value={field.value}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextField
            error={errors.email?.message}
            keyboardType="email-address"
            label={t("auth.email")}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            placeholder="jane@example.com"
            value={field.value}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <PhoneNumberField
            callingCode={phoneCallingCode}
            countryCode={phoneCountryCode}
            error={errors.phone?.message}
            label={t("auth.phone")}
            onBlur={field.onBlur}
            onCountrySelect={handlePhoneCountrySelect}
            onChangeText={field.onChange}
            placeholder="712 345 678"
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
            placeholder="At least 8 characters"
            secureTextEntry
            value={field.value}
          />
        )}
      />

      <View style={styles.locationGrid}>
        <Controller
          control={control}
          name="country"
          render={({ field }) => (
            <CountrySelectField
              countryCode={accountCountryCode}
              countryName={accountCountryName || field.value}
              error={errors.country?.message}
              label={t("auth.country")}
              onSelect={handleAccountCountrySelect}
            />
          )}
        />

        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <TextField
              error={errors.city?.message}
              label={t("auth.city")}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Nairobi"
              value={field.value}
            />
          )}
        />

        <Controller
          control={control}
          name="area"
          render={({ field }) => (
            <TextField
              error={errors.area?.message}
              label={t("auth.area")}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder="Kilimani"
              value={field.value}
            />
          )}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label={t("actions.createAccount")}
        loading={isLoading}
        onPress={onSubmit}
      />

      <Text style={styles.footerText}>
        {t("auth.alreadyHaveAccount")}{" "}
        <Link href="/(auth)/login" style={styles.link}>
          {t("actions.logIn")}
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
  sectionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "400",
  },
  locationGrid: {
    gap: spacing.md,
  },
  error: {
    color: colors.danger,
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
