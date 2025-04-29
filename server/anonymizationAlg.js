// Import pomocných funkcií a knižnice faker
const { faker } = require('@faker-js/faker');
const {generateRandomBIN, getAge, getGender, dataGroup, computeDistribution, computeEMD, loadCSV } = require('./helpers');

/**
 * Generalizuje údaje pacienta, vek do kategórií a krvné skupiny bez znamienok.
 * @param {Array<Object>} data - Pole záznamov o pacientoch.
 * @returns {Array<Object>} - Zovšeobecnené údaje.
 */
const generalize = (data) => {
    return data.map(record => {
        const age = Math.floor(record.VEK); // Vek konvertujeme na celé číslo
        let genVek = null;

        // Rozdelenie veku do kategórií
        if (age) {
            if (age < 20) genVek = "Pod 20";
            else if (age < 30) genVek = "20-29";
            else if (age < 40) genVek = "30-39";
            else if (age < 50) genVek = "40-49";
            else if (age < 60) genVek = "50-59";
            else genVek = "60+";
        }

        // Odstránenie znamienka z krvnej skupiny
        const genBloodType = record.TYP_KRVI ? record.TYP_KRVI.replace(/[+-]/, "") : null;

        // Vrátenie zovšeobecnených údajov
        return {
            TYP_KRVI: genBloodType,
            VEK: genVek,
            POHLAVIE: record.POHLAVIE,
            TYP_CHOROBY: record.TYP_CHOROBY,
            TYP_POSTIHNUTIA: record.TYP_POSTIHNUTIA
        };
    });
};

/**
 * Aplikuje princíp k-anonymity na vstupné údaje.
 * @param {Array<Object>} data - Pole záznamov o pacientoch.
 * @returns {Array<Object>} - Anonymizované údaje.
 */
const kAnonymity = (data) => {
    const k = 10;  // Stanovenie hodnoty k (minimálny počet záznamov v skupine)
    const generalizedData = generalize(data);  // Generalizácia údajov

    const { groups, groupColors } = dataGroup(generalizedData, ["VEK", "POHLAVIE"]); // Skupiny na základe veku a pohlavia


    const anonymizedData = []; // Anonymizované údaje
    const removedGroups = {} // Skupiny, ktoré boli odstránené
    // Pre každý kľúč a skupinu kontrolujeme, či je počet členov aspoň k
    Object.entries(groups).forEach(([key, group]) => {
        if (group.length >= k) {
            anonymizedData.push(...group.map(record => {
                const anonymizedRecord = { ...record };
                anonymizedRecord.color = groupColors[key]; // Priradenie farby skupiny

                return anonymizedRecord;
            }));
        } else {
            removedGroups[key] = group; // Ak je skupina menšia ako k, odstránime ju
        }
    });

    console.log("Odstránené skupiny:", removedGroups); // Výpis odstránených skupín
    return anonymizedData; // Vrátenie anonymizovaných údajov
};

/**
 * Aplikuje princíp l-diverzity na vstupné údaje.
 * @param {Array<Object>} data - Pole záznamov o pacientoch.
 * @returns {Array<Object>} - Anonymizované údaje.
 */
const lDiversity = (data) => {
    const l = 3; // Stanovenie hodnoty l (minimálny počet rôznych hodnôt pre citlivé atribúty)
    const generalizedData = generalize(data);  // Generalizácia údajov

    const { groups, groupColors } = dataGroup(generalizedData, ["VEK", "POHLAVIE"]); // Skupiny na základe veku a pohlavia

    const anonymizedData = []; // Anonymizované údaje
    const removedGroups = {} // Skupiny, ktoré boli odstránené

    // Pre každú skupinu kontrolujeme, či má aspoň l rôznych hodnôt pre citlivé atribúty
    Object.entries(groups).forEach(([key, group]) => {
        const uniqueBloodTypes = new Set(group.map(item => item.TYP_KRVI));
        const uniqueDiseaseTypes = new Set(group.map(item => item.TYP_CHOROBY));
        const uniqueDisabilityTypes = new Set(group.map(item => item.TYP_POSTIHNUTIA));
        const allNull = [ ...uniqueDiseaseTypes, ...uniqueDisabilityTypes].every(value => value === null);

        // Ak skupina má dostatok rôznych hodnôt pre všetky citlivé atribúty, pridáme ju do anonymizovaných dát
        if (uniqueBloodTypes.size >= l && uniqueDiseaseTypes.size >= l && uniqueDisabilityTypes.size >= l) {
            anonymizedData.push(...group.map(record => {
                const anonymizedRecord = { ...record };
                anonymizedRecord.color = groupColors[key];
                return anonymizedRecord;
            }));
        } else if (allNull) {
            // Ak sú všetky hodnoty null, skupinu ponechaj
            anonymizedData.push(...group.map(record => ({
            ...record,
            color: groupColors[key],
            })));
         } else {
            removedGroups[key] = group; // Ak skupina nevyhovuje l-diversity, odstránime ju
        }
    });

    console.log("Odstránené skupiny:", removedGroups); // Výpis odstránených skupín
    return anonymizedData; // Vrátenie anonymizovaných údajov
};

/**
 * Aplikuje princíp t-closeness na vstupné údaje pomocou EMD (Earth Mover's Distance).
 * @param {Array<Object>} data - Pole záznamov o pacientoch.
 * @param {number} t - Prahová hodnota pre EMD.
 * @returns {Array<Object>} - Anonymizované údaje.
 */
const tCloseness = (data, t = 0.3) => {
    const generalizedData = generalize(data); // Generalizácia údajov

    // Výpočet globálnej distribúcie pre citlivé atribúty
    const globalDist = computeDistribution(generalizedData, "TYP_CHOROBY");
    const globalDistBlood = computeDistribution(generalizedData, "TYP_KRVI");
    const globalDistDisability = computeDistribution(generalizedData, "TYP_POSTIHNUTIA");

    // Výpis globálnych distribúcií
    console.log("Celkové rozdelenie chorob: ", globalDist);
    console.log("Celkové rozdelenie krvných skupín: ", globalDistBlood);
    console.log("Celkové rozdelenie postihnnuti: ", globalDistDisability);

    const { groups, groupColors } = dataGroup(generalizedData,  ["VEK", "POHLAVIE"]); // Skupiny na základe veku a pohlavia
    const anonymizedData = []; // Anonymizované údaje
    const removedGroups = {};  // Skupiny, ktoré boli odstránené

    // Porovnanie distribúcie v skupine s globálnou distribúciou pomocou EMD (Earth Mover's Distance)
    Object.entries(groups).forEach(([key, group]) => {
        //distribucie v skupine
        const localDist = computeDistribution(group, "TYP_CHOROBY");
        const localDistBlood = computeDistribution(group, "TYP_KRVI");
        const localDistDisability = computeDistribution(group, "TYP_POSTIHNUTIA");
        //vypis distribucie v skupine
        console.log(`Distribúcia pre skupinu ${key} :`, localDist);
        console.log(`Distribúcia pre skupinu ${key} (krvné skupiny):`, localDistBlood);
        console.log(`Distribúcia pre skupinu ${key} (postihnutia):`, localDistDisability);
        //vypociranie emd
        const emd = computeEMD(globalDist, localDist);
        const emdBlood = computeEMD(globalDistBlood, localDistBlood);
        const emdDisability = computeEMD(globalDistDisability, localDistDisability);

        // Ak je EMD menšie ako prah t, ponechaj skupinu
        if (emd <= t && emdBlood <= t && emdDisability <= t) {
            anonymizedData.push(...group.map(record => {
                const anonymizedRecord = { ...record };
                anonymizedRecord.color = groupColors[key];

                return anonymizedRecord;
            }));
        } else {
            // Skupinu odstráň, ak je rozdiel v distribúcii príliš veľký
            removedGroups[key] = {
                localDist: localDist,
                bloodDist: localDistBlood,
                disabilityDist: localDistDisability
            };
        }
    });

    // Výpis odstránených skupín s ich distribúciami
    console.log("Odstránené skupiny:");
    Object.entries(removedGroups).forEach(([key, value]) => {
        console.log(`Skupina ${key} :`);
        console.log(`Distribúcia v odstránenej skupine ${key} :`, value.localDist);
        console.log(`Distribúcia krvných skupín v odstránenej skupine ${key} :`, value.bloodDist);
        console.log(`Distribúcia postihnuti v odstránenej skupine ${key} :`, value.disabilityDist);
    });

    return anonymizedData;
};

// CSV cache pre mená a priezviská
let maleNames = [], femaleNames = [], maleSurnames = [], femaleSurnames = [];
let csvLoaded = false;

/**
 * Načíta CSV súbory s menami a priezviskami do pamäte (iba raz).
 */
function preloadCSVData() {
    if (csvLoaded) return;

    maleNames = loadCSV('data/male_names.csv');
    femaleNames = loadCSV('data/female_names.csv');
    maleSurnames = loadCSV('data/male_surnames.csv');
    femaleSurnames = loadCSV('data/female_surnames.csv');
    csvLoaded = true;
}

/**
 * Vráti náhodné meno a priezvisko podľa pohlavia.
 * @param {boolean} isFemale - Určuje, či je osoba žena.
 * @returns {{name: string, surname: string}} - Náhodné meno a priezvisko.
 */
function getRandomNameAndSurname(isFemale) {
    const name = isFemale
        ? femaleNames[Math.floor(Math.random() * femaleNames.length)]
        : maleNames[Math.floor(Math.random() * maleNames.length)];

    const surname = isFemale
        ? femaleSurnames[Math.floor(Math.random() * femaleSurnames.length)]
        : maleSurnames[Math.floor(Math.random() * maleSurnames.length)];

    return { name, surname };
}

/**
 * Aplikuje náhodné maskovanie citlivých údajov pacientov.
 * @param {Array<Object>} data - Pôvodné údaje pacientov s rodným číslom.
 * @returns {Array<Object>} - Anonymizované údaje.
 */
function randomMasking(data) {
    preloadCSVData();
    const usedIds = new Set();

    // Generovanie unikátnych ID
    const generatePatientsId = () => {
        let newId;
        do {
            newId = Math.floor(Math.random() * 99999) + 1;
        } while (usedIds.has(newId));
        usedIds.add(newId);
        return newId;
    };
    return data.map((row) => {
        const idPatient = Math.random() < 0.1 ? null : generatePatientsId();
        const { birthDate, isFemale } = generateRandomBIN(row.ROD_CISLO);
        const age = getAge(birthDate);
        const gender = getGender(isFemale);
        const { name, surname } = getRandomNameAndSurname(isFemale);

        let disabilities = ["Telesné" , "Zrakové" , "Sluchové" , "Chronické" , "Rečové" , "Mentálne/Duševné" , "Psychické" , "Kombinované"];

        let diagnoses = [
            "Choroby krvi a krvotvorných orgánov", "Choroby svalovej a kostrovej sústavy a spojivového tkaniva", "Faktory ovplyvňujúce zdravotný stav a styk so zdravotníckymi službami", "Poranenia, otravy a niektoré iné následky vonkajších príčin", "Vrodené chyby, deformity a chromozómové anomálie", "Vonkajšie príčiny chorobnosti a úmrtnosti", "Choroby dýchacej sústavy", "Choroby tráviacej sústavy", "Choroby ucha a hlávkového výbežku", "Choroby obehovej sústavy", "Choroby oka a očných adnexov", "Nádory", "Infekčné a parazitové choroby", "Choroby močovopohlavnej sústavy", "Choroby kože a podkožného tkaniva", "Kódy na osobitné účely", "Duševné poruchy a poruchy správania", "Endokrinné, nutričné a metabolické choroby", "Choroby nervovej sústavy"
        ];

        if (gender === "Z") {
            diagnoses.push("Gravidita, pôrod a šestonedelie");
        }

        if (age === 0) {
            diagnoses.push("Určité choroby vzniknuté v perinatálnom období");
        }

        // Vytvorenie anonymizovaných údajov
        return {
            MENO: name,
            PRIEZVISKO: surname,
            ID_PACIENTA: idPatient,
            TYP_KRVI: idPatient ? faker.helpers.arrayElement(["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"]) : null,
            VEK: age,
            POHLAVIE: gender,
            TYP_CHOROBY: idPatient ? faker.helpers.arrayElement(diagnoses) : null,
            TYP_POSTIHNUTIA: idPatient ? faker.helpers.arrayElement(disabilities) : null
        };
    });
}

module.exports = {generalize, kAnonymity, lDiversity, tCloseness,randomMasking}