import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { TextField, Button, Box, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";

const RegisterForm = () => {
    const navigate = useNavigate();

    const registerSchema = Yup.object().shape({
        email: Yup.string().email("Invalid email").required("Email is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null],  "Passwords must match")
            .required("Confirm Password is required"),
    });

    const handleRegister = async (values) => {
        try {
            const hashedPassword = bcrypt.hashSync(values.password, 10);

            const response = await axios.post("/api/register", {
                email: values.email,
                hashed_password: hashedPassword,
            });

            console.log("Registration successful:", response.data);
            navigate("/login");
        } catch (error) {
            console.error("Registration failed:", error.response?.data || error);
        }
    };

    return (
         <Box sx={{ maxWidth: 400, margin: "auto", marginTop: 10 }}>
            <Typography variant="h4" gutterBottom>
                Register
            </Typography>
            <Formik
                initialValues={{
                    email: "",
                    password: "",
                    confirmPassword: "",
                }}
                validationSchema={registerSchema}
                onSubmit={handleRegister}
            >
                {({ handleSubmit }) => (
                    <Form onSubmit={handleSubmit}>
                        <Field
                            as={TextField}
                            name="email"
                            label="Email"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        />
                        <ErrorMessage name="email" component="div" style={{ color: "red" }} />

                        <Field
                            as={TextField}
                            name="password"
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        />
                        <ErrorMessage name="password" component="div" style={{ color: "red" }} />

                        <Field
                            as={TextField}
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        />
                        <ErrorMessage
                            name="confirmPassword"
                            component="div"
                            style={{ color: "red" }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ marginTop: 2 }}
                        >
                            Register
                        </Button>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default RegisterForm;