import React from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import { chartLogic } from "./ChartLogic";
import "../style/App.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const methodOptions = [
    {label: "Pôvodné dáta", value: "raw-data"},
    { label: "Generalizácia", value: "generalization" },
    { label: "K-Anonymita", value: "k-anonymity" },
    { label: "L-Diverzita", value: "l-diversity" },
    { label: "T-Uzavretosť", value: "t-closeness" },
    { label: "Náhodné maskovanie", value: "random-masking" }
];

const Charts = () => {
    const { selectedMethods, repeatCount, setRepeatCount, handleMethodToggle, runChart, runMultipleTimes, running, chartData, runResults} = chartLogic();

    const barData = {
        labels: chartData.map(r => r.method),
        datasets: [
            {
                label: "Trvanie v ms",
                data: chartData.map(r => Number(r.duration.toFixed(2))),
                backgroundColor: ['#F7CFD8', '#F4F8D3', '#FFD0C7', '#A6D6D6', '#8E7DBE', '#7dbeb9'],
                borderWidth: 1
            }
        ]
    };

    const lineData = {
        labels: Array.from({ length: repeatCount }, (_, i) => `${i + 1}`),
        datasets: Object.entries(runResults).flatMap(([method, durations], index) => {
            const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
            const baseColor = ['rgb(75,192,192)', 'rgb(255,159,64)', 'rgb(153,102,255)', 'rgb(54,162,235)', 'rgb(255,99,132)', 'rgb(239,255,99)'][index % 5];

            return [
                {
                    label: `Trvanie - ${method}`,
                    data: durations.map(d => Number(d.toFixed(2))),
                    fill: false,
                    borderColor: baseColor,
                    tension: 0.2
                },
                {
                    label: `Priemer - ${method}`,
                    data: Array(repeatCount).fill(Number(avg.toFixed(2))),
                    borderColor: baseColor,
                    borderDash: [5, 5],
                    pointRadius: 3,
                    tension: 0.1
                }
            ];
        })
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
                Spustiť 1x
            </button>

            <input
                className="repeat-count-input"
                type="number"
                min={0}
                value={repeatCount}
                onChange={(e) => setRepeatCount(parseInt(e.target.value))}
            />
            <button onClick={runMultipleTimes} disabled={running || selectedMethods.length === 0}>
                Spustiť {repeatCount}×
            </button>

            {chartData.length > 0 && (
                <div style={{ marginTop: 30 }}>
                    <Bar data={barData} options={{
                        plugins: {
                            title: {
                                display: true,
                                text: "Porovnanie trvania algoritmov"
                            },
                            legend: {
                                display: true
                            }
                        },
                        scales: {
                            y: {
                                title: {
                                    display: true,
                                    text: 'Trvanie (ms)'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Názov metódy'
                                }
                            }
                        }
                    }} />
                </div>
            )}

            {Object.keys(runResults).length > 0 && (
                <div style={{ marginTop: 30 }}>
                    <Line data={lineData} options={{
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: `Výsledky opakovaných behov pre vybrané metódy`
                            },
                            legend: {
                                display: true
                            }
                        },
                        scales: {
                            y: {
                                title: {
                                    display: true,
                                    text: 'Trvanie (ms)'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Počet behov'
                                }
                            }
                        }
                    }} />
                </div>
            )}
        </div>
    );
};

export default Charts;
