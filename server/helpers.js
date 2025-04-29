// Načítanie knižníc na prácu s CSV súbormi a súborovým systémom
const Papa = require('papaparse');
const fs = require('fs');

/**
 * Vygeneruje náhodnú farbu zo zoznamu farieb.
 * @returns {string} Hex kód farby.
 */
const getRandomColor = () => {
    const colors = ["#C599B6", "#E6B2BA", "#FAD0C4", "#FFF7F3", "#7A73D1", "#FFDFEF", "#B2A5FF", "#EFB6C8",
        "#79D7BE", "#CDC1FF", "#A294F9", "#D9EAFD", "#BCCCDC", "#EFB6C8", "#FFD2A0", "#A1EEBD",
        "#FCF596", "#7AB2D3", "#FFECC8", "#B692C2", "#E0FBE2", "#BFF6C3", "#EAD8C0", "#F7CFD8", "#A6D6D6",
        "#90C67C", "#9ACBD0"];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Vygeneruje dátum narodenia a pohlavie zo zadaného rodného čísla (BIN).
 * @param {string} bin - Rodné číslo v tvare RRMMDD/XXXX.
 * @returns {{bin: string, birthDate: Date, isFemale: boolean}} Informácie o dátume narodenia a pohlaví.
 */
function generateRandomBIN(bin) {
    const [datePart] = bin.split('/');
    let year = parseInt(datePart.slice(0, 2), 10);
    let month = parseInt(datePart.slice(2, 4), 10);
    const day = parseInt(datePart.slice(4, 6), 10);

    // Detekcia ženského pohlavia na základe zvýšenej hodnoty mesiaca
    const isFemale = month > 50;
    if (isFemale) month -= 50;

    // Určenie celého roku narodenia (1900 alebo 2000 podľa dvojciferného zápisu)
    const currentYear = new Date().getFullYear() % 100;
    const fullYear = year <= currentYear ? 2000 + year : 1900 + year;

    // Náhodné posunutie roku narodenia o ±5 rokov
    const yearOffset = Math.floor(Math.random() * 11) - 5;
    const newYear = fullYear + yearOffset;

    const birthDate = new Date(newYear, month - 1, day);

    return { bin, birthDate, isFemale };
}

/**
 * Vypočíta vek na základe dátumu narodenia.
 * @param {Date} birthDate - Dátum narodenia.
 * @returns {number} Vek osoby.
 */
function getAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--; // Ak ešte neoslávil narodeniny tento rok, odpočítame 1
    }
    return age;
}

/**
 * Určí pohlavie na základe boolean hodnoty.
 * @param {boolean} isFemale - True ak žena, False ak muž.
 * @returns {'M'|'Z'} Reťazec reprezentujúci pohlavie.
 */
function getGender(isFemale) {
    return isFemale ? 'Z' : 'M';
}

/**
 * Načíta CSV súbor a konvertuje ho na pole hodnôt.
 * @param {string} filePath - Cesta k CSV súboru.
 * @returns {string[]} Pole hodnôt z prvého stĺpca.
 */
function loadCSV(filePath) {
    const csvFile = fs.readFileSync(filePath, 'utf-8');
    const parsedData = Papa.parse(csvFile, {
        header: false,
        skipEmptyLines: true
    });

    // Vráti pole hodnôt z prvého stĺpca CSV
    return parsedData.data.map(row => row[0]);
}

/**
 * Rozdelí dáta do skupín podľa zadaných atribútov.
 * @param {Object[]} data - Pole záznamov.
 * @param {string[]} keyAttributes - Zoznam atribútov, podľa ktorých sa zoskupuje.
 * @returns {{groups: Object.<string, Object[]>, groupColors: Object.<string, string>}} Skupiny a ich farby.
 */
const dataGroup = (data, keyAttributes) => {
    const groups = {};
    const groupColors = {};
    data.forEach(record => {
        // Vytvorenie jedinečného kľúča kombináciou hodnôt atribútov (napr. "30-39-M")
        const key = keyAttributes.map(attribute => record[attribute]).join("-");
        if (!groups[key]) {
            groups[key] = [];
            groupColors[key] = getRandomColor(); // Priradenie náhodnej farby skupine
        }
        groups[key].push(record);
    });
    return { groups, groupColors };
};

/**
 * Vypočíta distribúciu hodnôt atribútu v dátach.
 * @param {Object[]} data - Pole objektov.
 * @param {string} attribute - Atribút, ktorého distribúciu chceme vypočítať.
 * @returns {Object.<string, number>} Distribúcia hodnôt (pravdepodobnosti).
 */
const calculateDistribution = (data, attribute) => {
    const total = data.length;
    const counts = data.reduce((acc, item) => {
        const value = item[attribute];
        if (value !== undefined && value !== null) {
            acc[value] = (acc[value] || 0) + 1; // Zvýš počet výskytov hodnoty
        }
        return acc;
    }, {});

    // Prevod počtov na podiely (pravdepodobnosti)
    return Object.keys(counts).reduce((dist, key) => {
        dist[key] = counts[key] / total;
        return dist;
    }, {});
};

/**
 * Vypočíta Earth Mover’s Distance (EMD) medzi dvomi distribúciami.
 * @param {Object.<string, number>} dist1 - Prvá distribúcia.
 * @param {Object.<string, number>} dist2 - Druhá distribúcia.
 * @returns {number} EMD hodnota (0 = identické, 1 = maximálny rozdiel).
 */
const calculateEMD = (dist1, dist2) => {
    const keys = new Set([...Object.keys(dist1), ...Object.keys(dist2)]);
    let emd = 0;

    keys.forEach(key => {
        emd += Math.abs((dist1[key] || 0) - (dist2[key] || 0));
    });

    return emd / 2; // Polovica zo súčtu rozdielov – štandardná definícia EMD
};

module.exports = {getAge, generateRandomBIN, getGender,dataGroup, computeDistribution: calculateDistribution, computeEMD: calculateEMD, loadCSV}