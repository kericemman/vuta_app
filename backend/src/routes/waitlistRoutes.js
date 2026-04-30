const express = require("express");
const {
  joinWaitlist,
  getWaitlist,
} = require("../controllers/waitlistController");

const router = express.Router();

router.post("/", joinWaitlist);
router.get("/", getWaitlist);

module.exports = router;