// src/components/LoginForm.js
import React from 'react';
import NavBar from '../NavBar';
import '../../styles/global.css';
import { Link } from 'react-router-dom';

const LoginForm = () => {
    return (
        <div className="gradient-background">
            <NavBar />
            <div className="centered-content">
                <div className="form-container">
                    <h2 className="text-center">Log In</h2>
                    <form>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email address</label>
                            <input type="email" className="form-control" id="email" placeholder="Enter your email" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input type="password" className="form-control" id="password" placeholder="Enter your password" />
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary">Log In</button>
                        </div>
                    </form>
                    <p className="text-center mt-3">
                        Don't have an account? <Link to="/register" className="text-white">Register here</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
