const { faker } = require('@faker-js/faker');

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
    const k = 3;
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
    Object.values(groups).forEach(group => {
        const uniqueBloodTypes = new Set(group.map(item => item.TYP_KRVI));
        const uniqueDiseaseTypes = new Set(group.map(item => item.TYP_CHOROBY));

        if (uniqueBloodTypes.size >= l && uniqueDiseaseTypes.size >= l) {
            anonymizedData.push(...group.map(record => {
                const anonymizedRecord = { ...record };
                delete anonymizedRecord.MENO;
                delete anonymizedRecord.PRIEZVISKO;

                anonymizedRecord.color = groupColors[`${record.VEK}-${record.POHLAVIE}-${record.ID_PACIENTA}`];

                return anonymizedRecord;
            }));
        }
    });

    return anonymizedData;
};

const tCloseness = () => {

};

const randomMasking =(data) => {
    return data.map(() => {
        const idPacienta = Math.random() < 0.1 ? null : faker.string.numeric(faker.number.int({ min: 2, max: 5 }));

        return {
            MENO: faker.person.firstName(),
            PRIEZVISKO: faker.person.lastName(),
            ID_PACIENTA: idPacienta,
            TYP_KRVI: idPacienta ? faker.helpers.arrayElement(["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"]) : null,
            VEK: faker.number.int({ min: