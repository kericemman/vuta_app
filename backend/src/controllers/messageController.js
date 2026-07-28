const ApiError = require("../utils/ApiError");
const Booking = require("../models/Booking");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const ProviderProfile = require("../models/ProviderProfile");
const asyncHandler = require("../utils/asyncHandler");
const { buildPagination, getPagination } = require("../utils/pagination");
const { ROLES } = require("../constants/roles");
const { createNotification } = require("../utils/notifications");
const { EVENTS, emitToUser } = require("../realtime/socket");

const providerPopulate = {
  path: "provider",
  select: "businessName user country city area accountType",
  populate: {
    path: "user",
    select: "name profileImage role",
  },
};

const bookingPopulate = {
  path: "booking",
  select: "bookingDate bookingTime status service",
  populate: {
    path: "service",
    select: "name category",
  },
};

const populateConversation = (query) =>
  query
    .populate("participants", "name profileImage role")
    .populate("client", "name profileImage role")
    .populate("providerUser", "name profileImage role")
    .populate(providerPopulate)
    .populate(bookingPopulate)
    .populate("lastMessageSender", "name profileImage role");

const getParticipantState = (conversation, userId) =>
  conversation.participantStates.find(
    (state) => state.user?.toString() === userId.toString()
  );

const serializeUser = (user) =>
  user
    ? {
        _id: user._id,
        name: user.name,
        profileImage: user.profileImage,
        role: user.role,
      }
    : null;

const serializeConversation = (conversation, userId) => {
  const state = getParticipantState(conversation, userId);
  const otherParticipants = (conversation.participants || []).filter(
    (participant) => participant._id.toString() !== userId.toString()
  );

  return {
    _id: conversation._id,
    booking: conversation.booking,
    client: serializeUser(conversation.client),
    createdAt: conversation.createdAt,
    lastMessageAt: conversation.lastMessageAt,
    lastMessageSender: serializeUser(conversation.lastMessageSender),
    lastMessageText: conversation.lastMessageText,
    otherParticipants: otherParticipants.map(serializeUser),
    provider: conversation.provider,
    providerUser: serializeUser(conversation.providerUser),
    unreadCount: state?.unreadCount || 0,
    updatedAt: conversation.updatedAt,
  };
};

const serializeMessage = (message) => ({
  _id: message._id,
  body: message.body,
  conversation: message.conversation,
  createdAt: message.createdAt,
  sender: serializeUser(message.sender),
  updatedAt: message.updatedAt,
});

const assertParticipant = (conversation, userId) => {
  const isParticipant = conversation.participants.some(
    (participant) => participant.toString() === userId.toString()
  );

  if (!isParticipant) {
    throw new ApiError(403, "You do not have access to this conversation.");
  }
};

const getConversationForUser = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found.");
  }

  assertParticipant(conversation, userId);
  return conversation;
};

const getConversationContextFromBooking = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId).populate({
    path: "provider",
    select: "businessName user accountType",
    populate: {
      path: "user",
      select: "name profileImage role",
    },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found.");
  }

  const providerUserId = booking.provider?.user?._id || booking.provider?.user;
  const isClient = booking.client.toString() === user._id.toString();
  const isProvider = providerUserId?.toString() === user._id.toString();

  if (!isClient && !isProvider) {
    throw new ApiError(403, "You do not have access to this booking.");
  }

  return {
    booking: booking._id,
    client: booking.client,
    contextKey: `booking:${booking._id}`,
    participants: [booking.client, providerUserId],
    provider: booking.provider._id,
    providerUser: providerUserId,
  };
};

const getConversationContextFromProvider = async (providerId, user) => {
  if (user.role !== ROLES.CLIENT) {
    throw new ApiError(403, "Only clients can start provider conversations.");
  }

  const provider = await ProviderProfile.findOne({
    _id: providerId,
    isActive: true,
    verificationStatus: "approved",
  }).populate("user", "name profileImage role");

  if (!provider) {
    throw new ApiError(404, "Provider not found.");
  }

  const providerUserId = provider.user?._id || provider.user;

  if (providerUserId.toString() === user._id.toString()) {
    throw new ApiError(400, "You cannot message your own provider profile.");
  }

  return {
    client: user._id,
    contextKey: `provider:${provider._id}:client:${user._id}`,
    participants: [user._id, providerUserId],
    provider: provider._id,
    providerUser: providerUserId,
  };
};

const findOrCreateConversation = async (context) => {
  let conversation = await Conversation.findOne({
    contextKey: context.contextKey,
  });

  if (conversation) {
    return conversation;
  }

  try {
    conversation = await Conversation.create({
      ...context,
      participantStates: context.participants.map((participant) => ({
        lastReadAt: new Date(),
        unreadCount: 0,
        user: participant,
      })),
    });
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }

    conversation = await Conversation.findOne({
      contextKey: context.contextKey,
    });
  }

  return conversation;
};

const updateReadState = async (conversationId, userId) =>
  Conversation.updateOne(
    {
      _id: conversationId,
      "participantStates.user": userId,
    },
    {
      $set: {
        "participantStates.$.lastReadAt": new Date(),
        "participantStates.$.unreadCount": 0,
      },
    }
  );

const emitConversationUpdated = async (conversationId, userIds) => {
  const populatedConversation = await populateConversation(
    Conversation.findById(conversationId)
  );

  if (!populatedConversation) {
    return null;
  }

  userIds.forEach((userId) => {
    emitToUser(userId, EVENTS.CONVERSATION_UPDATED, {
      conversation: serializeConversation(populatedConversation, userId),
    });
  });

  return populatedConversation;
};

const emitMessageCreated = ({ conversationId, message, userIds }) => {
  userIds.forEach((userId) => {
    emitToUser(userId, EVENTS.MESSAGE_CREATED, {
      conversationId,
      message,
    });
  });
};

const listConversations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { participants: req.user._id };

  const [conversations, total] = await Promise.all([
    populateConversation(
      Conversation.find(filter)
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit)
    ),
    Conversation.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: conversations.length,
    pagination: buildPagination({ page, limit, total }),
    data: conversations.map((conversation) =>
      serializeConversation(conversation, req.user._id)
    ),
  });
});

const startConversation = asyncHandler(async (req, res) => {
  const context = req.body.bookingId
    ? await getConversationContextFromBooking(req.body.bookingId, req.user)
    : await getConversationContextFromProvider(req.body.providerId, req.user);

  let conversation = await findOrCreateConversation(context);
  conversation = await populateConversation(
    Conversation.findById(conversation._id)
  );

  res.status(201).json({
    success: true,
    data: serializeConversation(conversation, req.user._id),
  });
});

const listMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const conversation = await getConversationForUser(
    req.params.conversationId,
    req.user._id
  );

  const [messages, total] = await Promise.all([
    Message.find({ conversation: conversation._id })
      .populate("sender", "name profileImage role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ conversation: conversation._id }),
  ]);

  await updateReadState(conversation._id, req.user._id);
  await emitConversationUpdated(conversation._id, [req.user._id]);

  res.json({
    success: true,
    count: messages.length,
    pagination: buildPagination({ page, limit, total }),
    data: messages.reverse().map(serializeMessage),
  });
});

const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await getConversationForUser(
    req.params.conversationId,
    req.user._id
  );
  const message = await Message.create({
    body: req.body.body,
    conversation: conversation._id,
    sender: req.user._id,
  });
  const now = new Date();
  const preview =
    req.body.body.length > 240 ? `${req.body.body.slice(0, 237)}...` : req.body.body;
  const recipientIds = conversation.participants.filter(
    (participant) => participant.toString() !== req.user._id.toString()
  );

  conversation.lastMessageAt = now;
  conversation.lastMessageSender = req.user._id;
  conversation.lastMessageText = preview;
  conversation.participantStates = conversation.participantStates.map((state) => {
    if (state.user.toString() === req.user._id.toString()) {
      state.lastReadAt = now;
      state.unreadCount = 0;
      return state;
    }

    state.unreadCount = (state.unreadCount || 0) + 1;
    return state;
  });
  await conversation.save();

  await Promise.all(
    recipientIds.map((recipientId) =>
      createNotification({
        body: preview,
        metadata: {
          conversationId: conversation._id,
          messageId: message._id,
        },
        title: req.user.name || "New message",
        type: "message",
        user: recipientId,
      })
    )
  );

  const populatedMessage = await Message.findById(message._id).populate(
    "sender",
    "name profileImage role"
  );
  const serializedMessage = serializeMessage(populatedMessage);
  const participantIds = conversation.participants.map((participant) =>
    participant.toString()
  );

  await emitConversationUpdated(conversation._id, participantIds);
  emitMessageCreated({
    conversationId: conversation._id,
    message: serializedMessage,
    userIds: participantIds,
  });

  res.status(201).json({
    success: true,
    data: serializedMessage,
  });
});

const markConversationRead = asyncHandler(async (req, res) => {
  const conversation = await getConversationForUser(
    req.params.conversationId,
    req.user._id
  );

  await updateReadState(conversation._id, req.user._id);

  const populatedConversation = await populateConversation(
    Conversation.findById(conversation._id)
  );

  res.json({
    success: true,
    data: serializeConversation(populatedConversation, req.user._id),
  });
});

module.exports = {
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
  startConversation,
};
