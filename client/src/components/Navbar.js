import React, { useState, useEffect } from "react";
import "../style/App.css";

/**
 * Komponent Navbar slúži ako hlavná navigačná lišta aplikácie.
 * Umožňuje prepínať medzi pohľadmi (komponentmi) a prepínať medzi svetlým a tmavým režimom (dark mode).
 *
 * @param {Function} setView - Funkcia na nastavenie aktuálne zobrazeného pohľadu v aplikácii.
 */
const Navbar = ({ setView }) => {
    // Inicializácia tmavého režimu podľa uloženého nastavenia v localStorage
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    /**
     * Efekt sledujúci zmenu stavu `darkMode`.
     * Podľa toho buď pridá alebo odstráni triedu "dark" z `<body>`,
     * a aktualizuje hodnotu v `localStorage`.
     */
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
            {/* Ikona aplikácie */}
            <div className="nav-logo">🩺 </div>

            {/* Navigačné odkazy na jednotlivé časti aplikácie */}
            <ul className="nav-links">
                <li onClick={() => setView("zoznam")}>Čisté</li>
                <li onClick={() => setView("anonymizacia")}>Generalizácia</li>
                <li onClick={() => setView("k_anonymita")}>K-anonymita</li>
                <li onClick={() => setView("l_diverzita")}>L-diverzita</li>
                <li onClick={() => setView("t_uzavretost")}>T-uzavretosť</li>
                <li onClick={() => setView("nahodne_maskovanie")}>Náhodné maskovanie</li>
                <li onClick={() => setView("grafy")}>Experimenty</li>
            </ul>

            {/* Tlačidlo na prepínanie medzi svetlým a tmavým režimom */}
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
