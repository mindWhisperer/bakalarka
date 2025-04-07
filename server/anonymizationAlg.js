const { faker } = require('@faker-js/faker');
const { generatePatientsId, generateRandomBIN, getAge, getRandomNameAndSurname, getGender, dataGroup } = require('./helpers');

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

const kAnonymity = (data) => {
    const k = 5;
    const generalizedData = generalize(data);

    const { groups, groupColors } = dataGroup(generalizedData, ["VEK", "POHLAVIE", "TYP_KRVI", "ID_PACIENTA", "TYP_CHOROBY"]);

    // odstranenie mensich skupin ako k
    const anonymizedData = [];
    const removedGroups = {}
    Object.entries(groups).forEach(([key, group]) => {
        if (group.length >= k) {
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

const lDiversity = (data) => {
    const l = 2;
    const generalizedData = generalize(data);

    const { groups, groupColors } = dataGroup(generalizedData, ["VEK", "POHLAVIE", "ID_PACIENTA"]);

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


const tCloseness = (data, t = 0.3) => {
    const generalizedData = generalize(data);

    const globalDist = computeDistribution(generalizedData, "TYP_CHOROBY");
    const globalDistBlood = computeDistribution(generalizedData, "TYP_KRVI");

    console.log("Celkové rozdelenie: ", globalDist);
    console.log("Celkové rozdelenie krvných skupín: ", globalDistBlood);

    const { groups, groupColors } = dataGroup(generalizedData,  ["VEK", "POHLAVIE"]);

    const anonymizedData = [];
    const removedGroups = {}; 

    Object.entries(groups).forEach(([key, group]) => {
        const localDist = computeDistribution(group, "TYP_CHOROBY");
        const localDistBlood = computeDistribution(group, "TYP_KRVI");

        console.log(`Distribúcia pre skupinu ${key} :`, localDist);
        console.log(`Distribúcia pre skupinu ${key} (krvné skupiny):`, localDistBlood);

        const emd = computeEMD(globalDist, localDist);
        const emdBlood = computeEMD(globalDistBlood, localDistBlood);

        if (emd <= t && emdBlood <= t) {
            anonymizedData.push(...group.map(record => {
                const anonymizedRecord = { ...record };
                delete anonymizedRecord.MENO;
                delete anonymizedRecord.PRIEZVISKO;
                delete anonymizedRecord.ID_PACIENTA;

                anonymizedRecord.color = groupColors[key];

                return anonymizedRecord;
            }));
        } else {
            removedGroups[key] = {
                localDist: localDist,
                bloodDist: localDistBlood
            };
        }
    });

    console.log("Odstránené skupiny:");
    Object.entries(removedGroups).forEach(([key, value]) => {
        console.log(`Skupina ${key} :`);
        console.log(`Distribúcia v odstránenej skupine ${key} :`, value.localDist);
        console.log(`Distribúcia krvných skupín v odstránenej skupine ${key} :`, value.bloodDist);
    });

    return anonymizedData;
};

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