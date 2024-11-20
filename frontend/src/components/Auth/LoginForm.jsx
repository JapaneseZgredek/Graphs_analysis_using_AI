// src/components/LoginForm.js
import React, { useState } from 'react';
import NavBar from '../NavBar';
import '../../styles/global.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [serverError, setServerError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://127.0.0.1:8000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "Login failed");
            }

            const data = await response.json();
            localStorage.setItem("token", data.access_token); // Zapis tokena JWT
            navigate("/dashboard"); // Przekierowanie po zalogowaniu
        } catch (error) {
            setServerError(error.message);
        }
    };

    return (
        <div className="gradient-background">
            <NavBar />
            <div className="centered-content">
                <div className="form-container">
                    <h2 className="text-center">Log In</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email address</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {serverError && <div className="text-danger mb-3">{serverError}</div>}
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary">Log In</button>
                        </div>
                    </form>
                    <p className="text-center mt-3">
                        Don't have an account? <a href="/register" className="text-white">Register here</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
