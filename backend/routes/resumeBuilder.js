/**
 * routes/resumeBuilder.js - /api/resume-builder/*
 */

const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const {
  listTemplates,
  listBuilds,
  getBuild,
  createBuild,
  updateBuild,
  duplicateBuild,
  tailorBuild,
  favoriteBuild,
  deleteBuild,
  exportBuild,
} = require("../controllers/resumeBuilderController");

router.use(authenticate);

router.get("/templates", listTemplates);
router.get("/", listBuilds);
router.post("/", createBuild);
router.get("/:id", getBuild);
router.put("/:id", updateBuild);
router.post("/:id/duplicate", duplicateBuild);
router.post("/:id/tailor", tailorBuild);
router.patch("/:id/favorite", favoriteBuild);
router.get("/:id/export", exportBuild);
router.delete("/:id", deleteBuild);

module.exports = router;
