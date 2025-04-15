const { performance } = require('perf_hooks');
const { generalize, kAnonymity, lDiversity, tCloseness, randomMasking } = require('./anonymizationAlg');

function measureAnonymization(method, data) {
    const start = performance.now();

    let result;
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
            result = generalize(data);
    }

    const end = performance.now();
    const duration = end - start;

    return { result, duration };
}

module.exports = { measureAnonymization };
