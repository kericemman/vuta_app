const express = require("express");
const {
  deletePortfolioImage,
  uploadBusinessEmployeeImage,
  uploadProfileImage,
  uploadPortfolioImage,
  uploadServiceImage,
} = require("../controllers/uploadController");
const { PROVIDER_ROLES, ROLES } = require("../constants/roles");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { uploadSingleImage } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/profile-image",
  protect,
  uploadSingleImage,
  uploadProfileImage
);

router.post(
  "/portfolio",
  protect,
  allowRoles(...PROVIDER_ROLES),
  uploadSingleImage,
  uploadPortfolioImage
);

router.post(
  "/services/:serviceId/image",
  protect,
  allowRoles(...PROVIDER_ROLES),
  uploadSingleImage,
  uploadServiceImage
);

router.post(
  "/business-employees/:employeeId/image",
  protect,
  allowRoles(ROLES.BEAUTY_BUSINESS),
  uploadSingleImage,
  uploadBusinessEmployeeImage
);

router.delete(
  "/portfolio/*publicId",
  protect,
  allowRoles(...PROVIDER_ROLES),
  deletePortfolioImage
);

module.exports = router;
