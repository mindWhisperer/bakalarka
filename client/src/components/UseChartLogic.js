import { useState } from "react";
import { anonymizeData, fetchData } from "../services/api";

/**
 * Logika generovania grafov na základe anonymizačných metód.
 * Zabezpečuje zber dát, výpočty trvania a štatistické spracovanie opakovaných behov.
 */
export const useChartLogic = () => {
    // Zoznam vybraných anonymizačných metód používateľom
    const [selectedMethods, setSelectedMethods] = useState([]);
    // Dáta pre zobrazenie v stĺpcovom grafe (1 beh)
    const [chartData, setChartData] = useState([]);
    // Výsledky z viacerých behov, používané pre line chart
    const [runResults, setRunResults] = useState({});
    // Počet opakovaní testovania
    const [repeatCount, setRepeatCount] = useState(5);
    // Indikátor, že testovanie práve prebieha
    const [running, setRunning] = useState(false);

    /**
     * Prepína výber konkrétnej anonymizačnej metódy.
     * Ak je už vybraná, odstráni ju; inak ju pridá.
     *
     * @param {string} value - Identifikátor metódy
     */
    const handleMethodToggle = (value) => {
        setSelectedMethods(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    /**
     * Spustí anonymizáciu a meranie len raz pre každú vybranú metódu.
     * Výsledky sa ukladajú do `chartData`.
     */
    const runChart = async () => {
        const originalData = await fetchData();
        if (!originalData?.rows) return;

        const results = [];
        for (const method of selectedMethods) {
            if (method === "raw-data") {
                results.push({ method: "raw-data", duration: originalData.duration });
            } else {
                const response = await anonymizeData(originalData.rows, method);
                if (response?.duration) {
                    results.push({ method, duration: response.duration });
                }
            }
        }
        setChartData(results);
    };

    /**
     * Spustí anonymizáciu pre všetky vybrané metódy viackrát (podľa `repeatCount`)
     * a vypočíta štatistiky ako priemer, minimum, maximum, rozptyl a smerodajnú odchýlku.
     */
    const runMultipleTimes = async () => {
        setRunning(true);
        const results = {};

        for (let i = 1; i <= repeatCount; i++) {
            const fetched = await fetchData();

            if (!fetched?.rows) continue;

            for (const method of selectedMethods) {
                const methodResults = results[method] || [];

                let totalDuration = 0;

                if (method === "raw-data") {
                    totalDuration = fetched.duration || 0;
                } else {
                    const res = await anonymizeData(fetched.rows, method);

                    totalDuration = res.duration;
                    //totalDuration = fetched.duration + res.duration;
                }
                methodResults.push(totalDuration);
                results[method] = methodResults;
            }
        }

        // Výpočty štatistík
        for (const method of selectedMethods) {
            const methodResults = results[method];

            const min = Math.min(...methodResults);
            const max = Math.max(...methodResults);
            const avg = methodResults.reduce((a, b) => a + b, 0) / methodResults.length;

            const variance = methodResults.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / methodResults.length;
            const stdDev = Math.sqrt(variance);

            const minIndex = methodResults.indexOf(min) + 1;
            const maxIndex = methodResults.indexOf(max) + 1;

            console.log(`Metóda: ${method}`);
            console.log(`- Namerané hodnoty:`, methodResults.map((v, i) => `Beh ${i + 1}: ${v.toFixed(4)} ms`).join(', '));
            console.log(`- Minimum: ${min.toFixed(4)} ms (beh ${minIndex})`);
            console.log(`- Maximum: ${max.toFixed(4)} ms (beh ${maxIndex})`);
            console.log(`- Priemer: ${avg.toFixed(4)} ms`);
            console.log(`- Rozptyl: ${variance.toFixed(4)}`);
            console.log(`- Smerodajná odchýlka: ${stdDev.toFixed(4)} ms`);
            console.log('----------------------');
        }

        setRunResults(results);
        setRunning(false);
    };

    return {
        selectedMethods,
        setRepeatCount,
        repeatCount,
        handleMethodToggle,
        runChart,
        runMultipleTimes,
        running,
        chartData,
        runResults
    };
};
