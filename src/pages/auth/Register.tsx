import authService from "@/services/authService";
import { RegisterRequest } from "@/types";
import { PersonAddOutlined } from "@mui/icons-material";
import { Alert, Avatar, Box, Button, CircularProgress, Paper, TextField, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";

const Register = () =>{
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {control, handleSubmit, watch, formState: { errors }} = useForm<RegisterRequest & { confirmPassword: string }>({
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    // Para validar que las contraseñas coincidan
    const password = watch('password');

    const onSubmit = async ( data: RegisterRequest & { confirmPassword: string }) => {
        try {
            // Verificar que las contraseñas coincidan
            if(data.password !== data.confirmPassword){
                setError('Las contraseñas no coinciden');
                return;
            }

            setLoading(true);
            setError('');
            setSuccess('');
            
            // Preparar datos para el registro (sin confirmPassword)
            const { confirmPassword, ...registerData } = data;

            // Llamada al backend 
            await authService.register(registerData);

            // Mostrar mensaje de exito
            setSuccess('Registro existoso. Ahora puede iniciar sesion.');

            // Redirigir al login despues de un breve retraso
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            console.error('Error de registro: ', err);

            // Manejar diferentes tipos de errores
            if(err.response){
                // El servidor respondio con un error
                if(err.response.data?.error){
                    setError(err.response.data.error);
                }else if(err.response.data?.message){
                    setError(err.response.data.message);
                }else{
                    setError(`Error ${err.response.status}: ${err.response.statusText}`);
                }
            }else if(err.request){
                // No se recibio respuesta
                setError('No se pudo conecta con el servidor. Verifique su conexion a internet.');
            }else{
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
                        <Avatar sx={{ m:1, bgcolor: 'secondary.main' }}>
                            <PersonAddOutlined />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Registro de Usuario
                        </Typography>
                    </Box>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                        <Controller
                            name="username"
                            control={control}
                            rules={{
                                required: 'El nombre de usuario es obligatorio',
                                minLength: {
                                    value: 3,
                                    message: 'El nombre de usuario debe tener al menos 3 caracteres'
                                }
                            }}
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
                            name="email"
                            control={control}
                            rules={{
                                required: 'El email es obligatorio',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Email invalido'
                                }
                            }}
                            render={({ field })=> (
                                <TextField 
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email"
                                    autoComplete="email"
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    {...field}
                                />
                            )}
                        />

                        <Controller 
                            name="password"
                            control={control}
                            rules={{
                                required: 'La contraseña es obligatoria',
                                minLength: {
                                    value: 6,
                                    message: 'La contraseña debe tener al menos 6 caracteres'
                                }
                            }}
                            render={({ field }) => (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="password"
                                    label="Contraseña"
                                    type="password"
                                    autoComplete="new-password"
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    {...field}
                                />
                            )}
                        />

                        <Controller 
                            name="confirmPassword"
                            control={control}
                            rules={{
                                required: 'Confirma tu contraseña',
                                validate: value => value === password || 'Las contraseñas no coindicen'
                            }}
                            render={({ field }) => (
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="confirmPassword"
                                    label="Confirmar Contraseña"
                                    type="password"
                                    autoComplete="new-password"
                                    error={!!errors.confirmPassword}
                                    helperText={errors.confirmPassword?.message}
                                    {...field}
                                />
                            )}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Registrarse' }
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                component={RouterLink}
                                to="login"
                                variant="body2"
                            >
                                ¿Ya tienes una cuenta? Inicia sesión
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    )
}

export default Register;
