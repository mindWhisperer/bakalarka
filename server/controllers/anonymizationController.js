const { generalize, kAnonymity, lDiversity, tCloseness, randomMasking } = require("../anonymizationAlg");

class AnonymizationController {
    static async anonymizeData(req, res) {
        const { data, method } = req.body;

        if (!data || data.length === 0) {
            return res.status(400).json({ error: 'Žiadne údaje na anonymizáciu' });
        }

        let anonymizedData;

        try {
            // Výber správneho anonymizačného algoritmu
            switch (method) {
                case "generalization":
                    anonymizedData = generalize(data);
                    break;
                case "k-anonymity":
                    anonymizedData = kAnonymity(data);
                    break;
                case "l-diversity":
                    anonymizedData = lDiversity(data);
                    break;
                case "t-closeness":
                    anonymizedData = tCloseness(data);
                    break;
                case "random-masking":
                    anonymizedData = randomMasking(data);
                    break;
                default:
                    anonymizedData = generalize(data); // Predvolená metóda
            }

            // await AnonymizationModel.saveAnonymizedData(anonymizedData, method);

            res.json(anonymizedData); // Pošle anonymizované dáta ako odpoveď
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Chyba pri anonymizácii údajov.' });
        }
    }
}

module.exports = AnonymizationController;
