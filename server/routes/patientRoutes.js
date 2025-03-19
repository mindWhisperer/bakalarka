const express = require("express");
const PatientController = require("../controllers/patientController");

const router = express.Router();
router.get("/data", PatientController.getPatients);

module.exports = router;
