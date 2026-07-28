const Waitlist = require("../models/Waitlist");
const sendEmail = require("../utils/sendEmail");
const { buildPagination, getPagination } = require("../utils/pagination");

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

const joinWaitlist = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      country,
      location,
      userType,
      serviceOffered,
      portfolioLink,
      message,
    } = req.body;
    const normalizedUserType =
      userType === "salon_owner" ? "beauty_business" : userType;

    if (!name || !phone || !country || !location || !normalizedUserType) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, country, location, and user type are required.",
      });
    }

    const existing = await Waitlist.findOne({
      $or: [{ phone }, ...(email ? [{ email }] : [])],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already joined the waitlist.",
      });
    }

    const waitlistEntry = await Waitlist.create({
      name,
      email,
      phone,
      country,
      location,
      userType: normalizedUserType,
      serviceOffered,
      portfolioLink,
      message,
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Vuta Waitlist Signup",
      html: `
        <h2>New Vuta Waitlist Signup</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email || "Not provided")}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Country:</strong> ${escapeHtml(country)}</p>
        <p><strong>Location:</strong> ${escapeHtml(location)}</p>
        <p><strong>User Type:</strong> ${escapeHtml(normalizedUserType)}</p>
        <p><strong>Service Offered:</strong> ${escapeHtml(
          serviceOffered || "N/A"
        )}</p>
        <p><strong>Portfolio:</strong> ${escapeHtml(
          portfolioLink || "N/A"
        )}</p>
        <p><strong>Message:</strong> ${escapeHtml(message || "N/A")}</p>
      `,
    });

    if (email) {
      await sendEmail({
        to: email,
        subject: "You’re on the Vuta Waitlist",
        html: `
          <h2>Welcome to Vuta, ${escapeHtml(name)}</h2>
          <p>Thank you for joining the Vuta early access list.</p>
          <p>We’re building a platform that helps clients find trusted beauty professionals near them.</p>
          <p>You’ll be among the first to know when we launch.</p>
        `,
      });
    }

    res.status(201).json({
      success: true,
      message: "You have successfully joined the Vuta waitlist.",
      data: waitlistEntry,
    });
  } catch (error) {
    console.error("WAITLIST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const getWaitlist = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [entries, total] = await Promise.all([
      Waitlist.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Waitlist.countDocuments(),
    ]);

    res.json({
      success: true,
      count: entries.length,
      pagination: buildPagination({ page, limit, total }),
      data: entries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch waitlist.",
    });
  }
};

const deleteWaitlistEntry = async (req, res) => {
  try {
    const entry = await Waitlist.findByIdAndDelete(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Waitlist entry not found.",
      });
    }

    res.json({
      success: true,
      message: "Waitlist entry deleted.",
      data: entry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not delete waitlist entry.",
    });
  }
};

module.exports = {
  deleteWaitlistEntry,
  joinWaitlist,
  getWaitlist,
};
