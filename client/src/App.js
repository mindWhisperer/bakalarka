import './style/App.css';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import React from "react";


function App() {

    return (
        <div className="app-container">
            <Navbar />
            <div className="main-content">
                <h1>Zoznam pacientov</h1>
                < Home/>
            </div>
            <Footer/>
        </div>
    );
}

export default App;

