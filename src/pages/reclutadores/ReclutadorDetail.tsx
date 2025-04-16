import reclutadoresService from "@/services/reclutadoresService";
import useAuthStore from "@/store/authStore";
import { CandidaturaWithEmpresaDTO, ReclutadorWithEmpresaDTO } from "@/types";
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    LinkedIn as LinkedInIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Delete as DeleteIcon,
    Error as ErrorIcon,
    BorderClear
} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    Pagination,
    Paper,
    Tooltip,
    Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Componente que muestra los detalles de un reclutador específico
 * Incluye información personal, de contacto y su empresa asociada
 */
const ReclutadorDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {user} = useAuthStore();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROOT';
    
    const [reclutador, setReclutador] = useState<ReclutadorWithEmpresaDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [candidaturas, setCandidaturas] = useState<CandidaturaWithEmpresaDTO[]>([]);
    const [candidaturasPage, setCandidaturasPage] = useState(0);
    const [candidaturasSize, setCandidaturasSize] = useState(6);
    const [candidaturasTotal, setCandidaturasTotal] = useState(0);
    const [candidaturasTotalPage, setCandidaturasTotalPage] = useState(0);
    const [loadingCandidaturas, setLoadingCandidaturas] = useState(false);
    const [errorCandidaturas, setErrorCandidaturas] = useState<string | null>(null);
    
    useEffect(() => {
      const fecthReclutador = async () => {
        if(!id){
            setError('ID de reclutador no proporcionado');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await reclutadoresService.getReclutadorById(id);
            console.log('Datos del reclutador:',data);
            setReclutador(data);
        } catch (err: any) {
            console.error('Error al cargar el reclutador:', err);
            
            let errorMessage = 'No se pudo cargar la informacion del reclutador.';

            if(err.response){
                if(err.response.status === 404){
                    errorMessage = 'Reclutador no encontrado.';
                }else if(err.response.status === 403){
                    errorMessage = 'No tienes permiso para ver este reclutador.';
                }else if(err.response.data?.message){
                    errorMessage = err.response.data.message;
                }
            }else if(err.request){
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            }

            setError(errorMessage);
        }finally{
            setLoading(false);
        }
      };
      fecthReclutador();
    }, [id]);

    useEffect(() => {
        const fetchCandidaturas = async() => {
            if(!id || !reclutador) return;

            setLoadingCandidaturas(true);
            setErrorCandidaturas(null);

            try {
                const response = await reclutadoresService.getCandidaturasByReclutador(id, candidaturasPage, candidaturasSize);
                setCandidaturas(response.content);
                setCandidaturasTotal(response.totalElements);
                setCandidaturasTotalPage(response.totalPages);
            } catch (err: any) {
                console.error('Error al cargar las candidaturas:', error);
                let errorMessage = 'No se pudo cargar la informacion de las candidaturas.';

                if(err.response){
                    if(err.response.status === 403){
                        errorMessage = 'No tienes permiso para ver las candidaturas.';
                    }else if(err.response.data?.message){
                        errorMessage = err.response.data.message;
                    }
                }else if(err.request){
                    errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
                }

                setErrorCandidaturas(errorMessage);
            } finally {
                setLoadingCandidaturas(false);
            }
        };
        fetchCandidaturas();
    }, [id, reclutador, candidaturasPage, candidaturasSize]);

    //Funciona para cambiar de pagina
    const handleCandidaturasPageChange = (event:unknown, newPage: number) => {
        setCandidaturasPage(newPage);
    };
    
    // Navegar de vuelta a la lista de reclutadores
    const handleBack = () => {
        navigate('/reclutadores');
    };
    
    // Navegar a la pagina de edicion
    const handleEdit = () => {
        if(id){
            navigate(`/reclutadores/${id}/edit`);
        }
    };

    // Navegar a la página de detalle de la empresa asociada
    const handleViewEmpresa = () => {
        if (reclutador?.empresa?.id) {
            navigate(`/empresas/${reclutador.empresa.id}`);
        }
    };

    // Manejar el borrado del reclutador
    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if(!id) return;

        setDeleting(true);
        try {
            await reclutadoresService.deleteReclutador(id);
            setDeleteDialogOpen(false);
            navigate('/reclutadores', { state: { message: 'Reclutador eliminado exitosamente' }});
        } catch (err: any) {
            console.error('Error al eliminar el reclutador:', err);
            let errorMessage = 'Error al eliminar el reclutador.';

            if(err.response){
                if(err.response.status === 403){
                    errorMessage = 'No tienes permisos para eliminar este reclutador.';
                }else if(err.response.data?.message){
                    errorMessage = err.response.data.message;
                }
            }

            setError(errorMessage);
            setDeleteDialogOpen(false);
        }finally{
            setDeleting(false);
        }
    };

    const handleDeteleCancel = () => {
        setDeleteDialogOpen(false);
    };
    
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ErrorIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">{error}</Typography>
                    </Box>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                >
                    Volver a la lista
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {isAdmin && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDeleteClick}
                        >
                            Eliminar
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={handleEdit}
                    >
                    Editar Reclutador
                </Button>
                </Box>
            </Box>

            {/* Tarjeta principal con información del reclutador */}
            <Card elevation={3}>
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
                                {reclutador.linkinUrl && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 2 }}>
                                        <LinkedInIcon sx={{ mr: 2, color: '#0077b5' }} />
                                        <Typography variant="body1">
                                            <a 
                                                href={reclutador.linkinUrl.startsWith('https') ? reclutador.linkinUrl : `https://${reclutador.linkinUrl}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ color: '#0077b5', textDecoration: 'underline' }}
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
                                {reclutador.empresa ? (
                                    <>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 2 }}>
                                                <BusinessIcon sx={{ mr: 2, color: 'secondary.main' }} />
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
                                                    <ArrowBackIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>

                                        {reclutador.empresa.correo && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 2 }}>
                                                <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                                <Typography variant="body2">
                                                    {reclutador.empresa.correo}
                                                </Typography>
                                            </Box>
                                        )}

                                        {reclutador.empresa.telefono && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pl: 2 }}>
                                            <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                                            <Typography variant="body2">
                                                {reclutador.empresa.telefono}
                                            </Typography>
                                        </Box>
                                        )}
                                    </>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" align="center">
                                        No hay informacion de empresa disponible
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    
                    {/* Sección para candidaturas relacionadas (se implementaría en una versión futura) */}
                    <Divider sx={{ my: 4 }} />
                    <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        Candidaturas relacionadas
                    </Typography>

                    {loadingCandidaturas && candidaturasPage === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ): errorCandidaturas ? (
                        <Typography variant="body2" color="error" sx={{ textAlign: 'center', mb: 3}}>
                            {errorCandidaturas}
                        </Typography>
                    ) : candidaturas.length > 0 ? (
                        <Box sx={{ px:3, pb: 3}}>
                            <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr'},
                                    gap: 2  
                            }}>
                                {candidaturas.map(candidatura => (
                                    <Card key={candidatura.id} sx={{ height: '100%'}}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                {candidatura.cargo}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb:1}}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(candidatura.fecha).toLocaleDateString()}
                                                </Typography>
                                                <Chip 
                                                    label={candidatura.estado}
                                                    size="small"
                                                    color={
                                                        candidatura.estado === 'ACEPTADA' ? 'success' :
                                                        candidatura.estado === 'RECHAZADA' ? 'error' :
                                                        candidatura.estado === 'ENTREVISTA' ? 'primary' :
                                                        candidatura.estado === 'PENDIENTE' ? 'warning' :
                                                        'default'
                                                    }
                                                />
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2}}>
                                                <BusinessIcon fontSize="small" sx={{ mr:1, color: 'text.secondary'}} />
                                                <Typography variant="body2">
                                                    {candidatura.empresa.nombre}
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={{ mt: 2 }}
                                                onClick={() => navigate(`/candidaturas/${candidatura.id}`)}
                                            >
                                                Ver detalles
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>

                            {/* Paginacion */}
                            {candidaturasTotalPage > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3}}>
                                <Pagination
                                    count={candidaturasTotalPage}
                                    page={candidaturasPage + 1}
                                    onChange={(e, page) => handleCandidaturasPageChange(e, page -1)}
                                    color="primary"
                                />
                            </Box>
                            )}
                        </Box>
                    ): (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3}}>
                            No hay candidaturas relacionadas con este reclutador.
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* Dialogo de confirmacion para eliminar */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeteleCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-desciption"
            >
                <DialogTitle id="alert-dialog-title">
                    {"¿Eliminar este reclutador?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-desciption">
                        Esta Accion no se puede deshacer. Al eliminar este reclutador, se perderá toda su información y asociaciones con candidaturas.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                        autoFocus
                    >
                        {deleting ? <CircularProgress size={24} /> : 'Eliminar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReclutadorDetail;
