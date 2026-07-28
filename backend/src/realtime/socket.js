const { Server } = require("socket.io");
const User = require("../models/User");
const { verifyAccessToken } = require("../utils/tokens");

const EVENTS = {
  APP_UPDATE_PUBLISHED: "app-update.published",
  CONVERSATION_UPDATED: "conversation.updated",
  MESSAGE_CREATED: "message.created",
  NOTIFICATION_CREATED: "notification.created",
};

let io = null;

const getUserRoom = (userId) => `user:${userId.toString()}`;
const getAudienceRoom = (audience) => `audience:${audience}`;

const isOriginAllowed = (origin, allowedOrigins) =>
  !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin);

const getTokenFromSocket = (socket) => {
  const authToken = socket.handshake.auth?.token;
  const authHeader = socket.handshake.headers?.authorization;

  if (authToken) {
    return authToken;
  }

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

const initRealtime = (server, { allowedOrigins = [] } = {}) => {
  io = new Server(server, {
    cors: {
      credentials: true,
      origin: (origin, callback) => {
        if (isOriginAllowed(origin, allowedOrigins)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS."));
      },
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = getTokenFromSocket(socket);

      if (!token) {
        throw new Error("Missing token.");
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select("_id role isActive");

      if (!user || !user.isActive) {
        throw new Error("Inactive user.");
      }

      socket.user = {
        id: user._id.toString(),
        role: user.role,
      };
      next();
    } catch (error) {
      next(new Error("Authentication required."));
    }
  });

  io.on("connection", (socket) => {
    socket.join(getUserRoom(socket.user.id));
    socket.join(getAudienceRoom(socket.user.role));
  });

  return io;
};

const emitToUser = (userId, eventName, payload) => {
  if (!io || !userId) {
    return;
  }

  io.to(getUserRoom(userId)).emit(eventName, payload);
};

const emitToAudiences = (audiences = [], eventName, payload) => {
  if (!io || !audiences.length) {
    return;
  }

  if (audiences.includes("all")) {
    io.emit(eventName, payload);
    return;
  }

  audiences.forEach((audience) => {
    io.to(getAudienceRoom(audience)).emit(eventName, payload);
  });
};

module.exports = {
  EVENTS,
  emitToAudiences,
  emitToUser,
  initRealtime,
};
