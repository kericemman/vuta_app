const Waitlist = require("../models/Waitlist");
const sendEmail = require("../utils/sendEmail");

const joinWaitlist = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      userType,
      serviceOffered,
      portfolioLink,
      message,
    } = req.body;

    if (!name || !phone || !location || !userType) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, location, and user type are required.",
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
      location,
      userType,
      serviceOffered,
      portfolioLink,
      message,
    });

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Vuta Waitlist Signup",
      html: `
        <h2>New Vuta Waitlist Signup</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email || "Not provided"}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>User Type:</strong> ${userType}</p>
        <p><strong>Service Offered:</strong> ${serviceOffered || "N/A"}</p>
        <p><strong>Portfolio:</strong> ${portfolioLink || "N/A"}</p>
        <p><strong>Message:</strong> ${message || "N/A"}</p>
      `,
    });

    if (email) {
      await sendEmail({
        to: email,
        subject: "You’re on the Vuta Waitlist",
        html: `
          <h2>Welcome to Vuta, ${name}</h2>
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
    const entries = await Waitlist.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch waitlist.",
    });
  }
};

module.exports = {
  joinWaitlist,
  getWaitlist,
};