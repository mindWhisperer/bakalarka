const { measureAnonymization } = require('../metricks.js');

class AnonymizationController {
    static async anonymizeData(req, res) {
        const { data, method } = req.body;

        if (!data || data.length === 0) {
            return res.status(400).json({ error: 'Žiadne údaje na anonymizáciu' });
        }

        let anonymizedData;
        let duration = 0;

        try {
            // Spustenie metódy + meranie času
            const result = measureAnonymization(method, data);

            anonymizedData = result?.result ?? [];
            duration = typeof result?.duration === 'number' ? result.duration : 0;

            res.json({
                method,
                duration,
                data: anonymizedData
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Chyba pri anonymizácii údajov.' });
        }
    }
}

module.exports = AnonymizationController;
