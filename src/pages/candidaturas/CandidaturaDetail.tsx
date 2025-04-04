import { Candidatura, EstadoCandidatura } from "@/types";
import candidaturasService from "@/services/candidaturasService";
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    Description as DescriptionIcon,
    CalendarMonth as CalendarMonthIcon,
    Flag as FlagIcon
} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Skeleton,
    Tooltip,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";



// Función para obtener el color del chip según el estado
const getEstadoColor = (estado: EstadoCandidatura) => {
    switch (estado) {
        case EstadoCandidatura.PENDIENTE:
            return 'default';
        case EstadoCandidatura.ENTREVISTA:
            return 'primary';
        case EstadoCandidatura.SEGUNDA_ENTREVISTA:
            return 'secondary';
        case EstadoCandidatura.EN_PROCESO:
            return 'info';
        case EstadoCandidatura.ACEPTADA:
            return 'success';
        case EstadoCandidatura.RECHAZADA:
            return 'error';
        case EstadoCandidatura.ARCHIVADA:
            return 'warning';
        default:
            return 'default';
    }
};

/**
 * Componente que muestra los detalles de una candidatura específica
 * Incluye información de la empresa, cargo, estado, notas y reclutadores asociados
 */
const CandidaturaDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [candidatura, setCandidatura] = useState<Candidatura | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    
    useEffect(() => {
        const fetchCandidatura = async () => {
            if (!id) {
                setError('ID de candidatura no proporcionado');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                const candidaturaData = await candidaturasService.getCandidaturaById(id);
                setCandidatura(candidaturaData);
                setLoading(false);
            } catch (error) {
                console.error('Error al cargar la candidatura:', error);
                setError('Error al cargar la candidatura. Por favor, inténtalo de nuevo.');
                setLoading(false);
            }
        };
        
        fetchCandidatura();
    }, [id]);
    
    // Navegar de vuelta a la lista de candidaturas
    const handleBack = () => {
        navigate('/candidaturas');
    };
    
    // Navegar a la página de edición de la candidatura
    const handleEdit = () => {
        navigate(`/candidaturas/${id}/edit`);
    };
    
    // Actualizar el estado de la candidatura
    const handleUpdateEstado = async (nuevoEstado: EstadoCandidatura) => {
        if (!id) return;
        
        try {
            await candidaturasService.updateEstado(id, nuevoEstado);
            // Recargar los datos actualizados
            const candidaturaActualizada = await candidaturasService.getCandidaturaById(id);
            setCandidatura(candidaturaActualizada);
        } catch (error) {
            console.error('Error al actualizar el estado:', error);
        }
    };
    
    // Navegar a la página de detalle de la empresa asociada
    const handleViewEmpresa = () => {
        if (candidatura) {
            navigate(`/empresas/${candidatura.empresa.id}`);
        }
    };

    // Navegar a la página de detalle de un reclutador
    const handleViewReclutador = (reclutadorId: string) => {
        navigate(`/reclutadores/${reclutadorId}`);
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
    
    if (!candidatura) {
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
                    Editar Candidatura
                </Button>
            </Box>
            
            {/* Tarjeta principal con información de la candidatura */}
            <Card elevation={3} sx={{ bgcolor: '#121212', color: 'white' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
                        <Typography variant="h4" component="h1" sx={{ textAlign: 'center' }}>
                            {candidatura.cargo}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 2, alignItems: 'center' }}>
                        <Chip 
                            label={candidatura.estado} 
                            color={getEstadoColor(candidatura.estado) as any}
                            sx={{ fontWeight: 'bold', fontSize: '1rem', py: 2, px: 1 }}
                        />
                        <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            sx={{ ml: 1 }}
                        >
                            Cambiar estado
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                        >
                            {Object.values(EstadoCandidatura).map((estado) => (
                                <MenuItem 
                                    key={estado} 
                                    onClick={() => {
                                        handleUpdateEstado(estado);
                                        setAnchorEl(null);
                                    }}
                                    selected={candidatura.estado === estado}
                                >
                                    {estado}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, justifyContent: 'center', alignItems: 'flex-start', my: 5 }}>
                        {/* Información general */}
                        <Box sx={{ flex: '0 1 450px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                            <Typography variant="h6" gutterBottom sx={{ alignSelf: 'center', mb: 3, color: 'text.secondary' }}>
                                Información General
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
                                {/* Fecha */}
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 2 }}>
                                    <CalendarMonthIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                    <Typography variant="body1">
                                        Fecha: {candidatura.fecha}
                                    </Typography>
                                </Box>
                                
                                {/* Empresa */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
                                        <BusinessIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                        <Typography variant="body1" fontWeight="bold">
                                            {candidatura.empresa.nombre}
                                        </Typography>
                                    </Box>
                                    <Tooltip title="Ver detalles de la empresa">
                                        <IconButton 
                                            color="primary" 
                                            onClick={handleViewEmpresa}
                                            size="small"
                                        >
                                            <ArrowBackIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                
                                {/* Estado */}
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 2 }}>
                                    <FlagIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                    <Typography variant="body1">
                                        Estado: {candidatura.estado}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        {/* Notas */}
                        <Box sx={{ flex: '0 1 450px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                            <Typography variant="h6" gutterBottom sx={{ alignSelf: 'center', mb: 3, color: 'text.secondary' }}>
                                Notas
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
                                    bgcolor: 'background.paper',
                                    minHeight: '150px'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', pl: 2 }}>
                                    <DescriptionIcon sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {candidatura.notas || 'No hay notas disponibles.'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    
                    {/* Sección para reclutadores relacionados */}
                    <Divider sx={{ my: 4 }} />
                    <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        Reclutadores asociados
                    </Typography>
                    
                    {candidatura.reclutadores && candidatura.reclutadores.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mb: 3 }}>
                            {candidatura.reclutadores.map(reclutador => (
                                <Paper 
                                    key={reclutador.id}
                                    sx={{ 
                                        p: 2, 
                                        bgcolor: 'background.paper',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                    onClick={() => handleViewReclutador(reclutador.id)}
                                >
                                    <PersonIcon color="primary" />
                                    <Typography>{reclutador.nombre}</Typography>
                                </Paper>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                            No hay reclutadores asociados a esta candidatura.
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default CandidaturaDetail;