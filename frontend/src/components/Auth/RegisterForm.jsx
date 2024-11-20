// src/components/RegisterForm.js
import React from 'react';
import NavBar from '../NavBar';
import { useForm } from 'react-hook-form';
import '../../styles/global.css';
import { Link } from 'react-router-dom';

const RegisterForm = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const password = watch("password");

    const onSubmit = (data) => {
        console.log("Register Data:", data);
    };

    return (
        <div className="gradient-background">
            <NavBar />
            <div className="centered-content">
                <div className="form-container">
                    <h2 className="text-center">Sign Up</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email address</label>
                            <input
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                        message: "Invalid email address"
                                    }
                                })}
                                type="email"
                                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                id="email"
                                placeholder="Enter your email"
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters long"
                                    }
                                })}
                                type="password"
                                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                                id="password"
                                placeholder="Enter your password"
                            />
                            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                            <input
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: value => value === password || "Passwords do not match"
                                })}
                                type="password"
                                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                                id="confirmPassword"
                                placeholder="Confirm your password"
                            />
                            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary">Sign Up</button>
                        </div>
                    </form>
                    <p className="text-center mt-3">
                        Already have an account? <Link to="/login" className="text-white">Log in here</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
