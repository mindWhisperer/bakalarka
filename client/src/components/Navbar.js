import React, { useState, useEffect } from "react";
import "../style/index.css";

const Navbar = ({ setView }) => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    return (
        <header className="nav-wrapper">
            <div className="nav-logo">🩺 </div>
            <ul className="nav-links">
                <li onClick={() => setView("zoznam")}>Čisté</li>
                <li onClick={() => setView("anonymizacia")}>Generalizácia</li>
                <li onClick={() => setView("k_anonymita")}>K-anonymita</li>
                <li onClick={() => setView("l_diverzita")}>L-diverzita</li>
                <li onClick={() => setView("t_uzavretost")}>T-uzavretosť</li>
                <li onClick={() => setView("nahodne_maskovanie")}>Náhodné maskovanie</li>
                <li onClick={() => setView("grafy")}>Experimenty</li>
            </ul>
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="toggle-btn px-4 py-2 rounded-lg text-white dark:text-black bg-black dark:bg-white transition"
            >
                {darkMode ? "☀️" : "🌙"}
            </button>
        </header>
    );
};

export default Navbar;
