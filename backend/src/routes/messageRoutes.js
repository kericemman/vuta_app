const express = require("express");
const {
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
  startConversation,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { messageSchemas } = require("../validators/schemas");

const router = express.Router();

router.use(protect);

router.get(
  "/conversations",
  validateRequest(messageSchemas.listConversations),
  listConversations
);
router.post(
  "/conversations",
  validateRequest(messageSchemas.startConversation),
  startConversation
);
router.get(
  "/conversations/:conversationId/messages",
  validateRequest(messageSchemas.listMessages),
  listMessages
);
router.post(
  "/conversations/:conversationId/messages",
  validateRequest(messageSchemas.sendMessage),
  sendMessage
);
router.patch(
  "/conversations/:conversationId/read",
  validateRequest(messageSchemas.byConversationId),
  markConversationRead
);

module.exports = router;
