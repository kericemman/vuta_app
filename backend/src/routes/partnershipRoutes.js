const express = require("express");
const { ROLES } = require("../constants/roles");
const {
  createPartnershipLead,
  deletePartnershipLead,
  listPartnershipLeads,
  updatePartnershipLead,
} = require("../controllers/partnershipController");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { partnershipSchemas } = require("../validators/schemas");

const router = express.Router();

router.post("/", validateRequest(partnershipSchemas.create), createPartnershipLead);
router.get(
  "/admin",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(partnershipSchemas.adminList),
  listPartnershipLeads
);
router.patch(
  "/admin/:id",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(partnershipSchemas.adminUpdate),
  updatePartnershipLead
);
router.delete(
  "/admin/:id",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(partnershipSchemas.byId),
  deletePartnershipLead
);

module.exports = router;
