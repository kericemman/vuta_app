const express = require("express");
const {
  createAdCard,
  deleteAdCard,
  listAdminAdCards,
  listPublicAdCards,
  updateAdCard,
} = require("../controllers/adCardController");
const { ROLES } = require("../constants/roles");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { uploadSingleImage } = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { adCardSchemas, paramsWithId } = require("../validators/schemas");

const router = express.Router();

router.get("/", validateRequest(adCardSchemas.publicList), listPublicAdCards);
router.get(
  "/admin",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest(adCardSchemas.adminList),
  listAdminAdCards
);
router.post(
  "/admin",
  protect,
  allowRoles(ROLES.ADMIN),
  uploadSingleImage,
  createAdCard
);
router.patch(
  "/admin/:id",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest({ params: paramsWithId }),
  uploadSingleImage,
  updateAdCard
);
router.delete(
  "/admin/:id",
  protect,
  allowRoles(ROLES.ADMIN),
  validateRequest({ params: paramsWithId }),
  deleteAdCard
);

module.exports = router;
