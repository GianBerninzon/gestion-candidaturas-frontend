import { esES } from "@mui/material/locale";
import { createTheme, ThemeProvider } from "@mui/material";

// Definicion de la paleta de colores
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Azul Material UI
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#dc004e', // Rojo-Rosa para acentos
            light: '#ff4081',
            dark: '#c51162',
        },
        error: {
            main: '#f44336', // Para estados Rechazado
        },
        warning: {
            main: '#ffeb3b', // Para estados Pendiente
        },
        info: {
            main: '#2196f3', // Para estados Entrevista
        },
        success:{
            main: '#4caf50', // Para estados Aceptado
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    typography:{
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1:{
            fontSize: '2rem',
            fontWeight: 500,
        },
        h2:{
            fontSize: '1.75rem',
            fontWeight: 500,
        },
        h3:{
            fontSize: '1.5rem',
            fontWeight: 500,
        },
        h4:{
            fontSize: '1.25rem',
            fontWeight: 500,
        },
        h5:{
            fontSize: '1.1rem',
            fontWeight: 500,
        },
        h6:{
            fontSize: '1rem',
            fontWeight: 500,
        },
    },
    shape:{
        borderRadius: 8,
    },
    components:{
        MuiButton:{
            styleOverrides:{
                root:{
                    textTransform: 'none', // Evitar Mayusculas en botones
                },
            },
        },
        MuiCard:{
            styleOverrides:{
                root:{
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                },
            },
        },
    },
}, esES); // Configuracion de locale para español

export default theme;

//Componentes para aplicar el tema
export const ThemeConfig = ({ children } : { children: React.ReactNode } ) => {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};