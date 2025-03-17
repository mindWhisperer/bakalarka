const express = require('express');
const cors = require('cors');
const oracledb = require("oracledb");
const {getConnection} = require('./db');
const server = express();
const port = process.env.PORT || 4000;
const {generalize, randomMasking, kAnonymity, lDiversity, tCloseness} = require('./anonymizationAlg');

require('dotenv/config');


server.use(cors()); // Povolenie CORS pre frontend
server.use(express.json()); // Middleware na spracovanie JSON


oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;


server.get('/api/data', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
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
             FETCH FIRST 20 ROWS ONLY`
        );

        res.json(result.rows); // Odoslanie dát ako JSON pre frontend
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Chyba pri načítaní údajov" });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

server.get('/', (req, res) => {
    res.send('Server beží! Použi /api/data na získanie údajov.');
});

server.post('/api/anonymize', async(req, res) => {
    try {
        const { data, method } = req.body;
        if (!data || data.length === 0) {
            return res.status(400).json({ error: 'Žiadne údaje na anonymizáciu' });
        }

        let anonymizedData;

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
                anonymizedData = generalize(data);
        }

        await saveAnonymizedData(anonymizedData, method);

        res.json(anonymizedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Chyba pri anonymizácii údajov' });
    }
})

const saveAnonymizedData = async (data, method) => {
    const connection = await getConnection();
    const tableName = `ANONYMIZED_${method.toUpperCase()}`;

    await connection.execute(`
        CREATE TABLE ${tableName} (
                ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                MENO VARCHAR2(100),
                PRIEZVISKO VARCHAR2(100),
                ID_PACIENTA VARCHAR2(10),
                TYP_KRVI VARCHAR2(5),
                VEK VARCHAR2(20),
                POHLAVIE VARCHAR2(10))
    `);

    const insertQuery = `
        INSERT INTO ${tableName} (MENO, PRIEZVISKO, ID_PACIENTA, TYP_KRVI, VEK, POHLAVIE)
        VALUES (:MENO, :PRIEZVISKO, :ID_PACIENTA, :TYP_KRVI, :VEK, :POHLAVIE)
    `;

    for (const record of data) {
        await connection.execute(insertQuery, record, { autoCommit: true });
    }

    await connection.close();
};

server.listen(port, () => {
    console.log(`Server beží na http://localhost:${port}`);
});
