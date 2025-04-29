import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import Charts from "../components/Chart";
import { fetchData, anonymizeData } from "../services/api";
import "../style/App.css";


// Mapovanie pohľadov na názvy metód, ktoré očakáva backend
const methodParamMap = {
    "anonymizacia": "generalization",
    "k_anonymita": "k-anonymity",
    "l_diverzita": "l-diversity",
    "t_uzavretost": "t-closeness",
    "nahodne_maskovanie": "random-masking",
};

const Home = ({ view }) => {
    const [data, setData] = useState([]);
    const [anonymizedData, setAnonymizedData] = useState([]);
    const [executionTime, setExecutionTime] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [setCurrentChart] = useState(null);
    const [duration, setDuration] = useState(null);

    /**
     * Po načítaní komponentu sa automaticky získajú pôvodné dáta pacientov.
     */
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);  // Reset chyby pred načítaním
            const response = await fetchData();

            if (response === null) {
                setError("Nepodarilo sa načítať dáta zo servera.");
            } else {
                setData(response.rows);
                setDuration(response.duration);
            }
            setLoading(false);
        };

        loadData().catch((err) => {
            console.error("Chyba pri načítaní dát:", err);
            setError("Nastala chyba pri načítaní dát.");
            setLoading(false);
        });
    }, []);

    /**
     * Pri zmene view sa automaticky
     * spustí anonymizácia, ak je view v zozname podporovaných metód.
     */
    useEffect(() => {
        const shouldAutoAnonymize = Object.keys(methodParamMap).includes(view);

        const autoAnonymize = async () => {
            setLoading(true);
            setError(null);

            try {
                const method = methodParamMap[view];
                const response = await anonymizeData(data, method);
                console.log("Server response:", response);

                if (response && response.data) {
                    setAnonymizedData(response.data);
                    setExecutionTime(response.duration);
                    setCurrentChart({ method: response.method, duration: response.duration });
                } else {
                    setError("Chyba pri automatickej anonymizácii dát.");
                }
            } catch (err) {
                //setError("Chyba pri anonymizácii.");
            } finally {
                setLoading(false);
            }
        };

        if (shouldAutoAnonymize && data.length > 0) {
            autoAnonymize().catch(err => {
                console.error("Unhandled anonymization error:", err);
                setError("Neočakávaná chyba pri anonymizácii.");
                setLoading(false);
            });
        }
    }, [view, data]);

    /**
     * Manuálne spustenie anonymizácie po kliknutí na tlačidlo.
     */
    const handleAnonymize = async () => {
        setLoading(true);
        setError(null);

        try {
            const method = methodParamMap[view];
            const response = await anonymizeData(data, method);
            console.log("Server response (manual):", response);

            if (response && response.data) {
                setAnonymizedData(response.data);
                setExecutionTime(response.duration);
                setCurrentChart({ method: response.method, duration: response.duration });
            } else {
                setError("Chyba pri spracovaní anonymizovaných dát.");
            }
        } catch (error) {
            //setError("Chyba pri anonymizácii.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Pomocná funkcia na zobrazenie pekného názvu metódy v nadpise.
     */
    const getMethodName = (method) => {
        const methods = {
            "anonymizacia": "Generalizácie",
            "k_anonymita": "K-Anonymity",
            "l_diverzita": "L-Diverzity",
            "t_uzavretost": "T-Uzavretosti",
            "nahodne_maskovanie": "Náhodného maskovania"
        };
        return methods[method] || "neurčenej metódy";
    };

    return (
        <div className="home-container">
            {error && <p className="error-text">{error}</p>}

            {loading ? (
                <div className="loader-container">
                    <div className="spinner" />
                    <p>Načítavam údaje...</p>
                </div>
            ) : view === "zoznam" ? (
                <>
                    <h1 className="page-title">Zoznam pacientov</h1>
                    {duration !== null && (
                        <p><strong>Čas načítania pacientov:</strong> {duration.toFixed(2)} ms</p>
                    )}
                    <DataTable data={data} />
                </>
            ) : view === "grafy" ? (
                <Charts />
            ) : (
                <>
                    <h2 className="section-title">
                        Anonymizované dáta metódou {getMethodName(view)}
                    </h2>

                    <div className="anonymization-controls">
                        <button className="btn-anonymize" onClick={handleAnonymize}>
                            Anonymizovať znova
                        </button>
                    </div>

                    {executionTime !== null && (
                        <p><strong>Čas vykonania:</strong> {executionTime.toFixed(2)} ms</p>
                    )}

                    {anonymizedData.length > 0 && <DataTable data={anonymizedData} />}
                </>
            )}
        </div>
    );
};

export default Home;
