import { Empresa } from '@/types';
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    IconButton,
    Paper,
    Skeleton,
    Typography,
    Tooltip
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Business as BusinessIcon,
    CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Datos simulados para desarrollo (en producción vendrían de la API)
const mockEmpresas: Empresa[] = [
    {
        id: '1',
        nombre: 'Empresa ABC',
        correo: 'contacto@empresaabc.com',
        telefono: '123456789',
        fechaCreacion: '2023-01-15',
        fechaActualizacion: '2023-05-20'
    },
    {
        id: '2',
        nombre: 'Corporación XYZ',
        correo: 'info@corporacionxyz.com',
        telefono: '987654321',
        fechaCreacion: '2023-02-10',
        fechaActualizacion: '2023-06-15'
    },
    {
        id: '3',
        nombre: 'Tech Solutions',
        correo: 'soporte@techsolutions.com',
        telefono: '555555555',
        fechaCreacion: '2023-03-05',
        fechaActualizacion: '2023-07-10'
    },
    {
        id: '4',
        nombre: 'Startup Inc',
        correo: 'hello@startupinc.com',
        telefono: '666666666',
        fechaCreacion: '2023-04-20',
        fechaActualizacion: '2023-08-05'
    },
    {
        id: '5',
        nombre: 'Global Enterprises',
        correo: 'info@globalenterprises.com',
        telefono: '111222333',
        fechaCreacion: '2023-05-15',
        fechaActualizacion: '2023-09-01'
    }
];

/**
 * Componente que muestra los detalles de una empresa específica
 * Recibe el ID de la empresa a través de los parámetros de la URL
 */
const EmpresaDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [empresa, setEmpresa] = useState<Empresa | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Simulación de carga de datos (reemplazar por llamada a API)
        setLoading(true);
        setTimeout(() => {
            const foundEmpresa = mockEmpresas.find(emp => emp.id === id);
            if (foundEmpresa) {
                setEmpresa(foundEmpresa);
                setError(null);
            } else {
                setEmpresa(null);
                setError('Empresa no encontrada');
            }
            setLoading(false);
        }, 1000);
    }, [id]);

    // Volver a la lista de empresas
    const handleBack = () => {
        navigate('/empresas');
    };

    // Ir a la página de edición
    const handleEdit = () => {
        if (empresa) {
            // En una implementación real, navegar a la página de edición
            console.log('Editar empresa', empresa.id);
            // navigate(`/empresas/${empresa.id}/edit`);
        }
    };

    // Renderizar esqueleto durante la carga
    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={handleBack}
                    sx={{ mb: 3 }}
                >
                    Volver a la lista
                </Button>
                <Paper sx={{ p: 3 }}>
                    <Skeleton variant="text" height={60} width="50%" />
                    <Skeleton variant="text" height={30} width="30%" sx={{ mt: 2 }} />
                    <Skeleton variant="text" height={30} width="40%" sx={{ mt: 1 }} />
                    <Skeleton variant="text" height={30} width="35%" sx={{ mt: 1 }} />
                    <Skeleton variant="rectangular" height={100} sx={{ mt: 3 }} />
                </Paper>
            </Box>
        );
    }

    // Mostrar mensaje de error si la empresa no existe
    if (error || !empresa) {
        return (
            <Box sx={{ p: 3 }}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={handleBack}
                    sx={{ mb: 3 }}
                >
                    Volver a la lista
                </Button>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color="error" gutterBottom>
                        {error || 'Error al cargar la empresa'}
                    </Typography>
                    <Typography variant="body1">
                        No se pudo encontrar la empresa solicitada. Por favor, vuelve a la lista e intenta de nuevo.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Barra superior con acciones */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={handleBack}
                >
                    Volver a la lista
                </Button>
                <Tooltip title="Editar empresa">
                    <IconButton 
                        color="primary" 
                        onClick={handleEdit}
                        size="large"
                    >
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Tarjeta principal con información de la empresa */}
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BusinessIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                        <Typography variant="h4">
                            {empresa.nombre}
                        </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                        {/* Información de contacto */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                Información de contacto
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                <EmailIcon color="action" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Correo electrónico
                                    </Typography>
                                    <Typography variant="body1">
                                        {empresa.correo}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                <PhoneIcon color="action" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Teléfono
                                    </Typography>
                                    <Typography variant="body1">
                                        {empresa.telefono}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        {/* Fechas */}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                Fechas
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                <CalendarTodayIcon color="action" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Fecha de creación
                                    </Typography>
                                    <Typography variant="body1">
                                        {new Date(empresa.fechaCreacion).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                <CalendarTodayIcon color="action" sx={{ mr: 2 }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Última actualización
                                    </Typography>
                                    <Typography variant="body1">
                                        {new Date(empresa.fechaActualizacion).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    
                    {/* Sección para candidaturas relacionadas (se implementaría en una versión futura) */}
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>
                        Candidaturas relacionadas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        No hay candidaturas asociadas a esta empresa.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default EmpresaDetail;
