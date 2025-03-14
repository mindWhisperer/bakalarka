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
                        {data.length > 0 &&
                            Object.keys(data[0]).map((key) => (
                                <th key={key}>{key}</th>
                            ))}
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            {Object.values(row).map((value, i) => (
                                <td key={i}>{value}</td>
                            ))}
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