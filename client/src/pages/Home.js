import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import { fetchData } from "../services/api";

const Home = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div>
            {error && <p>{error}</p>}
            {loading ? <p>Načítavam údaje...</p> : <DataTable data={data} />}
        </div>
    );
};

export default Home;


