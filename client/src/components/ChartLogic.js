import { useState } from "react";
import { anonymizeData, fetchData } from "../services/api";

export const chartLogic = () => {
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

    const runMultipleTimes = async () => {
        setRunning(true);
        const results = {};

        for (const method of selectedMethods) {
            const methodResults = [];

            for (let i = 1; i <= repeatCount; i++) {
                const fetched = await fetchData();

                if (!fetched?.rows) continue;

                if (method === "raw-data") {
                    methodResults.push(fetched.duration || 0);
                } else {
                    const res = await anonymizeData(fetched.rows, method);
                    methodResults.push(res?.duration || 0);
                }
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
