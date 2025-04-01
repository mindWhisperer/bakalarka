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

    // Funkcia na zmenu vybratej metódy anonymizácie
    const handleMethodChange = (event) => {
        setSelectedMethod(event.target.value);
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
        <div id={"home"}>
            {error && <p>{error}</p>}
            {loading ? (
                <p>Načítavam údaje...</p>
            ) : view === "zoznam" ? (
                <>
                    <h2>Zoznam pacientov</h2>
                    <DataTable data={data} />
                </>
            ) : (
                <>
                    <h2>Anonymizované dáta metódou {getMethodName(selectedMethod)}</h2>
                    <select id="anonymizationMethod" value={selectedMethod} onChange={handleMethodChange}>
                        <option value="generalization">Generalizácia</option>
                        <option value="k-anonymity">K-Anonymita</option>
                        <option value="l-diversity">L-Diverzita</option>
                        <option value="t-closeness">T-Uzavretosť</option>
                        <option value="random-masking">Náhodné maskovanie</option>
                    </select>
                    <button onClick={handleAnonymize}>Anonymizovať dáta</button>
                    {anonymizedData.length > 0 && <DataTable data={anonymizedData} />}
                </>
            )}
        </div>
    );
};

export default Home;
