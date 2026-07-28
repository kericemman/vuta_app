const mongoose = require("mongoose");
const {
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUS,
} = require("../constants/businessEmployees");
const ProviderProfile = require("./ProviderProfile");
const Service = require("./Service");

const cleanOptionalString = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
};

const cleanOptionalLowercaseString = (value) => {
  const cleaned = cleanOptionalString(value);
  return typeof cleaned === "string" ? cleaned.toLowerCase() : cleaned;
};

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      trim: true,
    },
    opensAt: {
      type: String,
      trim: true,
    },
    closesAt: {
      type: String,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const businessEmployeeSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderProfile",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Employee name is required."],
      trim: true,
      maxlength: 80,
    },
    role: {
      type: String,
      enum: Object.values(EMPLOYEE_ROLES),
      default: EMPLOYEE_ROLES.STAFF,
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: 80,
      set: cleanOptionalString,
    },
    specializations: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 80,
        },
      ],
      validate: {
        validator: (items) => items.length <= 12,
        message: "An employee can have a maximum of 12 specializations.",
      },
      default: [],
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      set: cleanOptionalString,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      set: cleanOptionalString,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 120,
      set: cleanOptionalLowercaseString,
    },
    profileImage: {
      type: String,
      trim: true,
      set: cleanOptionalString,
    },
    profileImagePublicId: {
      type: String,
      trim: true,
      set: cleanOptionalString,
    },
    availability: {
      type: [availabilitySchema],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(EMPLOYEE_STATUS),
      default: EMPLOYEE_STATUS.ACTIVE,
    },
    isBookable: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

businessEmployeeSchema.pre("validate", function normalizeEmployeeLists() {
  this.specializations = [
    ...new Set(
      (this.specializations || [])
        .map((item) => cleanOptionalString(item))
        .filter(Boolean)
    ),
  ];

  this.services = [
    ...new Set(
      (this.services || [])
        .filter(Boolean)
        .map((serviceId) => String(serviceId))
    ),
  ];
});

businessEmployeeSchema.pre("validate", async function ensureBusinessProfile() {
  const shouldValidateBusiness =
    this.isNew || this.isModified("business") || this.isModified("services");

  if (!shouldValidateBusiness) {
    return;
  }

  if (!this.business) {
    return;
  }

  const business = await ProviderProfile.findById(this.business).select(
    "accountType"
  );

  if (!business) {
    this.invalidate("business", "Business profile not found.");
    return;
  }

  if (business.accountType !== "business") {
    this.invalidate(
      "business",
      "Employees can only be added to business profiles."
    );
    return;
  }

  if (!this.services.length) {
    return;
  }

  const serviceCount = await Service.countDocuments({
    _id: { $in: this.services },
    provider: this.business,
  });

  if (serviceCount !== this.services.length) {
    this.invalidate(
      "services",
      "Employee services must belong to the same business profile."
    );
  }
});

businessEmployeeSchema.index({ business: 1, isBookable: 1, status: 1 });
businessEmployeeSchema.index({ business: 1, specializations: 1, status: 1 });
businessEmployeeSchema.index({ business: 1, sortOrder: 1, name: 1 });
businessEmployeeSchema.index(
  { business: 1, phone: 1 },
  {
    partialFilterExpression: { phone: { $type: "string" } },
    unique: true,
  }
);
businessEmployeeSchema.index(
  { business: 1, email: 1 },
  {
    partialFilterExpression: { email: { $type: "string" } },
    unique: true,
  }
);

module.exports = mongoose.model("BusinessEmployee", businessEmployeeSchema);
