const Feedback = require("../models/Feedback");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { buildLegalConsent } = require("../utils/legalConsent");
const { buildPagination, getPagination } = require("../utils/pagination");
const sendEmail = require("../utils/sendEmail");

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

const feedbackPopulate = {
  path: "user",
  select: "name email phone role country city area profileImage",
};

const createFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.create({
    ...req.body,
    source: "app",
    role: req.user.role,
    user: req.user._id,
  });

  await feedback.populate(feedbackPopulate);

  if (process.env.ADMIN_EMAIL) {
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Vuta App Feedback",
      html: `
        <h2>New Vuta App Feedback</h2>
        <p><strong>User:</strong> ${escapeHtml(req.user.name)} (${escapeHtml(req.user.role)})</p>
        <p><strong>Phone:</strong> ${escapeHtml(req.user.phone || "Not provided")}</p>
        <p><strong>Email:</strong> ${escapeHtml(req.user.email || "Not provided")}</p>
        <p><strong>Topic:</strong> ${escapeHtml(feedback.topic)}</p>
        <p><strong>Rating:</strong> ${escapeHtml(feedback.rating || "Not rated")}</p>
        <p><strong>Can contact:</strong> ${feedback.contactConsent ? "Yes" : "No"}</p>
        <p><strong>Message:</strong> ${escapeHtml(feedback.message)}</p>
      `,
    }).catch((error) => {
      console.warn("Feedback email notification failed.", error.message);
    });
  }

  res.status(201).json({
    success: true,
    message: "Thank you. Your feedback has been sent to the Vuta team.",
    data: feedback,
  });
});

const createPublicFeedback = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  delete payload.acceptedLegalPolicies;

  const feedback = await Feedback.create({
    ...payload,
    legalConsent: buildLegalConsent({
      email: payload.email,
      req,
    }),
  });

  if (process.env.ADMIN_EMAIL) {
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject:
        payload.source === "website_contact"
          ? "New Vuta Contact Message"
          : "New Vuta Website Feedback",
      html: `
        <h2>${payload.source === "website_contact" ? "New Vuta Contact Message" : "New Vuta Website Feedback"}</h2>
        <p><strong>Name:</strong> ${escapeHtml(feedback.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(feedback.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(feedback.phone || "Not provided")}</p>
        <p><strong>Role:</strong> ${escapeHtml(feedback.role)}</p>
        <p><strong>Topic:</strong> ${escapeHtml(feedback.topic)}</p>
        <p><strong>Rating:</strong> ${escapeHtml(feedback.rating || "Not rated")}</p>
        <p><strong>Can contact:</strong> ${feedback.contactConsent ? "Yes" : "No"}</p>
        <p><strong>Message:</strong> ${escapeHtml(feedback.message)}</p>
        <p><strong>Legal Consent:</strong> Accepted Terms and Conditions, Privacy Policy, and User Agreement on ${escapeHtml(
          feedback.legalConsent.acceptedAt.toISOString()
        )}</p>
      `,
    }).catch((error) => {
      console.warn("Website feedback email notification failed.", error.message);
    });
  }

  res.status(201).json({
    success: true,
    message:
      payload.source === "website_contact"
        ? "Thank you. The Vuta team has received your message."
        : "Thank you. Your feedback has been sent to the Vuta team.",
    data: feedback,
  });
});

const listFeedback = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.topic) {
    filter.topic = req.query.topic;
  }

  const [items, total] = await Promise.all([
    Feedback.find(filter)
      .populate(feedbackPopulate)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Feedback.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: items.length,
    pagination: buildPagination({ page, limit, total }),
    data: items,
  });
});

const updateFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
  }).populate(feedbackPopulate);

  if (!feedback) {
    throw new ApiError(404, "Feedback not found.");
  }

  res.json({
    success: true,
    message: "Feedback updated.",
    data: feedback,
  });
});

const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);

  if (!feedback) {
    throw new ApiError(404, "Feedback not found.");
  }

  res.json({
    success: true,
    message: "Feedback deleted.",
    data: feedback,
  });
});

module.exports = {
  createFeedback,
  createPublicFeedback,
  deleteFeedback,
  listFeedback,
  updateFeedback,
};
