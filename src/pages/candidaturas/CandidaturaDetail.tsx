import { Candidatura, EstadoCandidatura, PreguntaDTO, Reclutador } from "@/types";
import candidaturasService from "@/services/candidaturasService";
import preguntasService from "@/services/preguntasService";
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    Description as DescriptionIcon,
    CalendarMonth as CalendarMonthIcon,
    Flag as FlagIcon,
    Add as AddIcon
} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Skeleton,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import reclutadoresService from "@/services/reclutadoresService";
import useAuthStore from "@/store/authStore";
import PreguntasPanel from "../preguntas/preguntasPanel";



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
    const {user} = useAuthStore();
    
    const [candidatura, setCandidatura] = useState<Candidatura | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [reclutadoresInfo, setReclutadoresInfo] = useState<Reclutador[]>([]);

    // Estados para preguntas
    const [openAddPreguntaDialog, setOpenAddPreguntaDialog] = useState(false);
    const [nuevaPregunta, setNuevaPregunta] = useState('');
    const [savingPregunta, setSavingPregunta] = useState(false);
    const [preguntaError, setPreguntaError] = useState<string | null>(null);

    // Estado para refrescar preguntas
    const [refreshPreguntas, setRefreshPreguntas] = useState(0);

    const isOwner = candidatura && user && candidatura.userInfo?.id === user.id;
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'ROOT');
    const canEdit = isOwner || isAdmin;
    
    // Obtener datos de la candidatura (existente)
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

                // Cargar reclutadores asociados
                if(candidaturaData.reclutadoresIds && candidaturaData.reclutadoresIds.length > 0){
                    const reclutadoresData = await Promise.all(
                        candidaturaData.reclutadoresIds.map(reclId => 
                            reclutadoresService.getReclutadorById(reclId)
                        )
                    );
                    setReclutadoresInfo(reclutadoresData);
                }

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
            setAnchorEl(null);
        } catch (error) {
            console.error('Error al actualizar el estado:', error);
        }
    };
    
    // Navegar a la página de detalle de la empresa asociada
    const handleViewEmpresa = () => {
        if (candidatura?.empresa?.id) {
            navigate(`/empresas/${candidatura.empresa.id}`);
        }
    };

    // Navegar a la página de detalle de un reclutador
    const handleViewReclutador = (reclutadorId: string) => {
        navigate(`/reclutadores/${reclutadorId}`);
    };

    // Abrir diálogo para agregar pregunta
    const handleOpenAddPregunta = () => {
        setNuevaPregunta('');
        setPreguntaError(null);
        setOpenAddPreguntaDialog(true);
    };

    // Guardar nueva pregunta
    const handleSavePregunta = async () => {
        if (!id || !nuevaPregunta.trim()) {
            setPreguntaError('La pregunta no puede estar vacía');
            return;
        }
        
        setSavingPregunta(true);
        setPreguntaError(null);
        
        try {
            const preguntaDTO: PreguntaDTO = {
                candidaturaId: id,
                pregunta: nuevaPregunta.trim()
            };
            
            await preguntasService.createPregunta(preguntaDTO);
            
            // Cerrar diálogo y limpiar
            setOpenAddPreguntaDialog(false);
            setNuevaPregunta('');
            setRefreshPreguntas(prev => prev + 1);
        } catch (error) {
            console.error('Error al guardar la pregunta:', error);
            setPreguntaError('Error al guardar la pregunta. Inténtalo de nuevo.');
        } finally {
            setSavingPregunta(false);
        }
    };

    //Actuazlizar preguntas después de crear una
    const handlePreguntaCreated = () => {
        setRefreshPreguntas(prev => prev + 1);
    };
    
    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Skeleton variant="rectangular" width="100%" height={200} />
                <Skeleton variant="text" sx={{ mt: 2 }} />
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 3 }}>
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
            </Container >
        );
    }
    
    if (!candidatura) {
        return null;
    }
    
    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
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
                {canEdit && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={handleEdit}
                    >
                        Editar Candidatura
                    </Button>
                )}
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
                        {canEdit && (
                            <Button 
                                variant="outlined" 
                                size="small" 
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                sx={{ ml: 1 }}
                            >
                                Cambiar estado
                            </Button>
                        )}
                        
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
                                        Fecha: {new Date(candidatura.fecha).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                
                                {/* Empresa */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
                                        <BusinessIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                        <Typography variant="body1" fontWeight="bold">
                                            {candidatura.empresa?.nombre || 'Sin empresa asignada'}
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
                    
                    {reclutadoresInfo && reclutadoresInfo.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mb: 3 }}>
                            {reclutadoresInfo.map(reclutador => (
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

                    {/* Seccion de preguntas */}
                    {id && (
                        <>
                            <PreguntasPanel 
                                candidaturaId={id}
                                editable={!!canEdit}
                                onAddClick={canEdit ? handleOpenAddPregunta : undefined}
                                key={`preguntas-panel-${refreshPreguntas}`}
                            />

                            {/* {canEdit && (
                                <Box sx={{ mt: 3}}>
                                    <Typography variant="h6" sx={{mb:2}}>
                                        Agregar nueva pregunta
                                    </Typography>
                                    <NuevaPreguntaField 
                                        candidaturaId={id}
                                        onPreguntaCreated={handlePreguntaCreated}
                                    />
                                </Box>
                            )} */}
                        </>
                    )}
                    {/* Diálogo para agregar pregunta */}
                    <Dialog
                        open={openAddPreguntaDialog}
                        onClose={() => !savingPregunta && setOpenAddPreguntaDialog(false)}
                        fullWidth
                        maxWidth="md"
                    >
                        <DialogTitle>Agregar nueva pregunta</DialogTitle>
                        <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Pregunta"
                            fullWidth
                            multiline
                            rows={3}
                            value={nuevaPregunta}
                            onChange={(e) => setNuevaPregunta(e.target.value)}
                            placeholder="Escribe la pregunta de entrevista..."
                            error={!!preguntaError}
                            helperText={preguntaError}
                            disabled={savingPregunta}
                        />
                        </DialogContent>
                        <DialogActions>
                            <Button 
                                onClick={() => setOpenAddPreguntaDialog(false)}
                                disabled={savingPregunta}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={savingPregunta}
                                startIcon={savingPregunta ? <CircularProgress size={20} /> : <AddIcon />}
                            >
                                {savingPregunta ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </DialogActions>
                    </Dialog>
        </Container>
    );
};

export default CandidaturaDetail;