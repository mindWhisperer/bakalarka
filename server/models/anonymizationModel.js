// Importovanie funkcie na získanie pripojenia do databázy
const {getConnection} = require("../config/db");

class AnonymizationModel {
    /**
     * Funkcia pre uloženie anonymizovaných dát do databázy.
     * @param {Array} data - Anonymizované dáta, ktoré sa majú uložiť
     * @param {string} method - Metóda anonymizácie, ktorá bude použitá na názov tabuľky
     */
    static async saveAnonymizedData(data, method ) {
        // Získanie pripojenia do databázy
            const connection = await getConnection();

            // Validácia názvu tabuľky, aby neobsahoval žiadne neplatné znaky
            const tableName = `ANONYMIZED_${method.toUpperCase()}`.replace(/[^a-zA-Z0-9_]/g, '');  // Odstráni neplatné znaky

            // Vytvorenie tabuľky
            try {
                // SQL príkaz na vytvorenie tabuľky s definovanými stĺpcami
                await connection.execute(`
            CREATE TABLE ${tableName} (
                MENO VARCHAR2(100),
                PRIEZVISKO VARCHAR2(100),
                ID_PACIENTA VARCHAR2(10),
                TYP_KRVI VARCHAR2(5),
                VEK VARCHAR2(20),
                POHLAVIE VARCHAR2(10),
                TYP_CHOROBY VARCHAR2(200)
            )
        `);
            } catch (error) {
                console.error("Chyba pri vytváraní tabuľky:", error);
                // Skontroluje, či je chyba spôsobená existujúcou tabuľkou
                if (error.message.includes("table already exists")) {
                    console.log("Tabuľka už existuje.");
                }
            }

            // Príkaz na vloženie anonymizovaných dát
            const insertQuery = `
        INSERT INTO ${tableName} (MENO, PRIEZVISKO, ID_PACIENTA, TYP_KRVI, VEK, POHLAVIE, TYP_CHOROBY)
        VALUES (:MENO, :PRIEZVISKO, :ID_PACIENTA, :TYP_KRVI, :VEK, :POHLAVIE, :TYP_CHOROBY)
    `;

            // Vkladanie dát do tabuľky
            try {
                // Pre každý záznam v anonymizovaných dátach
                for (const record of data) {
                    // Parametre, ktoré budú viazané na SQL príkaz
                    const bindParams = {
                        MENO: record.MENO || null,
                        PRIEZVISKO: record.PRIEZVISKO || null,
                        ID_PACIENTA: record.ID_PACIENTA || null,
                        TYP_KRVI: record.TYP_KRVI || null,
                        VEK: record.VEK || null,
                        POHLAVIE: record.POHLAVIE || null,
                        TYP_CHOROBY: record.TYP_CHOROBY || null,
                    };

                    // Vykonanie SQL príkazu na vloženie dát
                    await connection.execute(insertQuery, bindParams, { autoCommit: true });
                }

                // Ak sú dáta úspešne uložené, logujeme úspech
                console.log('Údaje boli úspešne uložené.');
            } catch (error) {
                // Ak nastane chyba pri vkladaní dát, logujeme ju
                console.error("Chyba pri vkladaní dát:", error);
            }

        // Uzavretie pripojenia k databáze
            await connection.close();
        };
}


module.exports = AnonymizationModel;
