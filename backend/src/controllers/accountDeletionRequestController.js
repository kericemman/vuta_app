const AccountDeletionRequest = require("../models/AccountDeletionRequest");
const asyncHandler = require("../utils/asyncHandler");
const { buildLegalConsent } = require("../utils/legalConsent");
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

const createAccountDeletionRequest = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  delete payload.acceptedLegalPolicies;
  delete payload.confirmOwnership;

  const deletionRequest = await AccountDeletionRequest.create({
    ...payload,
    legalConsent: buildLegalConsent({
      email: payload.email,
      req,
    }),
  });

  if (process.env.ADMIN_EMAIL) {
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Vuta Account Deletion Request",
      html: `
        <h2>New Vuta Account Deletion Request</h2>
        <p><strong>Name:</strong> ${escapeHtml(deletionRequest.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(deletionRequest.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(deletionRequest.phone || "Not provided")}</p>
        <p><strong>Account Type:</strong> ${escapeHtml(deletionRequest.role)}</p>
        <p><strong>Reason:</strong> ${escapeHtml(deletionRequest.reason || "Not provided")}</p>
        <p><strong>Legal Consent:</strong> Accepted Terms and Conditions, Privacy Policy, and User Agreement on ${escapeHtml(
          deletionRequest.legalConsent.acceptedAt.toISOString()
        )}</p>
      `,
    }).catch((error) => {
      console.warn("Account deletion request email failed.", error.message);
    });
  }

  res.status(201).json({
    success: true,
    message:
      "Your account deletion request has been received. The Vuta team will verify the account details before processing it.",
    data: deletionRequest,
  });
});

module.exports = {
  createAccountDeletionRequest,
};
