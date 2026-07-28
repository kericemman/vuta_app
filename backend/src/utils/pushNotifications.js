const PushToken = require("../models/PushToken");

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";
const EXPO_BATCH_SIZE = 100;
const expoTokenPattern = /^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]+\]$/;

const isExpoPushToken = (token) =>
  typeof token === "string" && expoTokenPattern.test(token);

const chunk = (items, size) => {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const toPlainData = (value) => JSON.parse(JSON.stringify(value || {}));

const deactivateInvalidTokens = async (messages, tickets) => {
  const invalidTokens = tickets
    .map((ticket, index) =>
      ticket?.status === "error" &&
      ticket?.details?.error === "DeviceNotRegistered"
        ? messages[index]?.to
        : null
    )
    .filter(Boolean);

  if (!invalidTokens.length) {
    return;
  }

  await PushToken.updateMany(
    { token: { $in: invalidTokens } },
    {
      $set: {
        isActive: false,
        revokedAt: new Date(),
      },
    }
  );
};

const sendExpoBatch = async (messages) => {
  const response = await fetch(EXPO_PUSH_ENDPOINT, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    throw new Error(`Expo push request failed with ${response.status}.`);
  }

  const payload = await response.json();
  await deactivateInvalidTokens(messages, payload.data || []);
};

const sendPushNotificationToUser = async ({ body, data = {}, title, user }) => {
  if (!user || !title) {
    return;
  }

  const tokens = await PushToken.find({
    user,
    isActive: true,
    revokedAt: null,
  }).select("token");

  const messages = tokens
    .map((item) => item.token)
    .filter(isExpoPushToken)
    .map((token) => ({
      body,
      data: toPlainData(data),
      priority: "high",
      sound: "default",
      title,
      to: token,
    }));

  if (!messages.length) {
    return;
  }

  await Promise.all(
    chunk(messages, EXPO_BATCH_SIZE).map((batch) => sendExpoBatch(batch))
  );
};

module.exports = {
  isExpoPushToken,
  sendPushNotificationToUser,
};
