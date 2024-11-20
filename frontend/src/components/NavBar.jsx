import React from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import {Button} from "@mui/material";

const NavBar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <NavLink className="navbar-brand" to="/dashboard">Graphs AI</NavLink>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <NavLink
                                className={({isActive}) => "nav-link" + (isActive ? " active" : "")}
                                to="/dashboard"
                            >
                                Dashboard
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                className={({isActive}) => "nav-link" + (isActive ? " active" : "")}
                                to="/upload"
                            >
                                Upload Files
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <Button className="btn btn-outline-light" onClick={handleLogout}>Logout</Button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;