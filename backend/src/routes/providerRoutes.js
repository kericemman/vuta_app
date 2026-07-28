const express = require("express");
const { listPublicProviderEmployees } = require("../controllers/businessEmployeeController");
const {
  createOrUpdateMyProviderProfile,
  getMyProviderProfile,
  getMyProviderProfileIfExists,
  getProviderById,
  listAdminProviders,
  listProviders,
  reviewBusinessNameChange,
  updateProviderVerification,
} = require("../controllers/providerController");
const { PROVIDER_ROLES, ROLES } = require("../constants/roles");
const { optionalAuth, protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { providerSchemas } = require("../validators/schemas");

const router = express.Router();

router.get(
  "/me/profile",
  protect,
  allowRoles(...PROVIDER_ROLES),
  getMyProviderProfile
);
router.get(
  "/me/profile-status",
  protect,
  allowRoles(...PROVIDER_ROLES),
  getMyProviderProfileIfExists
);
router.put(
  "/me/profile",
  protect,
  allowRoles(...PROVIDER_ROLES),
  validateRequest(providerSchemas.upsertMine),
  createOrUpdateMyProviderProfile
);

router.get("/", optionalAuth, validateRequest(providerSchemas.list), listProviders);
router.get(
  "/admin",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(providerSchemas.adminList),
  listAdminProviders
);
router.get(
  "/:id/employees",
  validateRequest(providerSchemas.listEmployees),
  listPublicProviderEmployees
);
router.get("/:id", validateRequest(providerSchemas.getById), getProviderById);

router.patch(
  "/:id/verification",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(providerSchemas.updateVerification),
  updateProviderVerification
);

router.patch(
  "/:id/business-name-change",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(providerSchemas.reviewBusinessNameChange),
  reviewBusinessNameChange
);

module.exports = router;
