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

export const anonymizeData = async (data) => {
    try {
        const response = await fetch(`${API_URL}/anonymize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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