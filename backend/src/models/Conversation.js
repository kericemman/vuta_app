const mongoose = require("mongoose");

const participantStateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastReadAt: {
      type: Date,
    },
    unreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    contextKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    participantStates: {
      type: [participantStateSchema],
      default: [],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
    },
    providerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    lastMessageAt: {
      type: Date,
    },
    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastMessageText: {
      type: String,
      trim: true,
      maxlength: 240,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ client: 1, lastMessageAt: -1 });
conversationSchema.index({ providerUser: 1, lastMessageAt: -1 });
conversationSchema.index({ booking: 1 }, { sparse: true });

module.exports = mongoose.model("Conversation", conversationSchema);
