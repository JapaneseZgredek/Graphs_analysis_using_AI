import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import NavBar from '../components/NavBar';
import '../styles/global.css';

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);
    return (
        <div className="gradient-background">
            <NavBar />
            <div className="container form-container">
                <h2>Dashboard</h2>
                <p>Welcome to your dashboard. Manage your data here.</p>
            </div>
        </div>
    );
};

export default Dashboard;
