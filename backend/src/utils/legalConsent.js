const { LEGAL_DOCUMENTS } = require("../constants/legalDocuments");

const getRequestIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "";
};

const buildLegalConsent = ({ email, req }) => ({
  accepted: true,
  acceptedAt: new Date(),
  documents: {
    privacyPolicy: {
      ...LEGAL_DOCUMENTS.privacyPolicy,
      accepted: true,
    },
    termsAndConditions: {
      ...LEGAL_DOCUMENTS.termsAndConditions,
      accepted: true,
    },
    userAgreement: {
      ...LEGAL_DOCUMENTS.userAgreement,
      accepted: true,
    },
  },
  email,
  ipAddress: getRequestIp(req),
  source: "public_website",
  userAgent: req.get("user-agent") || "",
});

module.exports = {
  buildLegalConsent,
};
