import { Button, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Container
      maxWidth="md"
      sx={{
        textAlign: "center",
        marginTop: 10,
      }}
    >
      <Typography variant="h3" gutterBottom>
        Welcome to Graph Analysis Tool
      </Typography>
      <Typography variant="h6" gutterBottom>
        Analyze graphs with AI or verify descriptions effortlessly.
      </Typography>
      <Button
        component={Link}
        to="/login"
        variant="contained"
        color="primary"
        sx={{ margin: 1 }}
      >
        Login
      </Button>
      <Button
        component={Link}
        to="/register"
        variant="outlined"
        color="primary"
        sx={{ margin: 1 }}
      >
        Register
      </Button>
    </Container>
  );
};

export default Home;