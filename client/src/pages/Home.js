import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { fetchData, anonymizeData } from "../services/api";
import "../style/App.css";

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Načítanie dát po načítaní komponentu
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);  // Reset chyby pred načítaním
            const response = await fetchData();

            if (response === null) {
                setError("Nepodarilo sa načítať dáta zo servera.");
                setLoading(false);
                return;
            }

            setData(response);
            setLoading(false);
        };

        loadData();
    }, []);

    // Automatická anonymizácia pri zmene view
    useEffect(() => {
        const shouldAutoAnonymize = Object.keys(methodParamMap).includes(view);

        const autoAnonymize = async () => {
            setLoading(true);
            setError(null);

            try {
                const method = methodParamMap[view] || "generalization";
                const anonymized = await anonymizeData(data, method);
                setAnonymizedData(anonymized);
            } catch (err) {
                setError("Chyba pri automatickej anonymizácii dát.");
            } finally {
                setLoading(false);
            }
        };

        if (shouldAutoAnonymize && data.length > 0) {
            autoAnonymize();
        }
    }, [view, data]);

    // Manuálne anonymizovanie cez button
    const handleAnonymize = async () => {
        setLoading(true);
        setError(null);

        try {
            // Posielame dáta a vybranú metódu anonymizácie
            const method = methodParamMap[view] || "generalization";
            const anonymized = await anonymizeData(data, method);
            setAnonymizedData(anonymized);  // Uložíme anonymizované dáta
        } catch (error) {
            setError("Chyba pri anonymizácii dát.");
        } finally {
            setLoading(false);
        }
    };

    const getMethodName = (method) => {
        const methods = {
            "generalization": "Generalizácie",
            "k-anonymity": "K-Anonymity",
            "l-diversity": "L-Diverzity",
            "t-closeness": "T-Uzavretosti",
            "random-masking": "Náhodného maskovania"
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
                    <DataTable data={data} />
                </>
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

                    {anonymizedData.length > 0 && <DataTable data={anonymizedData} />}
                </>
            )}
        </div>
    );
};

export default Home;
