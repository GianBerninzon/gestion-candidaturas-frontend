import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom"

const NotFound = () =>{
    const navigate = useNavigate();

    return (
        <Container>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    textAlign: 'center'
                }}
            >
                <Typography variant="h1" color="primary" gutterBottom>
                    404
                </Typography>
                <Typography variant="h4" gutterBottom>
                    Pagina no encontrada
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                    La pagina que estas buscando no existe
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate('/')}>
                    Volver a la pagina principal
                </Button>
            </Box>
        </Container>
    );
};

export default NotFound;