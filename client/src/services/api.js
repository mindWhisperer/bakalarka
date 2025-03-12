const API_URL = "http://localhost:4000/api";

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
