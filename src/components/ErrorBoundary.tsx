import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Actualizar el estado para el siguiente render muestre la UI alternativa
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo){
        // Tambien podemos registrar el error en un servicio de reporte
        console.error('Error capturado por el boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    private handleReset =() => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    }

    public render (){
        if(this.state.hasError){
            if(this.props.fallback){
                return this.props.fallback;
            }

            return (
                <Box sx={{ 
                    p:3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '50vh'
                }}>
                    <Paper
                        elevation={3}
                        sx={{
                            p:4,
                            maxWidth: 600,
                            width: '100%',
                            borderLeft: '4px solid #f44336'
                        }}
                    >
                        <Typography variant="h5" color="error" gutterBottom>
                            Algo salio mal
                        </Typography>

                        <Typography variant="body1" paragraph>
                            Se ha producido un error en la aplicacion. Puedes intentar:
                        </Typography>

                        <Box sx= {{ mb: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={this.handleReset}
                            >
                                Intentar de nuevo
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => window.location.href = '/'}
                            >
                                Volver al inicio
                            </Button>
                        </Box>

                        {import.meta.env.DEV && (
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Detalles del error (solo desarrollo):
                                </Typography>
                                <Box
                                    component="pre"
                                    sx={{
                                        p:2,
                                        bgcolor:'#f5f5f5',
                                        overflow: 'auto',
                                        fontSize: '0.8rem',
                                        borderRadius: 1,
                                    }}
                                >
                                    {this.state.error?.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;