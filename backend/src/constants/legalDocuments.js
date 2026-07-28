const LEGAL_DOCUMENT_VERSION = "2026-07-28";

const LEGAL_DOCUMENTS = {
  privacyPolicy: {
    key: "privacyPolicy",
    title: "Privacy Policy",
    url: "https://vuta.app/privacy-policy",
    version: LEGAL_DOCUMENT_VERSION,
  },
  termsAndConditions: {
    key: "termsAndConditions",
    title: "Terms and Conditions",
    url: "https://vuta.app/terms-and-conditions",
    version: LEGAL_DOCUMENT_VERSION,
  },
  userAgreement: {
    key: "userAgreement",
    title: "User Agreement",
    url: "https://vuta.app/user-agreement",
    version: LEGAL_DOCUMENT_VERSION,
  },
};

module.exports = {
  LEGAL_DOCUMENTS,
  LEGAL_DOCUMENT_VERSION,
};
