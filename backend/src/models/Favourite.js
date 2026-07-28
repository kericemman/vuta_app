const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

favouriteSchema.index({ client: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model("Favourite", favouriteSchema);
