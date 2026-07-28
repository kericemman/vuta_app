const express = require("express");
const {
  assignBookingEmployee,
  createBooking,
  getBookingById,
  getMyBookings,
  getUpcomingBookings,
  requestBookingReschedule,
  respondBookingReschedule,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { PROVIDER_ROLES, ROLES } = require("../constants/roles");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { bookingSchemas } = require("../validators/schemas");

const router = express.Router();

router.use(protect);

router.get("/", validateRequest(bookingSchemas.list), getMyBookings);
router.get(
  "/upcoming",
  validateRequest(bookingSchemas.upcoming),
  getUpcomingBookings
);
router.post(
  "/",
  allowRoles(ROLES.CLIENT),
  validateRequest(bookingSchemas.create),
  createBooking
);
router.get("/:id", validateRequest(bookingSchemas.byId), getBookingById);
router.patch(
  "/:id/reschedule",
  allowRoles(ROLES.CLIENT),
  validateRequest(bookingSchemas.requestReschedule),
  requestBookingReschedule
);
router.patch(
  "/:id/reschedule-response",
  allowRoles(...PROVIDER_ROLES),
  validateRequest(bookingSchemas.respondReschedule),
  respondBookingReschedule
);
router.patch(
  "/:id/employee",
  allowRoles(...PROVIDER_ROLES),
  validateRequest(bookingSchemas.assignEmployee),
  assignBookingEmployee
);
router.patch(
  "/:id/status",
  validateRequest(bookingSchemas.updateStatus),
  updateBookingStatus
);

module.exports = router;
