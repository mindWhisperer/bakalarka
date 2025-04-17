import React, { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import { anonymizeData, fetchData } from "../services/api";
import "../style/App.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const methodOptions = [
    { label: "Generalizácia", value: "generalization" },
    { label: "K-Anonymita", value: "k-anonymity" },
    { label: "L-Diverzita", value: "l-diversity" },
    { label: "T-Uzavretosť", value: "t-closeness" },
    { label: "Náhodné maskovanie", value: "random-masking" }
];

const Charts = () => {
    const [selectedMethods, setSelectedMethods] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [runResults, setRunResults] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState("generalization");
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

        const results = [];
        for (let i = 1; i <= repeatCount; i++) {
            const res = await anonymizeData(originalData, selectedMethod);
            if (res && res.duration) {
                results.push({ run: i, duration: res.duration });
            }
        }

        setRunResults(results);
        setRunning(false);
    };

    const barData = {
        labels: chartData.map(r => r.method),
        datasets: [
            {
                label: "Trvanie (ms)",
                data: chartData.map(r => Number(r.duration.toFixed(2))),
                backgroundColor: [
                    '#F7CFD8',
                    '#F4F8D3',
                    '#FFD0C7',
                    '#A6D6D6',
                    '#8E7DBE'
                ],
                borderWidth: 1
            }
        ]
    };

    const avg =
        runResults.reduce((sum, r) => sum + r.duration, 0) / runResults.length;

    const lineData = {
        labels: runResults.map(r => `Beh ${r.run}`),
        datasets: [
            {
                label: `Trvanie pre ${selectedMethod}`,
                data: runResults.map(r => Number(r.duration.toFixed(2))),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.2
            },
            {
                label: "Priemer",
                data: new Array(runResults.length).fill(Number(avg.toFixed(2))),
                borderColor: 'rgba(255, 99, 132, 0.8)',
                borderDash: [5, 5],
                pointRadius: 0,
                tension: 0.1
            }
        ]
    };


    return (
        <div className="chart-container">
            <h2>Porovnanie anonymizačných algoritmov</h2>

            <div className="method-select">
                {methodOptions.map(opt => (
                    <label key={opt.value}>
                        <input
                            type="checkbox"
                            value={opt.value}
                            checked={selectedMethods.includes(opt.value)}
                            onChange={() => handleMethodToggle(opt.value)}
                        />
                        {opt.label}
                    </label>
                ))}
            </div>

            <button className="btn-run" onClick={runChart} disabled={selectedMethods.length === 0}>
                Spustiť porovnanie
            </button>

            {chartData.length > 0 && (
                <div style={{marginTop: 30}}>
                    <Bar data={barData} options={{
                        plugins: {
                            title: {
                                display: true,
                                text: "Porovnanie trvania algoritmov"
                            }
                        }
                    }}/>
                </div>
            )}

            <h3>Opakované spustenie jednej metódy</h3>
            <div className="execution-controls">
                <select
                    className="method-select-dropdown"
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                >
                    {methodOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                <input
                    className="repeat-count-input"
                    type="number"
                    min={1}
                    value={repeatCount}
                    onChange={(e) => setRepeatCount(parseInt(e.target.value))}
                />
            <button onClick={runMultipleTimes} disabled={running}>Spustiť {repeatCount}x</button>
        </div>

    {
        runResults.length > 0 && (
            <div style={{marginTop: 30}}>
                <Line data={lineData} options={{
                    plugins: {
                        title: {
                            display: true,
                            text: `Výsledky opakovaných behov pre ${selectedMethod}`
                        }
                    }
                }}/>
            </div>
        )
    }
</div>
)
    ;
};

export default Charts;
