const Papa = require('papaparse');
const fs = require('fs');

const getRandomColor = () => {
    const colors = ["#C599B6", "#E6B2BA", "#FAD0C4", "#FFF7F3", "#7A73D1", "#FFDFEF", "#B2A5FF", "#EFB6C8",
        "#79D7BE", "#CDC1FF", "#A294F9", "#D9EAFD", "#BCCCDC", "#EFB6C8", "#FFD2A0", "#A1EEBD",
        "#FCF596", "#7AB2D3", "#FFECC8", "#B692C2", "#E0FBE2", "#BFF6C3", "#EAD8C0", "#F7CFD8", "#A6D6D6",
        "#90C67C", "#9ACBD0"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function generateRandomBIN(bin) {
    const [datePart] = bin.split('/');
    let year = parseInt(datePart.slice(0, 2), 10);
    let month = parseInt(datePart.slice(2, 4), 10);
    const day = parseInt(datePart.slice(4, 6), 10);

    const isFemale = month > 50;
    if (isFemale) month -= 50;

    const currentYear = new Date().getFullYear() % 100;
    const fullYear = year <= currentYear ? 2000 + year : 1900 + year;

    const yearOffset = Math.floor(Math.random() * 11) - 5;
    const newYear = fullYear + yearOffset;

    const birthDate = new Date(newYear, month - 1, day);

    return { bin, birthDate, isFemale };
}

function getAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function getGender(isFemale) {
    return isFemale ? 'Z' : 'M';
}

function loadCSV(filePath) {
    const csvFile = fs.readFileSync(filePath, 'utf-8');
    const parsedData = Papa.parse(csvFile, {
        header: false,
        skipEmptyLines: true
    });

    return parsedData.data.map(row => row[0]);
}

const dataGroup = (data, keyAttributes) => {
    const groups = {};
    const groupColors = {};
    data.forEach(record => {
        const key = keyAttributes.map(attribute => record[attribute]).join("-");
        if (!groups[key]) {
            groups[key] = [];
            groupColors[key] = getRandomColor();
        }
        groups[key].push(record);
    });
    return { groups, groupColors };
};

const calculateDistribution = (data, attribute) => {
    const total = data.length;
    const counts = data.reduce((acc, item) => {
        const value = item[attribute];
        if (value !== undefined && value !== null) {
            acc[value] = (acc[value] || 0) + 1;
        }
        return acc;
    }, {});

    return Object.keys(counts).reduce((dist, key) => {
        dist[key] = counts[key] / total;
        return dist;
    }, {});
};

const calculateEMD = (dist1, dist2) => {
    const keys = new Set([...Object.keys(dist1), ...Object.keys(dist2)]);
    let emd = 0;

    keys.forEach(key => {
        emd += Math.abs((dist1[key] || 0) - (dist2[key] || 0));
    });

    return emd / 2;
};

module.exports = {getAge, generateRandomBIN, getGender,dataGroup, computeDistribution: calculateDistribution, computeEMD: calculateEMD, loadCSV}