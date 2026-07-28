const express = require("express");
const {
  createAdminUpdate,
  deleteAdminUpdate,
  getMyUpdateById,
  getUnreadUpdateCount,
  listAdminUpdates,
  listMyUpdates,
  markAllUpdatesRead,
  markUpdateRead,
  updateAdminUpdate,
  uploadAppUpdateImage,
} = require("../controllers/appUpdateController");
const { ROLES } = require("../constants/roles");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { uploadSingleImage } = require("../middleware/uploadMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { appUpdateSchemas, paramsWithId } = require("../validators/schemas");

const router = express.Router();

router.use(protect);

router.get(
  "/admin",
  allowRoles(ROLES.ADMIN),
  validateRequest(appUpdateSchemas.adminList),
  listAdminUpdates
);
router.post(
  "/admin/images",
  allowRoles(ROLES.ADMIN),
  uploadSingleImage,
  uploadAppUpdateImage
);
router.post(
  "/admin",
  allowRoles(ROLES.ADMIN),
  validateRequest(appUpdateSchemas.create),
  createAdminUpdate
);
router.patch(
  "/admin/:id",
  allowRoles(ROLES.ADMIN),
  validateRequest(appUpdateSchemas.update),
  updateAdminUpdate
);
router.delete(
  "/admin/:id",
  allowRoles(ROLES.ADMIN),
  validateRequest({ params: paramsWithId }),
  deleteAdminUpdate
);

router.get("/", validateRequest(appUpdateSchemas.list), listMyUpdates);
router.get("/unread-count", getUnreadUpdateCount);
router.patch("/read-all", markAllUpdatesRead);
router.get("/:id", validateRequest(appUpdateSchemas.byId), getMyUpdateById);
router.patch(
  "/:id/read",
  validateRequest(appUpdateSchemas.byId),
  markUpdateRead
);

module.exports = router;
