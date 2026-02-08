const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const {
  createResource,
  listResources,
  getResourceById,
  updateResourceById,
  deleteResourceById
} = require("../controllers/resource.controller");

router.post("/resource", auth, createResource);
router.get("/resource", auth, listResources);
router.get("/resource/:id", auth, getResourceById);
router.put("/resource/:id", auth, updateResourceById);
router.delete("/resource/:id", auth, deleteResourceById);

module.exports = router;
