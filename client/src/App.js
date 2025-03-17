import './style/App.css';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import React, {useState} from "react";


function App() {
    const [view, setView] = useState("zoznam"); // Výchozí zobrazenie

    return (
        <div className="app-container">
            <Navbar setView={setView} />
            <div className="main-content">
                <Home view={view} />
            </div>
            <Footer />
        </div>
    );
}

export default App;

