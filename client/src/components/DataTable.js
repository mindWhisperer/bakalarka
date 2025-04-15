import React, { useState } from "react";
import "../style/App.css";

const RECORDS_PER_PAGE_OPTIONS = [10, 20, 30];

const DataTable = ({ data }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [searchTerm] = useState("");

    const filteredData = data.filter((patient) => {
        const fullName = `${patient.MENO} ${patient.PRIEZVISKO}`.toLowerCase();
        return (
            fullName.includes(searchTerm.toLowerCase()) ||
            patient.TYP_CHOROBY.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const totalPages = Math.ceil(filteredData.length / recordsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    return (
        <div className="table-wrapper">
            <div className="records-controls">
                <label htmlFor="recordsSelect">Počet záznamov na stránke:</label>
                <select
                    id="recordsSelect"
                    value={recordsPerPage}
                    onChange={(e) => {
                        setRecordsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="records-select"
                >
                    {RECORDS_PER_PAGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>

            {data.length > 0 ? (
                <table className="patient-table">
                    <thead>
                    <tr>
                        <th>PORADIE</th>
                        {Object.keys(data[0]).map((key) =>
                            key !== "color" ? <th key={key}>{key}</th> : null
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedData.map((row, index) => (
                        <tr key={index} style={{backgroundColor: row.color || "#fff"}}>
                            <td>{(currentPage - 1) * recordsPerPage + index + 1}</td>
                            {Object.entries(row).map(([key, value], i) =>
                                key !== "color" ? (
                                    <td key={i}>
                                        {key === "POHLAVIE" ? (
                                            value === "M" ? (
                                                <img
                                                    className="gender-icon"
                                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWho3Mk2UyAJMYh615WHKGliTXxLTz2U36iw&s"
                                                    alt="Muž"
                                                />
                                            ) : (
                                                <img
                                                    className="gender-icon"
                                                    src="https://img.cas.sk/cas/1280px-c2/4650197.jpg"
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
