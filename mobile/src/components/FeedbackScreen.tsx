import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { BackButton } from "./BackButton";
import { DashboardCard } from "./DashboardCard";
import { PrimaryButton } from "./PrimaryButton";
import { Screen } from "./Screen";
import { colors, radii, spacing } from "../constants/theme";
import { getApiErrorMessage } from "../services/api";
import {
  createFeedback,
  FeedbackTopic,
} from "../services/feedback.service";
import { useAuthStore } from "../store/auth.store";

const feedbackTopics: Array<{
  label: string;
  value: FeedbackTopic;
}> = [
  { label: "General", value: "general" },
  { label: "Bookings", value: "booking" },
  { label: "Messages", value: "messages" },
  { label: "Profile", value: "profile" },
  { label: "Search", value: "search" },
  { label: "Performance", value: "performance" },
  { label: "Payments", value: "payments" },
  { label: "Other", value: "other" },
];

const accountLabels = {
  beauty_business: "business",
  beauty_professional: "professional",
  client: "client",
};

export function FeedbackScreen() {
  const user = useAuthStore((state) => state.user);
  const [contactConsent, setContactConsent] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [success, setSuccess] = useState("");
  const [topic, setTopic] = useState<FeedbackTopic>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const accountLabel = user?.role
    ? accountLabels[user.role as keyof typeof accountLabels] || "user"
    : "user";

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timeout = setTimeout(() => setSuccess(""), 3500);

    return () => clearTimeout(timeout);
  }, [success]);

  const resetForm = () => {
    setContactConsent(true);
    setMessage("");
    setRating(undefined);
    setTopic("general");
  };

  const submitFeedback = async () => {
    setError("");
    setSuccess("");

    if (!message.trim()) {
      setError("Tell us what we should improve.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createFeedback({
        contactConsent,
        message: message.trim(),
        rating,
        topic,
      });
      resetForm();
      setSuccess("Thank you. Your feedback has been sent to the Vuta team.");
    } catch (feedbackError) {
      setError(getApiErrorMessage(feedbackError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen fixedHeader={<BackButton label="Back" />}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons color={colors.primary} name="chatbox-ellipses-outline" size={24} />
        </View>
        <Text style={styles.title}>Share feedback</Text>
        <Text style={styles.subtitle}>
          Tell us what would make Vuta better for your {accountLabel} account.
        </Text>
      </View>

      <DashboardCard title="What should we improve?">
        <Text style={styles.label}>Topic</Text>
        <View style={styles.topicGrid}>
          {feedbackTopics.map((item) => {
            const selected = topic === item.value;

            return (
              <Pressable
                key={item.value}
                onPress={() => setTopic(item.value)}
                style={[
                  styles.topicChip,
                  selected ? styles.selectedTopicChip : null,
                ]}
              >
                <Text
                  style={[
                    styles.topicText,
                    selected ? styles.selectedTopicText : null,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>How is Vuta feeling?</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((value) => {
            const marked = value <= (rating || 0);

            return (
              <Pressable
                accessibilityLabel={`Rate ${value} out of 5`}
                key={value}
                onPress={() => setRating(value)}
                style={[
                  styles.ratingButton,
                  marked ? styles.selectedRating : null,
                ]}
              >
                <Ionicons
                  color={marked ? colors.surface : colors.premium}
                  name={marked ? "star" : "star-outline"}
                  size={20}
                />
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Feedback</Text>
        <TextInput
          multiline
          onChangeText={setMessage}
          placeholder="Tell us what is confusing, missing, slow, or could be better."
          placeholderTextColor={colors.muted}
          style={styles.messageInput}
          textAlignVertical="top"
          value={message}
        />

        <Pressable
          onPress={() => setContactConsent((value) => !value)}
          style={styles.consentRow}
        >
          <View style={[styles.checkbox, contactConsent ? styles.checkedBox : null]}>
            {contactConsent ? (
              <Ionicons color={colors.surface} name="checkmark" size={14} />
            ) : null}
          </View>
          <Text style={styles.consentText}>
            The Vuta team can contact me about this feedback.
          </Text>
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <PrimaryButton
          label="Send feedback"
          loading={isSubmitting}
          onPress={submitFeedback}
        />
        {success ? (
          <Pressable onPress={() => router.back()} style={styles.doneButton}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        ) : null}
      </DashboardCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  topicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  topicChip: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectedTopicChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  topicText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  selectedTopicText: {
    color: colors.surface,
  },
  ratingRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  ratingButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  selectedRating: {
    backgroundColor: colors.primary,
  },
  messageInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 150,
    padding: spacing.md,
  },
  consentRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  checkbox: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  checkedBox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  consentText: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
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
  doneButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  doneText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
});
