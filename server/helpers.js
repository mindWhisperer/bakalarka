const Papa = require('papaparse');
const fs = require('fs');

const getRandomColor = () => {
    const colors = ["#C599B6", "#E6B2BA", "#FAD0C4", "#FFF7F3", "#7A73D1", "#FFDFEF", "#B2A5FF", "#EFB6C8",
        "#79D7BE", "#CDC1FF", "#A294F9", "#D9EAFD", "#BCCCDC", "#EFB6C8", "#FFD2A0", "#A1EEBD",
        "#FCF596", "#7AB2D3", "#FFECC8", "#B692C2", "#E0FBE2", "#BFF6C3", "#EAD8C0",];
    return colors[Math.floor(Math.random() * colors.length)];
}

function generateRandomBIN() {
    const year = Math.floor(Math.random() * (2024-1950+1))+1950;
    const month = Math.floor(Math.random() * 12)+1;
    const day = Math.floor(Math.random() * 28)+1;
    const isFemale = Math.random() < 0.5;
    const randNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    const formYear = year.toString().slice(-2);
    const formMonth = (month + (isFemale ? 50 : 0)).toString().padStart(2, '0');
    const formDay = day.toString().padStart(2, '0');

    const bin = `${formYear}${formMonth}${formDay}/${randNumber}`;
    const birthDate = new Date(year, month-1, day);

    return {bin, birthDate, isFemale};
}

function getAge(birthDate) {
    const currentDate = new Date();
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth();
    const day = birthDate.getDate();

    let age = currentDate.getFullYear() - year;

    if (
        currentDate.getMonth() < month ||
        (currentDate.getMonth() === month && currentDate.getDate() < day)
    ) {
        age--;
    }

    return age;
}

function getGender (isFemale) {
    return isFemale ? 'Z' : 'M';
}

const usedPatientsId = [];

function generatePatientsId() {
    let newId;
    do {
        newId = Math.floor(Math.random() * 99999) + 1;
    } while (usedPatientsId.includes(newId));

    usedPatientsId.push(newId);
    return newId;
}

function loadCSV(filePath) {
    const csvFile = fs.readFileSync(filePath, 'utf-8');
    const parsedData = Papa.parse(csvFile, {
        header: false,
        skipEmptyLines: true
    });

    return parsedData.data.map(row => row[0]);
}

function getRandomNameAndSurname(isFemale) {
    const maleNames = loadCSV('data/male_names.csv');
    const femaleNames = loadCSV('data/female_names.csv');
    const maleSurnames = loadCSV('data/male_surrname.csv');
    const femaleSurnames = loadCSV('data/female_surrname.csv');

    const randomName = isFemale
        ? femaleNames[Math.floor(Math.random() * femaleNames.length)]
        : maleNames[Math.floor(Math.random() * maleNames.length)];

    const randomSurname = isFemale
        ? femaleSurnames[Math.floor(Math.random() * femaleSurnames.length)]
        : maleSurnames[Math.floor(Math.random() * maleSurnames.length)];

    return {
        name: randomName,
        surname: randomSurname
    };
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

module.exports = {getRandomNameAndSurname, getAge, generateRandomBIN, generatePatientsId, getGender,dataGroup, computeDistribution: calculateDistribution, computeEMD: calculateEMD}