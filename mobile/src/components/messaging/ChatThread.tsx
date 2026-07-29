import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BackButton } from "../BackButton";
import { LoadingScreen } from "../LoadingScreen";
import { Screen } from "../Screen";
import { colors, radii, spacing } from "../../constants/theme";
import {
  listConversations,
  listMessages,
  sendMessage,
} from "../../services/message.service";
import { useAuthStore } from "../../store/auth.store";
import { ChatMessage, ConversationSummary } from "../../types/message";

export function ChatThread() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const conversationId = Array.isArray(params.id) ? params.id[0] : params.id;
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<ScrollView>(null);
  const user = useAuthStore((state) => state.user);
  const [body, setBody] = useState("");

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: listConversations,
    refetchInterval: 30_000,
  });

  const messagesQuery = useQuery({
    queryKey: ["conversation-messages", conversationId],
    queryFn: () => listMessages(conversationId || ""),
    enabled: Boolean(conversationId),
    refetchInterval: 15_000,
  });

  useEffect(() => {
    if (messagesQuery.data && conversationId) {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  }, [conversationId, messagesQuery.data, queryClient]);

  const sendMutation = useMutation({
    mutationFn: () => sendMessage(conversationId || "", body.trim()),
    onSuccess: (sentMessage) => {
      setBody("");
      queryClient.setQueryData<ChatMessage[]>(
        ["conversation-messages", conversationId],
        (currentMessages = []) => [
          ...currentMessages.filter((message) => message._id !== sentMessage._id),
          sentMessage,
        ]
      );
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const conversation = conversationsQuery.data?.find(
    (item) => item._id === conversationId
  );
  const title = conversation ? getConversationTitle(conversation) : "Messages";
  const messages = messagesQuery.data ?? [];
  const canSend = Boolean(body.trim()) && !sendMutation.isPending;
  const isSending = sendMutation.isPending;

  if (conversationsQuery.isLoading || messagesQuery.isLoading) {
    return <LoadingScreen label={t("chat.loading")} showBackButton size={82} />;
  }

  return (
    <Screen
      fixedHeader={
        <View style={styles.header}>
          <BackButton />
          <View style={styles.headerCopy}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
            <Text numberOfLines={1} style={styles.subtitle}>
              {conversation?.booking?.service?.name ||
                conversation?.provider?.businessName ||
                "Conversation"}
            </Text>
          </View>
        </View>
      }
      scroll={false}
    >
      <ScrollView
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
        ref={scrollViewRef}
        style={styles.messages}
      >
        {!messages.length ? (
          <View style={styles.emptyCard}>
            <Ionicons color={colors.primary} name="chatbubble-outline" size={24} />
            <Text style={styles.emptyText}>Start the conversation.</Text>
          </View>
        ) : null}

        {messages.map((message) => (
          <MessageBubble
            currentUserId={user?.id}
            key={message._id}
            message={message}
          />
        ))}
      </ScrollView>

      {sendMutation.error ? (
        <Text style={styles.error}>{t("chat.sendError")}</Text>
      ) : null}
      {isSending ? (
        <Text style={styles.sendingText}>{t("chat.sendingMessage")}</Text>
      ) : null}

      <View style={styles.composer}>
        <TextInput
          editable={!isSending}
          multiline
          onChangeText={setBody}
          placeholder="Type your message"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={body}
        />
        <Pressable
          disabled={!canSend}
          onPress={() => sendMutation.mutate()}
          style={[
            styles.sendButton,
            isSending ? styles.sendButtonSending : null,
            !canSend ? styles.sendButtonDisabled : null,
          ]}
        >
          {isSending ? (
            <>
              <ActivityIndicator color={colors.surface} size="small" />
              <Text style={styles.sendButtonText}>Sending</Text>
            </>
          ) : (
            <Ionicons color={colors.surface} name="send" size={18} />
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

type MessageBubbleProps = {
  currentUserId?: string;
  message: ChatMessage;
};

function MessageBubble({ currentUserId, message }: MessageBubbleProps) {
  const mine = message.sender?._id === currentUserId;

  return (
    <View style={[styles.messageRow, mine ? styles.myMessageRow : null]}>
      <View style={[styles.bubble, mine ? styles.myBubble : styles.theirBubble]}>
        {!mine ? (
          <Text style={styles.senderName}>{message.sender?.name || "User"}</Text>
        ) : null}
        <Text style={[styles.messageText, mine ? styles.myMessageText : null]}>
          {message.body}
        </Text>
        {message.createdAt ? (
          <View style={styles.messageStatusRow}>
            <Text style={[styles.messageTime, mine ? styles.myMessageTime : null]}>
              {formatMessageTime(message.createdAt)}
            </Text>
            {mine ? (
              <Ionicons
                color={colors.surfaceMuted}
                name="checkmark-done"
                size={13}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const getConversationTitle = (conversation: ConversationSummary) =>
  conversation.otherParticipants?.[0]?.name ||
  conversation.provider?.businessName ||
  conversation.provider?.user?.name ||
  conversation.client?.name ||
  "Conversation";

const formatMessageTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
  },
  messageRow: {
    alignItems: "flex-start",
  },
  myMessageRow: {
    alignItems: "flex-end",
  },
  bubble: {
    borderRadius: radii.md,
    maxWidth: "84%",
    padding: spacing.sm,
  },
  theirBubble: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  myBubble: {
    backgroundColor: colors.primary,
  },
  senderName: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 3,
  },
  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  myMessageText: {
    color: colors.surface,
  },
  messageTime: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
  },
  messageStatusRow: {
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: 3,
    marginTop: 5,
  },
  myMessageTime: {
    color: colors.surfaceMuted,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "800",
  },
  sendingText: {
    alignSelf: "flex-end",
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  composer: {
    alignItems: "flex-end",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    maxHeight: 110,
    minHeight: 40,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 20,
    flexDirection: "row",
    gap: 6,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  sendButtonSending: {
    paddingHorizontal: spacing.sm,
    width: 104,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "800",
  },
});
