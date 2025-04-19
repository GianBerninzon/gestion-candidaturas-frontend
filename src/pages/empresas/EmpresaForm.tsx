import empresasService from "@/services/empresasService";
import useAuthStore from "@/store/authStore";
import { Empresa } from "@/types";
import { Alert, Box, Button, CircularProgress, IconButton, Paper, TextField, Typography } from "@mui/material";
import {
    ArrowBack as ArrowBackIcon, 
    Cancel as CancelIcon,
    Save as SaveIcon
}from '@mui/icons-material';
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';

const EmpresaForm: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {user} = useAuthStore();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROOT';
    const isEdit = !!id;

    const [empresa, setEmpresa] = useState<Empresa>({
        id: '',
        nombre: '',
        correo: '',
        telefono: ''
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        // Si estamos en modo edicion, cargar la empresa y verificar permisos
        if(id){
            const fetchEmpresas = async () => {
                setLoading(true);
                try {
                    const data = await empresasService.getEmpresaById(id as string);
                    setEmpresa({
                        id: data.id,
                        nombre: data.nombre,
                        correo: data.correo || '',
                        telefono: data.telefono || ''
                    });

                    //Verificar si puede editar (debe ser ADMIN/ROOT o tener candidaturas en esta empresa)
                    const canEdit = user?.role === 'ADMIN' || user?.role === 'ROOT' || data.userHasCandidatura;
                     if(!canEdit){
                        // Redirigir si no tiene permisos
                        navigate('/empresas');
                        toast.error('No tienes permisos para editar esta empresa');
                     }
                } catch (err: any) {
                    console.error('Error al cargar empresa:', err);
                    setError('Error al cargar los datos de la empresa. Por favor, intetalo de nuevo.');
                    navigate('/empresas');
                } finally {
                    setLoading(false);
                }
            };
            fetchEmpresas();
        }
    }, [id, navigate, user]);

    // Manejar cambios en los campor del formulario
    const handleChage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setEmpresa(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejar el envio del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if(isEdit){
                // Si es una edicion, usamos el metodo de actualizacion
                if(isAdmin){
                    // Admin puede usar el endpoint completo
                    await empresasService.updateEmpresa(id as string, {
                        nombre: empresa.nombre,
                        correo: empresa.correo,
                        telefono: empresa.telefono
                    });
                }else {
                    // Usuario normal usa el endpoint user-update
                    await empresasService.updateEmpresa(id as string, {
                        nombre: empresa.nombre,
                        correo: empresa.correo,
                        telefono: empresa.telefono
                    });
                }
                setSuccess('Empresa actualizada correctamente');
            }else{
                // Si es crecacion, verificamos si es admin o creacion durante candidatura
                if(isAdmin){
                    await empresasService.createEmpresa({
                        nombre: empresa.nombre,
                        correo: empresa.correo,
                        telefono: empresa.telefono
                    });
                }else{
                    // Usuario normal usa el endpoint para crear una candidatura
                    await empresasService.createEmpresaWithCandidatura({
                        nombre: empresa.nombre,
                        correo: empresa.correo,
                        telefono: empresa.telefono
                    });
                }
                setSuccess('Empresa creada correctamente');
            }

            // Esperar un momento para mostrar el mensaje de exito antes de redirigir
            setTimeout(() => {
                navigate('/empresas');
            }, 1500);
        } catch (err: any) {
            console.error('Error al guardar empresa:',err);

            let errorMessage = 'Error al guardar los datos de la empresa.';

            if(err.response){
                if (err.response.status === 403) {
                    errorMessage = 'No tienes permisos para realizar esta acción.';
                } else if (err.response.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.data?.error?.message) {
                    errorMessage = err.response.data.error.message;
                }
            }

            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if(loading){
        return (
            <Box sx={{ display: 'flex' , justifyContent: 'center', alignItems: 'center', height: '300px'}}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            maxWidth: '800px',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <Box sx={{
                maxWidth: '800px',
                width: '100%',
                mx: 'auto',
                p: 3
            }}>
                <Box sx={{ mb:4, display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        color="primary"
                        onClick={() => navigate('/empresas')}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant='h4' component="h1">
                        {isEdit ? 'Editar Empresa' : 'Nueva Empresa'}
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{mb:4}}>
                        {success}
                    </Alert>
                )}

                <Paper sx={{ p: 4, bgcolor: 'background.paper', boxShadow: 2 }}>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {/* Campo Nombre */}
                            <Box sx={{
                                bgcolor: 'background.default',
                                p: 3,
                                borderRadius: 2,
                                border: 1,
                                borderColor: 'divider'
                            }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 'medium' }}>
                                    Datos de la empresa
                                </Typography>
                                <TextField 
                                    required
                                    fullWidth
                                    id="nombre"
                                    name="nombre"
                                    label="Nombre"
                                    value={empresa.nombre}
                                    onChange={handleChage}
                                    variant="outlined"
                                    disabled={saving}
                                />

                            {/* Campos correo y telefono */}
                            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 'medium' }}>
                                Contacto
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 3 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2" gutterBottom sx={{ mb: 1, color: 'text.secondary' }}>
                                    Correo electrónico
                                    </Typography>
                                    <TextField 
                                        fullWidth
                                        id="correo"
                                        name="correo"
                                        placeholder="Correo electronico"
                                        value={empresa.correo || ''}
                                        onChange={handleChage}
                                        variant="outlined"
                                        disabled={saving}
                                        type="email"
                                    />
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2" gutterBottom sx={{ mb: 1, color: 'text.secondary' }}>
                                        Teléfono
                                    </Typography>
                                    <TextField 
                                        fullWidth
                                        id="telefono"
                                        name="telefono"
                                        placeholder="Número de teléfono de contacto"
                                        value={empresa.telefono || ''}
                                        onChange={handleChage}
                                        variant="outlined"
                                        disabled={saving}
                                    />
                                </Box>
                        </Box>
                            </Box>
                            
                        </Box>
                        {/* Botones de accion */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3, mt: 3 }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => navigate('/empresas')}
                                startIcon={<CancelIcon />}
                                disabled={saving}
                            >Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                startIcon={<SaveIcon />}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                        Guardando...
                                    </>
                                ): (
                                    isEdit ? 'Actualizar Empresa' : 'Crear Empresa'
                                )}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Box>
    );
};

export default EmpresaForm;