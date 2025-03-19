const {getConnection} = require("../config/db");

class AnonymizationModel {
    static async saveAnonymizedData(data, method ) {
            const connection = await getConnection();

            // Validácia názvu tabuľky, aby neobsahoval žiadne neplatné znaky
            const tableName = `ANONYMIZED_${method.toUpperCase()}`.replace(/[^a-zA-Z0-9_]/g, '');  // Odstráni neplatné znaky

            // Vytvorenie tabuľky
            try {
                await connection.execute(`
            CREATE TABLE ${tableName} (
                ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                MENO VARCHAR2(100),
                PRIEZVISKO VARCHAR2(100),
                ID_PACIENTA VARCHAR2(10),
                TYP_KRVI VARCHAR2(5),
                VEK VARCHAR2(20),
                POHLAVIE VARCHAR2(10)
            )
        `);
            } catch (error) {
                console.error("Chyba pri vytváraní tabuľky:", error);
                // Skontrolujte, či je chyba spôsobená existujúcou tabuľkou
                if (error.message.includes("table already exists")) {
                    console.log("Tabuľka už existuje.");
                }
            }

            // Príkaz na vloženie anonymizovaných dát
            const insertQuery = `
        INSERT INTO ${tableName} (MENO, PRIEZVISKO, ID_PACIENTA, TYP_KRVI, VEK, POHLAVIE)
        VALUES (:MENO, :PRIEZVISKO, :ID_PACIENTA, :TYP_KRVI, :VEK, :POHLAVIE)
    `;

            // Vkladanie dát do tabuľky
            try {
                for (const record of data) {
                    await connection.execute(insertQuery, record, { autoCommit: true });
                }
            } catch (error) {
                console.error("Chyba pri vkladaní dát:", error);
            }

            await connection.close();
        };
}

module.exports = AnonymizationModel;
