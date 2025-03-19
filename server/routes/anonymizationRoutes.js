const express = require("express");
const AnonymizationController = require("../controllers/anonymizationController");

const router = express.Router();
router.post("/anonymize", AnonymizationController.anonymizeData);

module.exports = router;
