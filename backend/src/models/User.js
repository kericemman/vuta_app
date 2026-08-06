const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { PUBLIC_SIGNUP_ROLES, ROLES } = require("../constants/roles");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required."],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: 8,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordResetCodeSendCount: {
      type: Number,
      default: 0,
      min: 0,
      select: false,
    },
    passwordResetCodeSendWindowStartedAt: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      enum: [...PUBLIC_SIGNUP_ROLES, ROLES.ADMIN],
      default: ROLES.CLIENT,
      required: true,
    },
    country: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    profileImagePublicId: {
      type: String,
      trim: true,
    },
    preferences: [
      {
        type: String,
        trim: true,
        maxlength: 80,
      },
    ],
    language: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 8,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    accountDisabledUntil: {
      type: Date,
    },
    accountDisabledReason: {
      type: String,
      trim: true,
      maxlength: 80,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ country: 1, city: 1, area: 1 });
userSchema.index({ accountDisabledUntil: 1 });

module.exports = mongoose.model("User", userSchema);
