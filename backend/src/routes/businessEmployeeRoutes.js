const express = require("express");
const {
  createBusinessEmployee,
  deactivateBusinessEmployee,
  getBusinessEmployeeById,
  listBusinessEmployees,
  updateBusinessEmployee,
} = require("../controllers/businessEmployeeController");
const { ROLES } = require("../constants/roles");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { businessEmployeeSchemas } = require("../validators/schemas");

const router = express.Router();

router.use(protect, allowRoles(ROLES.BEAUTY_BUSINESS));

router.get(
  "/",
  validateRequest(businessEmployeeSchemas.listMine),
  listBusinessEmployees
);
router.post(
  "/",
  validateRequest(businessEmployeeSchemas.create),
  createBusinessEmployee
);
router.get(
  "/:id",
  validateRequest(businessEmployeeSchemas.byId),
  getBusinessEmployeeById
);
router.patch(
  "/:id",
  validateRequest(businessEmployeeSchemas.update),
  updateBusinessEmployee
);
router.delete(
  "/:id",
  validateRequest(businessEmployeeSchemas.byId),
  deactivateBusinessEmployee
);

module.exports = router;
