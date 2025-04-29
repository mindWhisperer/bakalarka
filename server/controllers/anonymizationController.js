const { measureAnonymization } = require('../metricks.js');
//const AnonymizationModel = require('../models/AnonymizationModel');

class AnonymizationController {
    /**
     * Anonymizuje dáta podľa zvolenej metódy a meria čas anonymizácie.
     * @param {Object} req - HTTP požiadavka
     * @param {Object} res - HTTP odpoveď
     */
    static async anonymizeData(req, res) {
        const { data, method } = req.body;

        // Kontrola, či boli poskytnuté dáta
        if (!data || data.length === 0) {
            return res.status(400).json({ error: 'Žiadne údaje na anonymizáciu' });
        }

        let anonymizedData;
        let duration = 0;

        try {
            // Spustenie metódy + meranie času
            const result = measureAnonymization(method, data);

            // Kontrola, či boli poskytnuté dáta
            anonymizedData = result?.result ?? []; // Ak nie sú výsledky, použijeme prázdne pole
            duration = typeof result?.duration === 'number' ? result.duration : 0; // Overenie platnosti času

            // Uloženie anonymizovaných dát do databázy
            //await AnonymizationModel.saveAnonymizedData(anonymizedData, method);

            // Odošleme odpoveď s anonymizovanými dátami a trvaním anonymizácie
            res.json({
                method,
                duration,
                data: anonymizedData
            });

        } catch (error) {

            // Vypis chyby
            console.error(error);

            // Vrátenie užívateľskej chyby
            res.status(500).json({ error: 'Chyba pri anonymizácii údajov.' });
        }
    }
}

module.exports = AnonymizationController;
