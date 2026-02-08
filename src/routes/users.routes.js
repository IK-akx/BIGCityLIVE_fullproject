const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const { getProfile, updateProfile } = require("../controllers/users.controller");

router.get("/users/profile", auth, getProfile);
router.put("/users/profile", auth, updateProfile);

module.exports = router;