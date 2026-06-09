const express = require("express");
const authenticate = require("../middleware/auth");
const { getTailoring, getTailorings, runTailoring } = require("../controllers/resumeTailoringController");

const router = express.Router();

router.use(authenticate);

router.post("/run", runTailoring);
router.get("/", getTailorings);
router.get("/:id", getTailoring);

module.exports = router;
