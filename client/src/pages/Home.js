import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { fetchData, anonymizeData } from "../services/api";

const Home = () => {
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

    return (
        <div>
            {error && <p>{error}</p>}
            {loading ? <p>Načítavam údaje...</p> : <DataTable data={data}/>}

            {!loading && data.length > 0 && (
                <div>
                    {/* Výber metódy anonymizácie */}
                    <select id="anonymizationMethod" value={selectedMethod} onChange={handleMethodChange}>
                        <option value="generalization">Generalizácia</option>
                        <option value="k-anonymity">K-Anonymita</option>
                        <option value="l-diversity">L-Diverzita</option>
                        <option value="t-closeness">T-Uzavretosť</option>
                        <option value="random-masking">Náhodné maskovanie</option>
                    </select>

                    {/* Tlačidlo na anonymizovanie dát */}
                    <button onClick={handleAnonymize}>Anonymizovať dáta</button>
                </div>
            )}

            {/* Zobrazenie anonymizovaných dát */}
            {anonymizedData.length > 0 && (
                <div>
                    <h2>Anonymizované dáta ({selectedMethod}):</h2>
                    <DataTable data={anonymizedData}/>
                </div>
            )}
        </div>
    );
};

export default Home;
