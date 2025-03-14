const express = require('express');
const cors = require('cors');
const oracledb = require("oracledb");
const {getConnection} = require('./db');
const server = express();
const port = process.env.PORT || 4000;
const {generalize} = require('./anonymizationAlg');

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

server.post('/api/anonymize', (req, res) => {
    try {
        const data = req.body;
        if (!data || data.length === 0) {
            return res.status(400).json({ error: 'Žiadne údaje na anonymizáciu' });
        }

        // Voláme funkciu na anonymizáciu údajov
        const anonymizedData = generalize(data);

        res.json(anonymizedData); // Vrátime anonymizované údaje
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Chyba pri anonymizácii údajov' });
    }
})

server.listen(port, () => {
    console.log(`Server beží na http://localhost:${port}`);
});
