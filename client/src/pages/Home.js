import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { fetchData, anonymizeData } from "../services/api";

const Home = () => {
    const [data, setData] = useState([]);
    const [anonymizedData, setAnonymizedData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState("generalization"); // Predvolená metóda


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

    const handleAnonymize = async () => {
        setLoading(true);
        try {
            const anonymized = await anonymizeData(data, selectedMethod); // Posielame metódu ako parameter
            setAnonymizedData(anonymized);  // Uložíme anonymizované dáta
        } catch (error) {
            setError("Chyba pri anonymizácii dát.");
        } finally {
            setLoading(false);
        }
    };

    const handleMethodChange = (event) => {
        setSelectedMethod(event.target.value);
    };

    return (
        <div>
            {error && <p>{error}</p>}
            {loading ? <p>Načítavam údaje...</p> : <DataTable data={data}/>}

            {!loading && data.length > 0 && (
                <div>
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

            {anonymizedData.length > 0 && (
                <div>
                    <h2>Anonymizované dáta (generalizácia) :</h2>
                    <DataTable data={anonymizedData}/>
                </div>
            )}
        </div>
    );
};

export default Home;


