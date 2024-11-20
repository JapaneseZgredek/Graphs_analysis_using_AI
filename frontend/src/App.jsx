import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm"
import Dashboard from "./pages/Dashboard"
import DescriptionChecker from "./components/Dashboard/DescriptionChecker";
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<DescriptionChecker />} />
            </Routes>
        </Router>
    );
};

export default App;