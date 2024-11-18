import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, TextField, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
    const navigate = useNavigate();

    const loginSchema = Yup.object().shape({
        email: Yup.string().email("Invalid email").required("Required"),
        password: Yup.string().min(6, "Too Short!").required("Required"),
    });

    const handleSubmit = async (values) => {
        try {
            const response = await axios.post("api/login", values);
            localStorage.setItem("token", response.data.token);
            navigate("/dashboard");
        } catch (error) {
            console.error("Login failed:", error)
        }
    };

    return (
        <Box sx={{ maxWidth: 400, margin: "auto", marginTop: 10 }}>
            <Typography variant="h4" gutterBottom>
                Login
            </Typography>
            <Formik
                initialValues={{ email: "", password: "" }}
                validationSchema={loginSchema}
                onSubmit={handleSubmit}
            >
                {({ handleSubmit }) => (
                    <Form onSubmit={handleSubmit}>
                        <Field
                            name="email"
                            as={TextField}
                            label="Email"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        />
                        <ErrorMessage name="email" component="div" style={{ color: "red" }} />
                        <Field
                            name="password"
                            as={TextField}
                            type="password"
                            label="Password"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        />
                        <ErrorMessage name="password" component="div" style={{ color: "red" }}/>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ marginTop: 2 }}
                        >
                            Login
                        </Button>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default LoginForm;