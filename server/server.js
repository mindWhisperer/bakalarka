const express = require('express');
const cors = require('cors');
const oracledb = require("oracledb");
const {getConnection} = require('./db');
const server = express();
const port = process.env.PORT || 4000;

require('dotenv/config');


server.use(cors()); // Povolenie CORS pre frontend
server.use(express.json()); // Middleware na spracovanie JSON


oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;


server.get('/api/data', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT MENO, PRIEZVISKO, OS_UDAJE.ROD_CISLO, P.ID_PACIENTA, TYP_KRVI
             FROM OS_UDAJE
                     LEFT JOIN NIS_BC.PACIENT P ON OS_UDAJE.ROD_CISLO = P.ROD_CISLO
                    LEFT JOIN NIS_BC.ZDRAVOTNA_KARTA ZK ON P.ID_PACIENTA = ZK.ID_PACIENTA`
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

})

server.listen(port, () => {
    console.log(`Server beží na http://localhost:${port}`);
});
