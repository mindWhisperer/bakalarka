const { faker } = require('@faker-js/faker');
const {generateRandomBIN, getAge, getGender, dataGroup, computeDistribution, computeEMD, loadCSV } = require('./helpers');

const generalize = (data) => {
    return data.map(record => {
        const age = Math.floor(record.VEK);
        let genVek = null;
        if (age) {
            if (age < 20) genVek = "Pod 20";
            else if (age < 30) genVek = "20-29";
            else if (age < 40) genVek = "30-39";
            else if (age < 50) genVek = "40-49";
            else if (age < 60) genVek = "50-59";
            else genVek = "60+";
        }

        const genBloodType = record.TYP_KRVI ? record.TYP_KRVI.replace(/[+-]/, "") : null;

        return {
            TYP_KRVI: genBloodType,
            VEK: genVek,
            POHLAVIE: record.POHLAVIE,
            TYP_CHOROBY: record.TYP_CHOROBY,
            TYP_POSTIHNUTIA: record.TYP_POSTIHNUTIA
        };
    });
};

const kAnonymity = (data) => {
    const k = 10;
    const generalizedData = generalize(data);

    const { groups, groupColors } = dataGroup(generalizedData, ["VEK", "POHLAVIE"]);

    // odstranenie mensich skupin ako k
    const anonymizedData = [];
    const removedGroups = {}
    Object.entries(groups).forEach(([key, group]) => {
        if (group.length >= k) {
            anonymizedData.push(...group.map(record => {
                const anonymizedRecord = { ...record };
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
    const l = 3;
    const generalizedData = generalize(data);

    const { groups, groupColors } = dataGroup(generalizedData, ["VEK", "POHLAVIE"]);

    const anonymizedData = [];
    const removedGroups = {}

    Object.entries(groups).forEach(([key, group]) => {
        const uniqueBloodTypes = new Set(group.map(item => item.TYP_KRVI));
        const uniqueDiseaseTypes = new Set(group.map(item => item.TYP_CHOROBY));
        const uniqueDisabilityTypes = new Set(group.map(item => item.TYP_POSTIHNUTIA));
        const allNull = [ ...uniqueDiseaseTypes, ...uniqueDisabilityTypes].every(value => value === null);

        if (uniqueBloodTypes.size >= l && uniqueDiseaseTypes.size >= l && uniqueDisabilityTypes.size >= l) {
            anonymizedData.push(...group.map(record => {
                const anonymizedRecord = { ...record };
                anonymizedRecord.color = groupColors[key];
                return anonymizedRecord;
            }));
        } else if (allNull) {
        anonymizedData.push(...group.map(record => ({
            ...record,
            color: groupColors[key],
            })));
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
    const globalDistDisability = computeDistribution(generalizedData, "TYP_POSTIHNUTIA");

    console.log("Celkové rozdelenie chorob: ", globalDist);
    console.log("Celkové rozdelenie krvných skupín: ", globalDistBlood);
    console.log("Celkové rozdelenie postihnnuti: ", globalDistDisability);

    const { groups, groupColors } = dataGroup(generalizedData,  ["VEK", "POHLAVIE"]);
    const anonymizedData = [];
    const removedGroups = {};

    Object.entries(groups).forEach(([key, group]) => {
        const localDist = computeDistribution(group, "TYP_CHOROBY");
        const localDistBlood = computeDistribution(group, "TYP_KRVI");
        const localDistDisability = computeDistribution(group, "TYP_POSTIHNUTIA");
        console.log(`Distribúcia pre skupinu ${key} :`, localDist);
        console.log(`Distribúcia pre skupinu ${key} (krvné skupiny):`, localDistBlood);
        console.log(`Distribúcia pre skupinu ${key} (postihnutia):`, localDistDisability);
        const emd = computeEMD(globalDist, localDist);
        const emdBlood = computeEMD(globalDistBlood, localDistBlood);
        const emdDisability = computeEMD(globalDistDisability, localDistDisability);

        if (emd <= t && emdBlood <= t && emdDisability <= t) {
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
                bloodDist: localDistBlood,
                disabilityDist: localDistDisability
            };
        }
    });

    console.log("Odstránené skupiny:");
    Object.entries(removedGroups).forEach(([key, value]) => {
        console.log(`Skupina ${key} :`);
        console.log(`Distribúcia v odstránenej skupine ${key} :`, value.localDist);
        console.log(`Distribúcia krvných skupín v odstránenej skupine ${key} :`, value.bloodDist);
        console.log(`Distribúcia postihnuti v odstránenej skupine ${key} :`, value.disabilityDist);
    });

    return anonymizedData;
};

const randomMasking =(data) => {
    return data.map((row) => {
        const idPatient = Math.random() < 0.1 ? null : generatePatientsId();
        const { birthDate, isFemale} = generateRandomBIN(row.ROD_CISLO);
        const age = getAge(birthDate);
        const gender = getGender(isFemale);
        const { name, surname } = getRandomNameAndSurname(isFemale);

        let diagnoses = ["Choroby krvi a krvotvorných orgánov", "Choroby svalovej a kostrovej sústavy a spojivového tkaniva",
            "Faktory ovplyvňujúce zdravotný stav a styk so zdravotníckymi službami", "Poranenia, otravy a niektoré iné následky vonkajších príčin",
            "Vrodené chyby, deformity a chromozómové anomálie", "Vonkajšie príčiny chorobnosti a úmrtnosti",
            "Choroby dýchacej sústavy", "Choroby tráviacej sústavy", "Choroby ucha a hlávkového výbežku", "Choroby obehovej sústavy",
            "Choroby oka a očných adnexov", "Nádory", "Infekčné a parazitové choroba ", "Choroby močovopohlavnej sústavy",
            "Choroby kože a podkožného tkaniva", "Kódy na osobitné účely", "Infekčné a parazitové choroby", "Duševné poruchy a poruchy správania",
            "Endokrinné, nutričné a metabolické choroby", "Choroby nervovej sústavy"]

        if (gender === "Z") {
            diagnoses.push("Gravidita, pôrod a šestonedelie");
        }

        if (age === 0) {
            diagnoses.push("Určité choroby vzniknuté v perinatálnom období");
        }

        return {
            MENO: name,
            PRIEZVISKO: surname,
            ID_PACIENTA: idPatient,
            TYP_KRVI: idPatient ? faker.helpers.arrayElement(["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"]) : null,
            VEK: age,
            POHLAVIE: gender,
            TYP_CHOROBY: idPatient ? faker.helpers.arrayElement(diagnoses) : null
        };
    });
}

module.exports = {generalize, kAnonymity, lDiversity, tCloseness,randomMasking}