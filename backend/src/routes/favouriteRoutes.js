const express = require("express");
const {
  addFavourite,
  listFavourites,
  removeFavourite,
} = require("../controllers/favouriteController");
const { ROLES } = require("../constants/roles");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { favouriteSchemas } = require("../validators/schemas");

const router = express.Router();

router.use(protect, allowRoles(ROLES.CLIENT));

router.get("/", validateRequest(favouriteSchemas.list), listFavourites);
router.post(
  "/:providerId",
  validateRequest(favouriteSchemas.providerId),
  addFavourite
);
router.delete(
  "/:providerId",
  validateRequest(favouriteSchemas.providerId),
  removeFavourite
);

module.exports = router;
