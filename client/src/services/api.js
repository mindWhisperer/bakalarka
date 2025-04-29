const API_URL = "http://localhost:4000/api";

/**
 * Načíta surové dáta zo servera.
 * @returns {Promise<Object|null>} - Dáta alebo null ak nastala chyba.
 */
export const fetchData = async () => {
    try {
        const response = await fetch(`${API_URL}/data`);
        if (!response.ok) {
            console.error("Chyba pri načítaní dát:", response.statusText);
            return null;  // Vrátime null namiesto vyhodenia chyby
        }
        return await response.json();
    } catch (error) {
        console.error("Chyba pri fetchData:", error.message);
        return null;  // Vrátime null namiesto throw error
    }
};

/**
 * Odosiela dáta na anonymizáciu konkrétnou metódou.
 * @param {Array} data - Dáta pacientov.
 * @param {string} method - Názov anonymizačnej metódy.
 * @returns {Promise<Object|null>} - Výsledok anonymizácie alebo null.
 */
export const anonymizeData = async (data, method) => {
    try {
        const response = await fetch(`${API_URL}/anonymize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({data, method})
        });

        if (!response.ok) {
            console.error("Chyba pri anonymizovani dát:", response.statusText);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};