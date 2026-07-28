const express = require("express");
const {
  createService,
  deactivateService,
  getServiceById,
  getMyServices,
  listAdminServices,
  listServices,
  updateAdminServiceStatus,
  updateService,
} = require("../controllers/serviceController");
const { PROVIDER_ROLES, ROLES } = require("../constants/roles");
const { optionalAuth, protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { serviceSchemas } = require("../validators/schemas");

const router = express.Router();

router.get("/", optionalAuth, validateRequest(serviceSchemas.list), listServices);
router.get(
  "/admin",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(serviceSchemas.adminList),
  listAdminServices
);

router.get(
  "/me",
  protect,
  allowRoles(...PROVIDER_ROLES),
  validateRequest(serviceSchemas.mine),
  getMyServices
);

router.get("/:id", validateRequest(serviceSchemas.byId), getServiceById);

router.post(
  "/",
  protect,
  allowRoles(...PROVIDER_ROLES),
  validateRequest(serviceSchemas.create),
  createService
);
router.patch(
  "/:id",
  protect,
  allowRoles(...PROVIDER_ROLES),
  validateRequest(serviceSchemas.update),
  updateService
);
router.patch(
  "/admin/:id/status",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(serviceSchemas.adminUpdateStatus),
  updateAdminServiceStatus
);
router.delete(
  "/:id",
  protect,
  allowRoles(...PROVIDER_ROLES),
  validateRequest(serviceSchemas.byId),
  deactivateService
);

module.exports = router;
