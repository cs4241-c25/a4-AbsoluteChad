import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./Login"
import Tracker from "./Tracker"
import "./App.css"

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/tracker" element={<Tracker />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
