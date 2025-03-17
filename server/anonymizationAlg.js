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

        const genKrvnaSkupina = record.TYP_KRVI ? record.TYP_KRVI.replace(/[+-]/, "") : null;

        const genIDPacienta = record.ID_PACIENTA ? String(record.ID_PACIENTA).slice(0, 1) + "XX" : null;

        return {
            MENO: record.MENO,
            PRIEZVISKO: record.PRIEZVISKO,
            ID_PACIENTA: genIDPacienta,
            TYP_KRVI: genKrvnaSkupina,
            VEK: genVek,
            POHLAVIE: record.POHLAVIE
        };
    });
};

const getRandomColor = () => {
    const colors = ["#C599B6", "#E6B2BA", "#FAD0C4", "#FFF7F3"];
    return colors[Math.floor(Math.random() * colors.length)];

}

const kAnonymity = (data) => {
    const k = 2;
    const generalizedData = generalize(data);

    const groups = {};
    const groupColors = {}
    generalizedData.forEach(record => {
        const key = `${record.VEK}-${record.POHLAVIE}`;
        if (!groups[key]) {
            groups[key] = [];
            groupColors[key] = getRandomColor();
        }
        groups[key].push(record);
    });

    // odstranenie mensich skupin ako k
    const anonymizedData = [];
    Object.entries(groups).forEach(([key, group]) => {
        if (group.length >= k) {
            anonymizedData.push(...group.map(record => ({
                ...record,
                color: groupColors[key]
            })));
        }
    });

    return anonymizedData;
};




const lDiversity = () => {
    //implementacia alg
}

const tCloseness = () => {
    //implementacia alg
}

const randomMasking = () => {
    //implementacia alg
}

module.exports = {generalize, kAnonymity, lDiversity, tCloseness,randomMasking}