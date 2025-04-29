import React, { useState } from "react";
import "../style/App.css";

// Prednastavené možnosti počtu záznamov na stránku
const RECORDS_PER_PAGE_OPTIONS = [10, 20, 30, 5000];

/**
 * Komponent DataTable slúži na zobrazenie dát v tabuľkovej forme s podporou stránkovania
 *
 * @param {Array} data - Pole objektov reprezentujúcich záznamy pacientov.
 */
const DataTable = ({ data }) => {
    const [currentPage, setCurrentPage] = useState(1);            // Aktuálne zobrazená stránka
    const [recordsPerPage, setRecordsPerPage] = useState(10);     // Počet záznamov na jednu stránku
    const [searchTerm] = useState("");                             // Vyhľadávací reťazec

    /**
     * Filtrovanie dát podľa mena alebo typu choroby.
     * Hoci `searchTerm` je zatiaľ fixný (""), táto logika umožňuje budúce vyhľadávanie.
     */
    const filteredData = data.filter((patient) => {
        const fullName = `${patient.MENO} ${patient.PRIEZVISKO}`.toLowerCase();
        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            patient.TYP_CHOROBY.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Výpočet celkového počtu strán
    const totalPages = Math.ceil(filteredData.length / recordsPerPage);

    // Výber dát pre aktuálnu stránku
    const paginatedData = filteredData.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    /**
     * Zmena stránky – posúva dopredu alebo dozadu, ak sa nachádzame v povolenom rozsahu.
     */
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    return (
        <div className="table-wrapper">
            {/* Výber počtu záznamov na stránku */}
            <div className="records-controls">
                <label htmlFor="recordsSelect">Počet záznamov na stránke:</label>
                <select
                    id="recordsSelect"
                    value={recordsPerPage}
                    onChange={(e) => {
                        setRecordsPerPage(Number(e.target.value));     // Nastaví nový počet záznamov
                        setCurrentPage(1);                       // Resetne na prvú stránku
                    }}
                    className="records-select"
                >
                    {RECORDS_PER_PAGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>

            {/* Tabuľka s dátami, ak existujú */}
            {data.length > 0 ? (
                <table className="patient-table">
                    <thead>
                    <tr>
                        <th>PORADIE</th>
                        {/* Dynamické vykreslenie hlavičiek na základe prvého objektu */}
                        {Object.keys(data[0]).map((key) =>
                            key !== "color" ? <th key={key}>{key}</th> : null
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedData.map((row, index) => (
                        <tr key={index} style={{backgroundColor: row.color || "#fff"}}>
                            {/* Poradie záznamu */}
                            <td>{(currentPage - 1) * recordsPerPage + index + 1}</td>
                            {/* Zobrazenie hodnôt zo záznamu */}
                            {Object.entries(row).map(([key, value], i) =>
                                key !== "color" ? (
                                    <td key={i}>
                                        {key === "POHLAVIE" ? (
                                            value === "M" ? (
                                                <img
                                                    className="gender-icon"
                                                    src="https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/256x256/symbol_male.png"
                                                    alt="Muž"
                                                />
                                            ) : (
                                                <img
                                                    className="gender-icon"
                                                    src="https://t3.ftcdn.net/jpg/01/37/69/42/360_F_137694239_ihbs4kHd2w3HC3KipODkBDfhltbjwwLV.jpg"
                                                    alt="Žena"
                                                />
                                            )
                                        ) : (
                                            value
                                        )}
                                    </td>
                                ) : null
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>Žiadni pacienti neboli nájdení.</p>
            )}

            {/* Ovládanie stránkovania (predošlá/ďalšia strana) */}
            <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    ❮
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    ❯
                </button>
            </div>
        </div>

    );
};

export default DataTable;
