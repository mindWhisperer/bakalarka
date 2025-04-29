// Načítanie knižníc
const express = require('express');
const cors = require('cors');
// Načítanie smerovacích modulov
const patientRoutes = require("./routes/patientRoutes");
const anonymizationRoutes = require("./routes/anonymizationRoutes");
const server = express(); // Vytvorenie inštancie Express servera
const port = process.env.PORT || 4000; // Definovanie portu (z .env alebo predvolený 4000)

// Načítanie konfigurácie z .env súboru
require('dotenv/config');

// Povolenie CORS, aby mohol frontend pristupovať k API z iného pôvodu (origin)
server.use(cors());
// Middleware na spracovanie JSON telies požiadaviek (limit nastavený na 50MB)
server.use(express.json({ limit: '50mb' }));

// Pripojenie routov pre prácu s pacientmi a anonymizáciou pod prefixom /api
server.use("/api", patientRoutes);
server.use("/api", anonymizationRoutes);

// Hlavná GET trasa pre kontrolu, či server beží
server.get("/", (req, res) => {
    res.send("Server beží! Použi /api/data na získanie údajov.");
});

// Spustenie servera na zadanom porte
server.listen(port, () => {
    console.log(`Server beží na http://localhost:${port}`);
});
