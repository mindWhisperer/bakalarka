// Načítanie funkcie `performance` z balíka `perf_hooks` pre meranie času
const { performance } = require('perf_hooks');
// Načítanie anonymizačných algoritmov z lokálneho súboru
const { generalize, kAnonymity, lDiversity, tCloseness, randomMasking } = require('./anonymizationAlg');

/**
 * Meria čas vykonania vybranej anonymizačnej metódy nad vstupnými dátami.
 *
 * @param {"generalization"|"k-anonymity"|"l-diversity"|"t-closeness"|"random-masking"} method - Názov anonymizačnej metódy.
 * @param {any[]} data - Pole vstupných dát, ktoré budú anonymizované.
 * @returns {{ result: any, duration: number }} Výsledok anonymizácie a trvanie v milisekundách.
 */
function measureAnonymization(method, data) {
    const start = performance.now(); // Začiatok merania času

    let result;
    // Výber a spustenie príslušnej anonymizačnej metódy podľa názvu
    switch (method) {
        case "generalization":
            result = generalize(data);
            break;
        case "k-anonymity":
            result = kAnonymity(data);
            break;
        case "l-diversity":
            result = lDiversity(data);
            break;
        case "t-closeness":
            result = tCloseness(data);
            break;
        case "random-masking":
            result = randomMasking(data);
            break;
        default:
            result = generalize(data); // Predvolená metóda: generalizácia
    }

    const end = performance.now(); // Koniec merania času
    const duration = end - start; // Výpočet trvania v milisekundách

    return { result, duration }; // Vrátenie výsledku anonymizácie a trvania
}

module.exports = { measureAnonymization };