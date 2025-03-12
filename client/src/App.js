import './style/App.css';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";


function App() {

    return (
        <div className="app-container">
            <Navbar />
            <div className="main-content">
                < Home />
            </div>
            <Footer />
        </div>
    );
}

export default App;

