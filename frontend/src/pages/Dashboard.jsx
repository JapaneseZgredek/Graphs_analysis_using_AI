import React from 'react';
import NavBar from '../components/NavBar';
import '../styles/global.css';

const Dashboard = () => {
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
