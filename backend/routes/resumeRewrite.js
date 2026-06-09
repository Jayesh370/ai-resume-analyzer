const express = require("express");
const authenticate = require("../middleware/auth");
const { getRewrite, getRewrites, runRewrite, saveRewriteVersion } = require("../controllers/resumeRewriteController");

const router = express.Router();

router.use(authenticate);

router.post("/run", runRewrite);
router.get("/", getRewrites);
router.get("/:id", getRewrite);
router.post("/:id/save-version", saveRewriteVersion);

module.exports = router;
