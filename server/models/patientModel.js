const { getConnection } = require("../config/db");
const oracledb = require("oracledb");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

class PatientModel {

    static async getAllPatients() {
        const connection = await getConnection();
        const result = await connection.execute(
            `SELECT MENO, PRIEZVISKO, OS_UDAJE.ROD_CISLO, P.ID_PACIENTA, TYP_KRVI,
                    FLOOR(MONTHS_BETWEEN(SYSDATE,
                        (CASE
                            WHEN TO_NUMBER(SUBSTR(OS_UDAJE.ROD_CISLO, 1, 2)) < 25
                                THEN TO_DATE('20' || SUBSTR(OS_UDAJE.ROD_CISLO, 1, 2) ||
                                    '.' || (CASE  WHEN TO_NUMBER(SUBSTR(OS_UDAJE.ROD_CISLO, 3, 2)) BETWEEN 21 AND 42
                                                    THEN TO_NUMBER(SUBSTR(OS_UDAJE.ROD_CISLO, 3, 2)) - 20
                                                WHEN TO_NUMBER(SUBSTR(OS_UDAJE.ROD_CISLO, 3, 2)) > 50
                                                    THEN TO_NUMBER(SUBSTR(OS_UDAJE.ROD_CISLO, 3, 2)) - 50
                                                ELSE TO_NUMBER(SUBSTR(OS_UDAJE.ROD_CISLO, 3, 2)) END) ||
                                    '.' || SUBSTR(OS_UDAJE.ROD_CISLO, 5, 2), 'YYYY.MM.DD')
                            ELSE TO_DATE('19' || SUBSTR(OS_UDAJE.ROD_CISLO, 1, 2) ||
                                '.' || (CASE  WHEN TO_NUMBER(SUBSTR(OS_UDAJE.ROD_CISLO, 3, 2)) BETWEEN 21 AND 42
                                                THEN TO_NUMBER(SUBSTR(OS_UDAJE.ROD_CISLO, 3, 2)) - 20
                                            WHEN TO_NUMBER(SUBSTR(OS_UDAJE.ROD_CISLO, 3, 2)) > 50
                                                THEN TO_NUMBER(SUBSTR(OS_UDAJE.ROD_CISLO, 3, 2)) - 50
                                            ELSE TO_NUMBER(SUBSTR(OS_UDAJE.ROD_CISLO, 3, 2)) END) ||
                                '.' || SUBSTR(OS_UDAJE.ROD_CISLO, 5, 2), 'YYYY.MM.DD')
                        END)
                    ) / 12) AS VEK,
                    CASE
                        WHEN TO_NUMBER(SUBSTR(OS_UDAJE.ROD_CISLO, 3, 2)) > 50 THEN 'Z'
                        ELSE 'M'
                    END AS POHLAVIE
            FROM OS_UDAJE
                     LEFT JOIN NIS_BC.PACIENT P ON OS_UDAJE.ROD_CISLO = P.ROD_CISLO
                     LEFT JOIN NIS_BC.ZDRAVOTNA_KARTA ZK ON P.ID_PACIENTA = ZK.ID_PACIENTA
            `
        );
        await connection.close();
        return result.rows;
    }

    static async getAllHospitalizedPatients() {
        const connection = await getConnection();

        try {
            const result = await connection.execute(
                `SELECT MENO, PRIEZVISKO, P.ID_PACIENTA, TYP_KRVI,
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
                END AS POHLAVIE, CH.TYP as TYP_CHOROBY
            FROM NIS_BC.PACIENT P
            JOIN NIS_BC.ZDRAVOTNA_KARTA ZK ON P.ID_PACIENTA = ZK.ID_PACIENTA
            JOIN NIS_BC.ZOZNAM_OCHORENI ZO ON ZK.ID_KARTY = ZO.ID_KARTY
            JOIN NIS_BC.CHOROBA CH ON CH.ID_CHOROBY = ZO.ID_CHOROBY
            JOIN OS_UDAJE OS ON P.ROD_CISLO = OS.ROD_CISLO`
            );

            await connection.close();
            return result.rows; // Vráti všetky údaje naraz
        } catch (error) {
            await connection.close();
            throw error;
        }
    }


    static async getDiseasesType(){
        const connection = await getConnection();
        try{
            const result = await connection.execute(
                `select distinct TYP from CHOROBA`
            );
            await connection.close();
            return result.rows;
        } catch (error) {
            await connection.close();
            throw error;
        }
    }
}


module.exports = PatientModel;
