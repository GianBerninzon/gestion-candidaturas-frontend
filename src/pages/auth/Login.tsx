import authService from "@/services/authService";
import useAuthStore from "@/store/authStore";
import { AuthRequest } from "@/types";
import { LockOutlined } from "@mui/icons-material";
import { Alert, Avatar, Box, Button, CircularProgress, Container, Link, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const Login = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const {control, handleSubmit, formState: { errors }} = useForm<AuthRequest>({
        defaultValues: {
            username: '',
            password: ''
        }
    });

    const onSubmit = async (data: AuthRequest) => {
        try {
            setLoading(true);
            setError('');

            // En produccion, usariamos:
            const response = await authService.login(data);

            // Simulacion para desarrollo
            /* await new Promise(resolve => setTimeout(resolve, 1000));

            const mockResponse ={
                token: 'mock-jwt-token',
                id: '1',
                username: data.username,
                email: `${data.username}@example.com`,
                role: 'USER'
            };
 
            login({
                id: mockResponse.id,
                username: mockResponse.username,
                email: mockResponse.email,
                role: mockResponse.role,
            }, mockResponse.token);
            */

            // Almacenar informacion de autenticacion
            login({
                id: response.id,
                username: response.username,
                email: response.email,
                role: response.role,
            }, response.token);

            navigate('/');
        } catch (err: any){
            //setError(err.response?.data?.message || 'Error al iniciar sesión');
            console.error('Error al iniciar sesión:', err);

            //Manejar diferentes tipos de errores
            if(err.response){
                // El servidor respondio con un error
                if(err.response.status === 401){
                    setError('Credenciales inválidas. Por favor verifique su usuario y contraseña.');
                }else if(err.response.data?.error){
                    setError(err.response.data.error);
                }else if(err.response.data?.message){
                    setError(err.response.data.message);
                }else{
                    setError(`Error ${err.response.status}: ${err.response.statusText}`);
                }
            } else if (err.request){
                // No se recibio respuesta
                setError('No se pudo conecta con el servidor. Verifique su conexion a internet.');
            } else{
                // Error al configurar la peticion
                setError('Error al procesar la solicitud. Intente nuevamente.');
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: 2 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                            <LockOutlined />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Iniciar Sesión
                        </Typography>
                    </Box>
                    {error && (
                        <Alert severity="error" sx={{mt:2}}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                        <Controller
                            name="username"
                            control={control}
                            rules={{ required: 'El nombre de usuario es obligatorio' }}
                            render={({ field }) => (
                                <TextField 
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Nombre de Usuario"
                                    autoComplete="username"
                                    autoFocus
                                    error={!!errors.username}
                                    helperText={errors.username?.message}
                                    {...field}
                                />
                            )}
                        />

                        <Controller 
                            name="password"
                            control={control}
                            rules={{ required: 'La contraseña es obligatoria' }}
                            render={({ field }) => (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Contraseña"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    {...field}
                                />
                            )}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Iniciar Sesion'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }} >
                            <Link component={RouterLink} to="/register" variant="body2">
                                ¿No tienes cuenta? Registrate
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;