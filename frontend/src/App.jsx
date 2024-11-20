import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm"
import Dashboard from "./pages/Dashboard"
import DescriptionChecker from "./components/Dashboard/DescriptionChecker";
import GenerateDescription from "./components/Dashboard/GenerateDescription";
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<DescriptionChecker />} />
                <Route path="/generate-description" element={<GenerateDescription />} />
            </Routes>
        </Router>
    );
};

export default App;