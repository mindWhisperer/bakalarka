import React from "react";
import '../style/App.css';

const DataTable = ({data}) => {
    return (
        <div className="main-content">
            {data.length > 0 ? (
                <table border="1">
                    <thead>
                    <tr>
                        <th>PORADIE</th>
                        {Object.keys(data[0]).map((key) =>
                            key !== "color" ? <th key={key}>{key}</th> : null
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((row, index) => (
                        <tr key={index} style={{ backgroundColor: row.color || "#ffffff" }}>
                            <td>{index + 1}</td>
                            {Object.entries(row).map(([key, value], i) =>
                                key !== "color" ? <td key={i}>{value}</td> : null
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>

            ) : (
                <p>Žiadni pacienti neboli nájdení.</p>
            )}
        </div>
    )
}

export default DataTable