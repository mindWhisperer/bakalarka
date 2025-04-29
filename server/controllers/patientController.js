// Importovanie modelu pacienta, ktorý sa stará o komunikáciu s databázou
const PatientModel = require("../models/patientModel");

class PatientController {
    /**
     * Funkcia pre získanie zoznamu hospitalizovaných pacientov.
     * @param {Object} req - HTTP požiadavka
     * @param {Object} res - HTTP odpoveď
     */
    static async getPatients(req, res) {
        try {
            // Zavolanie metódy modelu pre získanie všetkých hospitalizovaných pacientov
            const patients = await PatientModel.getAllHospitalizedPatients();

            // Odošleme pacientov ako odpoveď v JSON formáte
            res.json(patients);
        } catch (error) {
            // vypis chyby, ak nastala chyba pri získavaní pacientov
            console.error(error);
            // Vrátenie chyby klientovi s kódom 500 (interná chyba servera)
            res.status(500).json({ error: "Chyba pri načítaní údajov." });
        }
    }
}

module.exports = PatientController;

