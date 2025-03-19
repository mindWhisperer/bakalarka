const PatientModel = require("../models/patientModel");

class PatientController {
    static async getPatients(req, res) {
        try {
            const patients = await PatientModel.getAllPatients();
            res.json(patients);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Chyba pri načítaní údajov." });
        }
    }
}

module.exports = PatientController;
