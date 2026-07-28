const express = require("express");
const {
  deleteWaitlistEntry,
  joinWaitlist,
  getWaitlist,
} = require("../controllers/waitlistController");
const { ROLES } = require("../constants/roles");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { waitlistSchemas } = require("../validators/schemas");

const router = express.Router();

router.post("/", validateRequest(waitlistSchemas.join), joinWaitlist);
router.get(
  "/",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(waitlistSchemas.list),
  getWaitlist
);
router.delete(
  "/:id",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(waitlistSchemas.byId),
  deleteWaitlistEntry
);

module.exports = router;
