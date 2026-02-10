const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { updateProfileSchema } = require("../validation/users.schemas");

const { getProfile, updateProfile } = require("../controllers/users.controller");

router.get("/users/profile", auth, getProfile);
router.put("/users/profile", auth, validate(updateProfileSchema), updateProfile);

module.exports = router;