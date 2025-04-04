import { Reclutador } from "@/types";
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    LinkedIn as LinkedInIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Visibility as VisibilityIcon
} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    IconButton,
    Paper,
    Skeleton,
    Tooltip,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Datos simulados para desarrollo (en producción vendrían de la API)
const mockReclutadores: Reclutador[] = [
    {
        id: '1',
        nombre: 'Ana Martínez',
        empresa: {
            id: '1',
            nombre: 'Empresa ABC',
            correo: 'contacto@empresaabc.com',
            telefono: '123456789',
            fechaCreacion: '2023-01-15',
            fechaActualizacion: '2023-05-20'
        },
        linkedinUrl: 'https://linkedin.com/in/anamartinez',
        telefono: '611222333'
    },
    {
        id: '2',
        nombre: 'Carlos López',
        empresa: {
            id: '2',
            nombre: 'Corporación XYZ',
            correo: 'info@corporacionxyz.com',
            telefono: '987654321',
            fechaCreacion: '2023-02-10',
            fechaActualizacion: '2023-06-15'
        },
        linkedinUrl: 'https://linkedin.com/in/carloslopez',
        telefono: '622333444'
    },
    {
        id: '3',
        nombre: 'Elena Rodríguez',
        empresa: {
            id: '1',
            nombre: 'Empresa ABC',
            correo: 'contacto@empresaabc.com',
            telefono: '123456789',
            fechaCreacion: '2023-01-15',
            fechaActualizacion: '2023-05-20'
        },
        linkedinUrl: 'https://linkedin.com/in/elenarodriguez',
        telefono: '633444555'
    },
    {
        id: '4',
        nombre: 'Javier Sánchez',
        empresa: {
            id: '3',
            nombre: 'Tech Solutions',
            correo: 'soporte@techsolutions.com',
            telefono: '555555555',
            fechaCreacion: '2023-03-05',
            fechaActualizacion: '2023-07-10'
        },
        linkedinUrl: 'https://linkedin.com/in/javiersanchez',
        telefono: '644555666'
    },
    {
        id: '5',
        nombre: 'María González',
        empresa: {
            id: '4',
            nombre: 'Startup Inc',
            correo: 'hello@startupinc.com',
            telefono: '666666666',
            fechaCreacion: '2023-04-20',
            fechaActualizacion: '2023-08-05'
        },
        linkedinUrl: 'https://linkedin.com/in/mariagonzalez',
        telefono: '655666777'
    }
];

/**
 * Componente que muestra los detalles de un reclutador específico
 * Incluye información personal, de contacto y su empresa asociada
 */
const ReclutadorDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [reclutador, setReclutador] = useState<Reclutador | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // Simulación de carga de datos (reemplazar por llamada a API)
        setTimeout(() => {
            if (!id) {
                setError('ID de reclutador no proporcionado');
                setLoading(false);
                return;
            }
            
            const foundReclutador = mockReclutadores.find(rec => rec.id === id);
            
            if (foundReclutador) {
                setReclutador(foundReclutador);
                setLoading(false);
            } else {
                setError('Reclutador no encontrado');
                setLoading(false);
            }
        }, 1000);
    }, [id]);
    
    // Navegar de vuelta a la lista de reclutadores
    const handleBack = () => {
        navigate('/reclutadores');
    };
    
    // Navegar a la página de lista con indicación de abrir el diálogo de edición
    const handleEdit = () => {
        // Pasamos el ID del reclutador a editar a través del estado de navegación
        // Esto permitirá que ReclutadoresList abra automáticamente el diálogo de edición
        navigate('/reclutadores', { state: { editReclutadorId: id } });
    };
    
    // Navegar a la página de detalle de la empresa asociada
    const handleViewEmpresa = () => {
        if (reclutador) {
            navigate(`/empresas/${reclutador.empresa.id}`);
        }
    };
    
    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="rectangular" width="100%" height={200} />
                <Skeleton variant="text" sx={{ mt: 2 }} />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
            </Box>
        );
    }
    
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Typography variant="h6">{error}</Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleBack}
                        sx={{ mt: 2 }}
                    >
                        Volver a la lista
                    </Button>
                </Paper>
            </Box>
        );
    }
    
    if (!reclutador) {
        return null;
    }
    
    return (
        <Box sx={{ p: 3, width: '100%', maxWidth: '1200px', mx: 'auto' }}>
            {/* Cabecera con acciones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap' }}>
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                >
                    Volver a la lista
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                >
                    Editar Reclutador
                </Button>
            </Box>
            
            {/* Tarjeta principal con información del reclutador */}
            <Card elevation={3} sx={{ bgcolor: '#121212', color: 'white'  }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
                        <PersonIcon fontSize="large" sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h4" component="h1">
                            {reclutador.nombre}
                        </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, justifyContent: 'center', alignItems: 'flex-start', my: 5 }}>
                        {/* Información de contacto */}
                        <Box sx={{ flex: '0 1 450px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                            <Typography variant="h6" gutterBottom sx={{ alignSelf: 'center', mb: 3, color: 'text.secondary' }}>
                                Información de contacto
                            </Typography>
                            
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: 3,
                                    p: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    width: '100%',
                                    maxWidth: '450px',
                                    mx: 'auto',
                                    bgcolor: 'background.paper'
                                }}
                            >
                                {reclutador.telefono && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 2 }}>
                                        <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                        <Typography variant="body1">
                                            {reclutador.telefono}
                                        </Typography>
                                    </Box>
                                )}
                                
                                {reclutador.linkedinUrl && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 2 }}>
                                        <LinkedInIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                        <Typography variant="body1">
                                            <a 
                                                href={reclutador.linkedinUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ color: 'inherit', textDecoration: 'underline' }}
                                            >
                                                Perfil de LinkedIn
                                            </a>
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                        
                        {/* Información de la empresa */}
                        <Box sx={{ flex: '0 1 450px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                            <Typography variant="h6" gutterBottom sx={{ alignSelf: 'center', mb: 3, color: 'text.secondary' }}>
                                Empresa
                            </Typography>
                            
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: 3,
                                    p: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    width: '100%',
                                    maxWidth: '450px',
                                    mx: 'auto',
                                    bgcolor: 'background.paper'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 2 }}>
                                        <BusinessIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                        <Typography variant="body1" fontWeight="bold">
                                            {reclutador.empresa.nombre}
                                        </Typography>
                                    </Box>
                                    <Tooltip title="Ver detalles de la empresa">
                                        <IconButton 
                                            color="primary" 
                                            onClick={handleViewEmpresa}
                                            size="small"
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 2 }}>
                                    <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                    <Typography variant="body2">
                                        {reclutador.empresa.correo}
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 2 }}>
                                    <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                    <Typography variant="body2">
                                        {reclutador.empresa.telefono}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    
                    {/* Sección para candidaturas relacionadas (se implementaría en una versión futura) */}
                    <Divider sx={{ my: 4 }} />
                    <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        Candidaturas relacionadas
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                        No hay candidaturas asociadas a este reclutador.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ReclutadorDetail;
