const sendEmail = require("./sendEmail");

const alertCooldowns = new Map();

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";

const buildFingerprint = (error, req) =>
  [
    error.name || "Error",
    error.statusCode || 500,
    req.method,
    req.originalUrl,
    error.message,
  ].join("|");

const shouldSendAlert = (fingerprint) => {
  const cooldownMs = Number(process.env.SECURITY_ALERT_COOLDOWN_MS || 300000);
  const now = Date.now();
  const lastSentAt = alertCooldowns.get(fingerprint) || 0;

  if (now - lastSentAt < cooldownMs) {
    return false;
  }

  alertCooldowns.set(fingerprint, now);
  return true;
};

const sendSecurityErrorAlert = async ({ error, req, statusCode }) => {
  const to = process.env.SECURITY_ALERT_EMAIL || process.env.ADMIN_EMAIL;

  if (!to) {
    return;
  }

  const fingerprint = buildFingerprint(error, req);

  if (!shouldSendAlert(fingerprint)) {
    return;
  }

  const user = req.user
    ? `${req.user._id} (${req.user.role || "unknown role"})`
    : "Unauthenticated";
  const subject = `[Vuta Alert] ${statusCode} error on ${req.method} ${req.originalUrl}`;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#211A20;line-height:1.5">
      <h2 style="color:#741B5D">Vuta backend error detected</h2>
      <p>A server error happened and users received a safe generic message.</p>
      <table style="border-collapse:collapse;width:100%;max-width:760px">
        <tr><td><strong>Request ID</strong></td><td>${escapeHtml(req.id)}</td></tr>
        <tr><td><strong>Status</strong></td><td>${escapeHtml(statusCode)}</td></tr>
        <tr><td><strong>Route</strong></td><td>${escapeHtml(`${req.method} ${req.originalUrl}`)}</td></tr>
        <tr><td><strong>User</strong></td><td>${escapeHtml(user)}</td></tr>
        <tr><td><strong>IP</strong></td><td>${escapeHtml(getClientIp(req))}</td></tr>
        <tr><td><strong>Error</strong></td><td>${escapeHtml(error.name || "Error")}: ${escapeHtml(error.message)}</td></tr>
      </table>
      <h3 style="color:#741B5D">What to do now</h3>
      <ol>
        <li>Check backend logs using the request ID above.</li>
        <li>If users are exposed to repeated failures, set <strong>APP_SECURITY_MODE=maintenance</strong> or <strong>read_only</strong>.</li>
        <li>If one feature is under attack, set <strong>APP_DISABLED_FEATURES</strong>, for example uploads, booking, messaging, auth, or profile_edits.</li>
        <li>If account safety is at risk, set <strong>APP_SECURITY_MODE=incident_lockdown</strong>, rotate secrets, and restart the backend.</li>
        <li>After mitigation, return <strong>APP_SECURITY_MODE=normal</strong> and clear disabled features.</li>
      </ol>
      <pre style="white-space:pre-wrap;background:#FFF8F3;border:1px solid #EADBD3;padding:12px;border-radius:8px">${escapeHtml(error.stack || "")}</pre>
    </div>
  `;

  try {
    await sendEmail({ html, subject, to });
  } catch (emailError) {
    console.error("Security alert email failed.", emailError);
  }
};

module.exports = {
  sendSecurityErrorAlert,
};
