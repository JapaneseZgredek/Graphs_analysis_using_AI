// src/components/Home.js
import React from 'react';
import '../styles/global.css';
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="gradient-background">
            <div className="centered-content">
                <div className="text-center">
                    <h1>Welcome to Graphs Analysis AI</h1>
                    <p>Analyze your data with the power of AI.</p>
                    <div>
                        <Link to="/login" className="btn btn-primary btn-lg mx-2">Log In</Link>
                        <Link to="/register" className="btn btn-outline-light btn-lg max-2">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
