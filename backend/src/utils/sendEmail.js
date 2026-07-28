const { Resend } = require("resend");

let resend;

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
};

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY missing. Email skipped.");
    return;
  }

  if (!process.env.RESEND_FROM_EMAIL || !to) {
    console.log("Email recipient or sender missing. Email skipped.");
    return;
  }

  const client = getResendClient();

  await client.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
