// Importovanie funkcie na získanie pripojenia do databázy a Oracle DB knižnice
const { getConnection } = require("../config/db");
const oracledb = require("oracledb");

// Nastavenie formátu výsledkov dotazu na objekt
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

class PatientModel {

    /**
     * Funkcia pre získanie všetkých pacientov (aj hospitalizovaných aj nie)
     * @returns {Object} - Vráti objekty s údajmi pacientov a trvanie dotazu
     */
    static async getAllPatients() {
        const connection = await getConnection(); // Získanie pripojenia do databázy
        const start = performance.now(); // Meranie času pred vykonaním dotazu

        // SQL dotaz na získanie všetkých pacientov spolu s niektorými údajmi (vek, pohlavie, choroba, postihnutie)
        const result = await connection.execute(
            `SELECT MENO, PRIEZVISKO, P.ID_PACIENTA, OS.ROD_CISLO, TYP_KRVI,
                    FLOOR(MONTHS_BETWEEN(SYSDATE,
                                         CASE
                                             WHEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 1, 2)) < 25
                                                 THEN TO_DATE('20' || SUBSTR(OS.ROD_CISLO, 1, 2) ||
                                                              '.' || (CASE
                                                                          WHEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) BETWEEN 21 AND 32
                                                                              THEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) - 20
                                                                          WHEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) > 50
                                                                              THEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) - 50
                                                                          ELSE TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2))
                                                     END) || '.' || SUBSTR(OS.ROD_CISLO, 5, 2), 'YYYY.MM.DD')
                                             ELSE TO_DATE('19' || SUBSTR(OS.ROD_CISLO, 1, 2) ||
                                                          '.' || (CASE
                                                                      WHEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) BETWEEN 21 AND 32
                                                                          THEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) - 20
                                                                      WHEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) > 50
                                                                          THEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) - 50
                                                                      ELSE TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2))
                                                     END) || '.' || SUBSTR(OS.ROD_CISLO, 5, 2), 'YYYY.MM.DD')
                                             END) / 12) AS VEK,
                    CASE
                        WHEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) > 50 THEN 'Z'
                        ELSE 'M'
                        END AS POHLAVIE, CH.TYP as TYP_CHOROBY, POSTIHNUTIE.TYP as TYP_POSTIHNUTIA
             FROM NIS_BC.PACIENT P
                      LEFT JOIN NIS_BC.ZDRAVOTNA_KARTA ZK ON P.ID_PACIENTA = ZK.ID_PACIENTA
                      LEFT JOIN NIS_BC.ZOZNAM_OCHORENI ZO ON ZK.ID_KARTY = ZO.ID_KARTY
                      LEFT JOIN NIS_BC.CHOROBA CH ON CH.ID_CHOROBY = ZO.ID_CHOROBY
                      right JOIN OS_UDAJE OS ON P.ROD_CISLO = OS.ROD_CISLO
                      LEFT JOIN NIS_BC.ZOZNAM_POSTIHNUTI ZP ON ZK.ID_KARTY = ZP.ID_KARTY
                      LEFT JOIN POSTIHNUTIE ON ZP.ID_POSTIHNUTIA = POSTIHNUTIE.ID_POSTIHNUTIA`
        );

        const end = performance.now(); // Meranie času po vykonaní dotazu
        const duration = end - start; // Výpočet trvania dotazu

        await connection.close(); // Uzavretie pripojenia k databáze
        return {
            rows: result.rows, // Vrátenie riadkov s výsledkami dotazu
            duration: duration // Vrátenie trvania dotazu
        }
    }

    /**
     * Funkcia pre získanie pacientov, ktorí sú hospitalizovaní
     * @returns {Object} - Vráti objekty s údajmi hospitalizovaných pacientov a trvanie dotazu
     */
    static async getAllHospitalizedPatients() {
        const connection = await getConnection(); // Získanie pripojenia k databáze

        try {
            const start = performance.now(); // Meranie času pred vykonaním dotazu
            const result = await connection.execute(
                `SELECT MENO, PRIEZVISKO, P.ID_PACIENTA, OS.ROD_CISLO, TYP_KRVI,
                        FLOOR(MONTHS_BETWEEN(SYSDATE,
                                             CASE
                                                 WHEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 1, 2)) < 25
                                                     THEN TO_DATE('20' || SUBSTR(OS.ROD_CISLO, 1, 2) ||
                                                                  '.' || (CASE
                                                                              WHEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) BETWEEN 21 AND 32
                                                                                  THEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) - 20
                                                                              WHEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) > 50
                                                                                  THEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) - 50
                                                                              ELSE TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2))
                                                         END) || '.' || SUBSTR(OS.ROD_CISLO, 5, 2), 'YYYY.MM.DD')
                                                 ELSE TO_DATE('19' || SUBSTR(OS.ROD_CISLO, 1, 2) ||
                                                              '.' || (CASE
                                                                          WHEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) BETWEEN 21 AND 32
                                                                              THEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) - 20
                                                                          WHEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) > 50
                                                                              THEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) - 50
                                                                          ELSE TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2))
                                                         END) || '.' || SUBSTR(OS.ROD_CISLO, 5, 2), 'YYYY.MM.DD')
                                                 END) / 12) AS VEK,
                        CASE
                            WHEN TO_NUMBER(SUBSTR(OS.ROD_CISLO, 3, 2)) > 50 THEN 'Z'
                            ELSE 'M'
                            END AS POHLAVIE, CH.TYP as TYP_CHOROBY, POSTIHNUTIE.TYP as TYP_POSTIHNUTIA
                 FROM NIS_BC.PACIENT P
                          JOIN OS_UDAJE OS ON P.ROD_CISLO = OS.ROD_CISLO
                          LEFT JOIN NIS_BC.ZDRAVOTNA_KARTA ZK ON P.ID_PACIENTA = ZK.ID_PACIENTA
                          LEFT JOIN NIS_BC.ZOZNAM_OCHORENI ZO ON ZK.ID_KARTY = ZO.ID_KARTY
                          LEFT JOIN NIS_BC.CHOROBA CH ON CH.ID_CHOROBY = ZO.ID_CHOROBY
                          LEFT JOIN NIS_BC.ZOZNAM_POSTIHNUTI ZP ON ZK.ID_KARTY = ZP.ID_KARTY
                          LEFT JOIN POSTIHNUTIE ON ZP.ID_POSTIHNUTIA = POSTIHNUTIE.ID_POSTIHNUTIA
                 WHERE CH.ID_CHOROBY IS NOT NULL OR POSTIHNUTIE.ID_POSTIHNUTIA IS NOT NULL
                `
            );

            const end = performance.now(); // Meranie času po vykonaní dotazu
            const duration = end - start; // Výpočet trvania dotazu

            await connection.close(); // Uzavretie pripojenia k databáze
            return {
                rows: result.rows, // Vrátenie riadkov s výsledkami dotazu
                duration: duration // Vrátenie trvania dotazu
            }; // Vráti všetky údaje naraz
        } catch (error) {
            await connection.close(); // Uzavretie pripojenia v prípade chyby
            throw error; // Vyhodenie chyby, ktorá nastala pri dotaze
        }
    }


    /**
     * Funkcia pre získanie všetkých typov chorôb
     * @returns {Array} - Vráti pole rôznych typov chorôb
     */
    static async getDiseasesType(){
        const connection = await getConnection(); // Získanie pripojenia k databáze
        try{
            // Dotaz na získanie rôznych typov chorôb
            const result = await connection.execute(
                `select distinct TYP from CHOROBA`
            );
            await connection.close(); // Uzavretie pripojenia
            return result.rows; // Vrátenie výsledkov dotazu
        } catch (error) {
            await connection.close(); // Uzavretie pripojenia v prípade chyby
            throw error; // Vyhodenie chyby
        }
    }

    /**
     * Funkcia pre získanie všetkých typov krviniek
     * @returns {Array} - Vráti pole rôznych typov krviniek
     */
    static async getBloodType(){
        const connection = await getConnection(); // Získanie pripojenia k databáze
        try{
            // Dotaz na získanie rôznych typov krviniek
            const result = await connection.execute(
                `select distinct TYP_KRVI from ZDRAVOTNA_KARTA`
            );
            await connection.close(); // Uzavretie pripojenia
            return result.rows; // Vrátenie výsledkov dotazu
        } catch (error) {
            await connection.close(); // Uzavretie pripojenia v prípade chyby
            throw error; // Vyhodenie chyby
        }
    }
}

module.exports = PatientModel;
