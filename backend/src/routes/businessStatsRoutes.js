const express = require("express");
const { getBusinessStats } = require("../controllers/businessStatsController");
const { ROLES } = require("../constants/roles");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect, allowRoles(ROLES.BEAUTY_BUSINESS));

router.get("/", getBusinessStats);

module.exports = router;
