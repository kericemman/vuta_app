const { PARTNERSHIP_TYPES } = require("../constants/partnerships");
const PartnershipLead = require("../models/PartnershipLead");
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

const typeLabels = {
  beauty_supplier: "Beauty supplier",
  brand: "Brand",
  corporate: "Corporate",
  influencer: "Influencer",
  investor: "Investor",
  media: "Media",
  other: "Other",
  training_academy: "Training academy",
};

const createPartnershipLead = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  delete payload.acceptedLegalPolicies;

  const lead = await PartnershipLead.create({
    ...payload,
    legalConsent: buildLegalConsent({
      email: payload.email,
      req,
    }),
  });

  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: "New Vuta Partnership Request",
    html: `
      <h2>New Vuta Partnership Request</h2>
      <p><strong>Organization:</strong> ${escapeHtml(lead.organizationName)}</p>
      <p><strong>Contact:</strong> ${escapeHtml(lead.contactName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(lead.phone || "Not provided")}</p>
      <p><strong>Country:</strong> ${escapeHtml(lead.country)}</p>
      <p><strong>City:</strong> ${escapeHtml(lead.city || "Not provided")}</p>
      <p><strong>Website:</strong> ${escapeHtml(lead.website || "Not provided")}</p>
      <p><strong>Type:</strong> ${escapeHtml(typeLabels[lead.partnershipType] || lead.partnershipType)}</p>
      <p><strong>Audience:</strong> ${escapeHtml(lead.audience || "Not provided")}</p>
      <p><strong>Message:</strong> ${escapeHtml(lead.message)}</p>
      <p><strong>Legal Consent:</strong> Accepted Terms and Conditions, Privacy Policy, and User Agreement on ${escapeHtml(
        lead.legalConsent.acceptedAt.toISOString()
      )}</p>
    `,
  });

  res.status(201).json({
    success: true,
    message: "Thank you. Our partnership team will review your request.",
    data: lead,
  });
});

const listPartnershipLeads = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.partnershipType) {
    filter.partnershipType = req.query.partnershipType;
  }

  const [entries, total] = await Promise.all([
    PartnershipLead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    PartnershipLead.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: entries.length,
    pagination: buildPagination({ page, limit, total }),
    data: entries,
  });
});

const updatePartnershipLead = asyncHandler(async (req, res) => {
  const lead = await PartnershipLead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!lead) {
    throw new ApiError(404, "Partnership lead not found.");
  }

  res.json({
    success: true,
    message: "Partnership lead updated.",
    data: lead,
  });
});

const deletePartnershipLead = asyncHandler(async (req, res) => {
  const lead = await PartnershipLead.findByIdAndDelete(req.params.id);

  if (!lead) {
    throw new ApiError(404, "Partnership lead not found.");
  }

  res.json({
    success: true,
    message: "Partnership lead deleted.",
    data: lead,
  });
});

module.exports = {
  createPartnershipLead,
  deletePartnershipLead,
  listPartnershipLeads,
  updatePartnershipLead,
};
