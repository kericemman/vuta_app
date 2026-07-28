const mongoose = require("mongoose");

const healthCheck = (req, res) => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const databaseState = states[mongoose.connection.readyState] || "unknown";

  res.status(databaseState === "connected" ? 200 : 503).json({
    success: databaseState === "connected",
    status: databaseState === "connected" ? "ok" : "degraded",
    database: databaseState,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  healthCheck,
};
