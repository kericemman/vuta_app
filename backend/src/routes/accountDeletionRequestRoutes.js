const express = require("express");
const {
  createAccountDeletionRequest,
} = require("../controllers/accountDeletionRequestController");
const validateRequest = require("../middleware/validateRequest");
const { accountDeletionRequestSchemas } = require("../validators/schemas");

const router = express.Router();

router.post(
  "/",
  validateRequest(accountDeletionRequestSchemas.create),
  createAccountDeletionRequest
);

module.exports = router;
