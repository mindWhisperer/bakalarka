import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { fetchData, anonymizeData } from "../services/api";
import '../style/App.css';

const Home = ({view}) => {
    const [data, setData] = useState([]);
    const [anonymizedData, setAnonymizedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState("generalization"); // Predvolená metóda

    // Načítanie dát pri načítaní komponentu
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

    // Funkcia na anonymizáciu dát
    const handleAnonymize = async () => {
        setLoading(true);
        try {
            // Posielame dáta a vybranú metódu anonymizácie
            const anonymized = await anonymizeData(data, selectedMethod);
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
                    <div className="spinner"/>
                    <p>Načítavam údaje...</p>
                </div>
            ) : view === "zoznam" ? (
                <>
                    <h1 className="page-title"> Zoznam pacientov</h1>

                    <DataTable data={data}/>
                </>
            ) : (
                <>
                <h2 className="section-title">Anonymizované dáta metódou {getMethodName(selectedMethod)}</h2>

                    <div className="anonymization-controls">
                        <select
                            id="anonymizationMethod"
                            value={selectedMethod}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                            className="method-select"
                        >
                            <option value="generalization">Generalizácia</option>
                            <option value="k-anonymity">K-Anonymita</option>
                            <option value="l-diversity">L-Diverzita</option>
                            <option value="t-closeness">T-Uzavretosť</option>
                            <option value="random-masking">Náhodné maskovanie</option>
                        </select>

                        <button className="btn-anonymize" onClick={handleAnonymize}>
                            Anonymizovať dáta
                        </button>
                    </div>
                    {anonymizedData.length > 0 && <DataTable data={anonymizedData}/>}
                </>
            )}
        </div>
    );
};

export default Home;
