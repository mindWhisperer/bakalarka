const { faker } = require('@faker-js/faker');
const Papa = require('papaparse');
const fs = require('fs');

const generalize = (data) => {
    return data.map(record => {
        const age = Math.floor(record.VEK);
        let genVek = null;
        if (age) {
            //if (age < 20) genVek = "Pod 20";
            if (age < 30) genVek = "Pod 30";
            else if (age < 40) genVek = "30-39";
            else if (age < 50) genVek = "40-49";
            //else if (age < 60) genVek = "50-59";
            else genVek = "50+";
        }

        const genKrvnaSkupina = record.TYP_KRVI ? record.TYP_KRVI.replace(/[+-]/, "") : null;

        const genIDPacienta = record.ID_PACIENTA ? String(record.ID_PACIENTA).slice(0, 1) + "XX" : null;

        return {
            MENO: record.MENO,
            PRIEZVISKO: record.PRIEZVISKO,
            ID_PACIENTA: genIDPacienta,
            TYP_KRVI: genKrvnaSkupina,
            VEK: genVek,
            POHLAVIE: record.POHLAVIE,
            TYP_CHOROBY: record.TYP_CHOROBY
        };
    });
};

const getRandomColor = () => {
    const colors = ["#C599B6", "#E6B2BA", "#FAD0C4", "#FFF7F3", "#7A73D1", "#FFDFEF", "#B2A5FF", "#EFB6C8",
    "#79D7BE", "#CDC1FF", "#A294F9", "#D9EAFD", "#BCCCDC", "#EFB6C8", "#FFD2A0", "#A1EEBD",
        "#FCF596", "#7AB2D3", "#FFECC8", "#B692C2", "#E0FBE2", "#BFF6C3", "#EAD8C0",];
    return colors[Math.floor(Math.random() * colors.length)];
}

const kAnonymity = (data) => {
    const k = 5;
    const generalizedData = generalize(data);

    const groups = {};
    const groupColors = {}
    generalizedData.forEach(record => {
        const key = `${record.VEK}-${record.POHLAVIE}-${record.TYP_KRVI}-${record.ID_PACIENTA}-${record.TYP_CHOROBY}`;
        if (!groups[key]) {
            groups[key] = [];
            groupColors[key] = getRandomColor();
        }
        groups[key].push(record);
    });

    // odstranenie mensich skupin ako k
    const anonymizedData = [];
    const removedGroups = {}
    Object.entries(groups).forEach(([key, group]) => {
        if (group.length >= k) {
            anonymizedData.push(...group.map(record => {
                const anonymizedRecord = { ...record };
                delete anonymizedRecord.MENO;
                delete anonymizedRecord.PRIEZVISKO;
                anonymizedRecord.color = groupColors[key];  // Farba skupiny

                return anonymizedRecord;
            }));
        } else {
            removedGroups[key] = group;
        }
    });

    console.log("Odstránené skupiny:", removedGroups);
    return anonymizedData;
};

const lDiversity = (data) => {
    const l = 2;
    const generalizedData = generalize(data);

    const groups = {};
    const groupColors = {}

    generalizedData.forEach(record => {
        const key = `${record.VEK}-${record.POHLAVIE}-${record.ID_PACIENTA}`;
        if (!groups[key]) {
            groups[key] = [];
            groupColors[key] = getRandomColor();
        }
        groups[key].push(record);
    });

    const anonymizedData = [];
    const removedGroups = {}

    Object.entries(groups).forEach(([key, group]) => {
        const uniqueBloodTypes = new Set(group.map(item => item.TYP_KRVI));
        const uniqueDiseaseTypes = new Set(group.map(item => item.TYP_CHOROBY));

        if (uniqueBloodTypes.size >= l || uniqueDiseaseTypes.size >= l) {
            anonymizedData.push(...group.map(record => {
                const anonymizedRecord = { ...record };
                delete anonymizedRecord.MENO;
                delete anonymizedRecord.PRIEZVISKO;

                anonymizedRecord.color = groupColors[key];

                return anonymizedRecord;
            }));
        } else {
            removedGroups[key] = group;
        }
    });

    console.log("Odstránené skupiny:", removedGroups);
    return anonymizedData;
};

const tCloseness = () => {

};

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

const randomMasking =(data) => {
    return data.map(() => {
        const idPatient = Math.random() < 0.1 ? null : generatePatientsId();
        const {bin, birthDate, isFemale} = generateRandomBIN();
        const age = getAge(birthDate);
        const gender = getGender(isFemale);
        const { name, surname } = getRandomNameAndSurname(isFemale);

        return {
            MENO: name,
            PRIEZVISKO: surname,
            ID_PACIENTA: idPatient,
            ROD_CISLO: bin,
            TYP_KRVI: idPatient ? faker.helpers.arrayElement(["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"]) : null,
            VEK: age,
            POHLAVIE: gender,
            TYP_CHOROBY: idPatient ? faker.helpers.arrayElement(["Choroby krvi a krvotvorných orgánov", "Choroby svalovej a kostrovej sústavy a spojivového tkaniva",
                "Faktory ovplyvňujúce zdravotný stav a styk so zdravotníckymi službami", "Poranenia, otravy a niektoré iné následky vonkajších príčin",
                "Vrodené chyby, deformity a chromozómové anomálie", "Vonkajšie príčiny chorobnosti a úmrtnosti",
                "Choroby dýchacej sústavy", "Choroby tráviacej sústavy", "Choroby ucha a hlávkového výbežku", "Choroby obehovej sústavy",
            "Choroby oka a očných adnexov", "Nádory", "Infekčné a parazitové choroba ", "Choroby močovopohlavnej sústavy",
            "Choroby kože a podkožného tkaniva", "Kódy na osobitné účely", "Infekčné a parazitové choroby", "Duševné poruchy a poruchy správania",
            "Endokrinné, nutričné a metabolické choroby", "Choroby nervovej sústavy"]) : null
        };
    });
}

module.exports = {generalize, kAnonymity, lDiversity, tCloseness,randomMasking}