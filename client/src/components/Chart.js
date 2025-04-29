import React from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from "chart.js";
import { useChartLogic } from "./UseChartLogic";
import "../style/App.css";

// Registrácia komponentov Chart.js pre správne vykreslenie grafov
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);


// Možnosti anonymizačných metód, ktoré si užívateľ môže zvoliť
const methodOptions = [
    {label: "Pôvodné dáta", value: "raw-data"},
    { label: "Generalizácia", value: "generalization" },
    { label: "K-Anonymita", value: "k-anonymity" },
    { label: "L-Diverzita", value: "l-diversity" },
    { label: "T-Uzavretosť", value: "t-closeness" },
    { label: "Náhodné maskovanie", value: "random-masking" }
];

/**
 * Komponent `Charts` vizualizuje trvanie spustenia anonymizačných algoritmov
 * pomocou grafov. Užívateľ si môže vybrať, ktoré
 * metódy spustiť, a zvoliť počet opakovaní.
 */
const Charts = () => {
    // vracia stav a funkcie pre prácu s grafmi a opakovaniami
    const { selectedMethods, repeatCount, setRepeatCount, handleMethodToggle, runChart, runMultipleTimes, running, chartData, runResults} = useChartLogic();


    // Dáta pre bar graf – zobrazuje jedno spustenie každej metódy
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

    // Dáta pre čiarový graf – zobrazujú priebeh trvania metód počas viacerých behov

    const lineData = {
        labels: Array.from({ length: repeatCount }, (_, i) => `${i + 1}`),
        datasets: Object.entries(runResults).flatMap(([method, durations], index) => {
            const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
            const baseColor = ['rgb(75,192,192)', 'rgb(255,159,64)', 'rgb(153,102,255)', 'rgb(54,162,235)', 'rgb(255,99,132)',
                'rgb(255,99,242)', 'rgb(239,255,99)'][index % 6];

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

    // Dáta pre porovnanie priemerných trvaní metód
    const avgData = {
        labels: Object.keys(runResults),
        datasets: [
            {
                label: "Priemerné trvanie v ms",
                data: Object.values(runResults).map(durations =>
                    Number((durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2))
                ),
                backgroundColor: ['#FFC09F', '#ADFFB0', '#A0CED9', '#FFB5E8', '#CBAACB', '#FFDAC1'],
                borderWidth: 1
            }
        ]
    };

    // Renderovanie komponentu
    return (
        <div className="chart-container">
            <h2>Porovnanie anonymizačných algoritmov</h2>

            {/* Výber anonymizačných metód */}
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

            {/* Spustenie jedného behu */}
            <button className="btn-run" onClick={runChart} disabled={selectedMethods.length === 0}>
                Spustiť 1x
            </button>

            {/* Počet opakovaní + spustenie viacerých behov */}
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

            {/* Bar graf – trvanie 1 behu */}
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

            {/* Line graf – výsledky viacerých behov */}
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

            {/* Priemerné trvanie pre jednotlivé metódy */}
            {Object.keys(runResults).length > 0 && (
                <div style={{ marginTop: 30 }}>
                    <Bar
                        data={avgData}
                        options={{
                            plugins: {
                                title: {
                                    display: true,
                                    text: "Priemerné trvanie algoritmov"
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
                                        text: 'Metóda'
                                    }
                                }
                            }
                        }}
                    />
                </div>
            )}

        </div>
    );
};

export default Charts;
