const express = require('express');
const cors = require('cors');
const patientRoutes = require("./routes/patientRoutes");
const anonymizationRoutes = require("./routes/anonymizationRoutes");
const server = express();
const port = process.env.PORT || 4000;

require('dotenv/config');


server.use(cors()); // Povolenie CORS pre frontend
server.use(express.json({ limit: '50mb' })); // Middleware na spracovanie JSON zvacsena kapacita

server.use("/api", patientRoutes);
server.use("/api", anonymizationRoutes);

server.get("/", (req, res) => {
    res.send("Server beží! Použi /api/data na získanie údajov.");
});

server.listen(port, () => {
    console.log(`Server beží na http://localhost:${port}`);
});
