import { useState } from "react";
import { anonymizeData, fetchData } from "../services/api";

export const useChartsLogic = () => {
    const [selectedMethods, setSelectedMethods] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [runResults, setRunResults] = useState({});
    const [repeatCount, setRepeatCount] = useState(5);
    const [running, setRunning] = useState(false);

    const handleMethodToggle = (value) => {
        setSelectedMethods(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    const runChart = async () => {
        const originalData = await fetchData();
        if (!originalData) return;

        const results = [];
        for (const method of selectedMethods) {
            const response = await anonymizeData(originalData, method);
            if (response && response.duration) {
                results.push({ method, duration: response.duration });
            }
        }
        setChartData(results);
    };

    const runMultipleTimes = async () => {
        setRunning(true);
        const originalData = await fetchData();
        if (!originalData) {
            setRunning(false);
            return;
        }

        const results = {};
        for (const method of selectedMethods) {
            const methodResults = [];
            for (let i = 1; i <= repeatCount; i++) {
                const res = await anonymizeData(originalData, method);
                methodResults.push(res?.duration || 0);
            }
            results[method] = methodResults;
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
