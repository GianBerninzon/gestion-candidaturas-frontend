import { Candidatura, EmpresaWithCandidaturas, EstadoCandidatura } from '@/types';
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    IconButton,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    TableRow,
    TableCell,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    Chip,
    Tooltip,
    Checkbox,
    DialogTitle,
    DialogContentText,
    Snackbar,
    DialogActions,
    DialogContent,
    Dialog
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Business as BusinessIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import empresasService from '@/services/empresasService';
import candidaturasService from '@/services/candidaturasService';

// Estados con colores y etiquetas (igual que en CandidaturasList)
const estadosConfig: Record<EstadoCandidatura, { color: string; label: string }> = {
    [EstadoCandidatura.PENDIENTE]: { color: "warning", label: "Pendiente" },
    [EstadoCandidatura.ENTREVISTA]: { color: "info", label: "Entrevista" },
    [EstadoCandidatura.SEGUNDA_ENTREVISTA]: { color: "info", label: "Segunda Entrevista" },
    [EstadoCandidatura.EN_PROCESO]: { color: "primary", label: "En Proceso" },
    [EstadoCandidatura.ACEPTADA]: { color: "success", label: "Aceptada"},
    [EstadoCandidatura.RECHAZADA]: { color: "error", label: "Rechazada"},
    [EstadoCandidatura.ARCHIVADA]: {color:"default", label: "Archivada"}
};

// Tipo ChipColor para evitar castings
type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';


/**
 * Componente que muestra los detalles de una empresa específica
 * Recibe el ID de la empresa a través de los parámetros de la URL
 */
const EmpresaDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {user} = useAuthStore();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROOT';
    
    const [empresa, setEmpresa] = useState<EmpresaWithCandidaturas | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado para las canidatuas asociadas
    const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
    const [loadingCandidaturas, setLoadingCandidaturas] = useState(false);
    const [errorCandidaturas, setErrorCandidaturas] = useState<string | null>(null);
    const [selectedCandidaturas, setSelectedCandidaturas] = useState<string[]>([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deletingCandidaturas, setDeletingCandidaturas] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    // Detectar si el usuario puede editar la empresa
    const [canEdit, setCanEdit] = useState<boolean>(false);

    useEffect(() => {
        // Comprobar si puede editar cuando se carga la empresa y el usuario esta autenticado
        if(empresa && user){
            // ADMIN y ROOT pueden editar cualquier empresa
            if(user.role === 'ADMIN' || user.role === 'ROOT'){
                setCanEdit(true);
            }else {
                // Para usuario USER, verificar si tiene candidaturas en esta empresa
                setCanEdit(!!empresa.userHasCandidatura);
            }
        }
    }, [empresa, user]);
    
    // Cargar los datos de la empresa
    useEffect(() => {
        const fetchEmpresa = async () => {
            setLoading(true);
            try {
                // Obtener empresa con candidaturas incluidas para ADMINS
                const incluirCandidaturas = user?.role === 'ADMIN' || user?.role === 'ROOT';
                const data = await empresasService.getEmpresaById(
                    id as string, 
                    incluirCandidaturas
                );
                setEmpresa(data);

                // Si es admin y la empresa tiene candidaturas, mostrarlas directamente
                if(incluirCandidaturas && 'candidaturas' in data){
                    console.log('Candidaturas desde la respuesta empresa:', data.candidaturas);
                    setCandidaturas(data.candidaturas || []);
                }
            } catch (err:any) {
                console.error('Error al cargar empresa:', err);
                setError('Error al cargar los datos de la empresa. Por favor, intetalo de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        fetchEmpresa();
    }, [id, user]);

    // Cargar las candidaturas asociadas a esta empresa
    useEffect(() =>{
        //Solo cargar candidaturas separadamente si es un usuario normal
        //Los administradores ya reciben las candidaturas en la respuesta de la empresa
        if(!id || !empresa || user?.role === 'ADMIN' || user?.role === 'ROOT') return;

        const fetchCandidaturas = async () =>{
            setLoadingCandidaturas(true);
            try {
                // Usar el endpoint de busqueda filtrado por empresa
                const response = await candidaturasService.buscar(
                    undefined, //estado
                    empresa?.nombre, //nombre de la empresa
                    undefined, //fechaDesde
                    undefined, //fechaHasta
                    undefined, //q
                    0, //page
                    10 //size
                );

                if(response && response.content){
                    setCandidaturas(response.content);
                }
            } catch (err: any) {
                console.error('Error al cargar candidaturas:', err);
                setErrorCandidaturas('No se pudieron cargar las candidaturas asociadas a esta empresa.');
            } finally {
                setLoadingCandidaturas(false);
            }
        };

        if(empresa){
            fetchCandidaturas();
        }
    }, [id, empresa, user]);

    // Manejador para ver detalles de una candidatura
    const handleViewCandidatura = (candidaturaId: string) => {
        navigate(`/candidaturas/${candidaturaId}`);
    };

    // Función para manejar la selección de candidaturas
    const handleSelectCandidatura = (id: string) => {
        setSelectedCandidaturas(prev => {
            if(prev.includes(id)){
                return prev.filter(candidaturaId => candidaturaId !== id);
            }else{
                return [...prev, id];
            }
        });
    };

    // Función para seleccionar todas las candidaturas
    const handleSelectAllCandidaturas = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.checked){
            const allIds = candidaturas.map(candidatura => candidatura.id);
            setSelectedCandidaturas(allIds);
        }else{
            setSelectedCandidaturas([]);
        }
    };

    // Función para abrir el diálogo de confirmación de eliminación
    const handleDeleteCandidaturasConfirm = () => {
        setOpenDeleteDialog(true);
    };

    // Función para cerrar el diálogo de confirmación
    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    };

    // Función para eliminar candidaturas seleccionadas
    const handleDeleteCandidaturas = async () => {
        if(selectedCandidaturas.length === 0) return;

        setDeletingCandidaturas(true);

        try {
            await candidaturasService.deleteCandidaturasBatch(selectedCandidaturas);
            setDeleteSuccess(true);

            // Actualizar la lista de candidaturas quitando las eliminadas
            setCandidaturas(candidaturas.filter(c => !selectedCandidaturas.includes(c.id)));
            setSelectedCandidaturas([]);
        } catch (err) {
            console.error('Error al eliminar candidaturas: ', err);
            setErrorCandidaturas('Error al eliminar las candidaturas seleccionadas.');
        }finally{
            setDeletingCandidaturas(false);
            setOpenDeleteDialog(false);
        }
    };

    if(loading){
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems:'center', height: '300px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if(error){
        return (
            <Box sx={{ maxWidth: '800px', mx: 'auto', p:2 }}>
                <Alert severity='error' sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    variant="outlined"
                    onClick={() => navigate('/empresas')}
                >
                    Volver a Empresas
                </Button>
            </Box>
        );
    }

    if(!empresa){
        return(
            <Box sx={{ maxWidth: '800px', mx: 'auto', p:2 }}>
                <Alert severity="info">No se encontro la empresa solicitada</Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    variant="outlined"
                    onClick={() => navigate('/empresas')}
                    sx={{ mt:2 }}
                >
                    Volver a Empresas
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
        }}>
            <Box sx={{
                maxWidth: '800px',
                width: '100%',
                mx: 'auto',
                p: 2
            }}>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="primary"
                            onClick={() => navigate('/empresas')}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant='h4' component="h1">
                            Detalles de Empresa
                        </Typography>
                    </Box>
                    {canEdit && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/empresas/${id}/edit`)}
                        >
                            Editar Empresa
                        </Button>
                    )}
                    
                </Box>

                <Card sx={{ mb:4 }}>
                    <CardContent sx={{ p:3}}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <BusinessIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                            <Typography variant="h5" component="div">
                                {empresa.nombre}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ 
                            mt: 3, 
                            display: 'flex', 
                            flexDirection: {xs: 'column', md: 'row'}, 
                            gap: 4,
                            justifyContent: 'center' 
                            }}>
                            {/* Informacion de contacto */}
                            <Box sx={{ 
                                flex: '0 1 450px',
                                bgcolor: 'background.paper',
                                p: 3,
                                borderRadius: 2,
                                border: 1,
                                borderColor: 'divider',
                                boxShadow: 1
                                }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                                        Información de Contacto
                                    </Typography>
                                    
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body1" color="text.secondary" component="span">
                                        Correo:
                                    </Typography>
                                        &nbsp;
                                    <Typography variant="body1">
                                        {empresa.correo || 'No especificado'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ flex: 1}}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body1" color="text.secondary" component="span">
                                        Teléfono:
                                    </Typography>
                                        &nbsp;
                                    <Typography variant="body1">
                                        {empresa.telefono || 'No especificado'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Seccion de candidaturas asociadas a esta empresa */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    Candidaturas asociadas a esta empresa
                </Typography>

                {isAdmin && selectedCandidaturas.length > 0 && (
                    <Button
                        variant="outlined"
                        color='error'
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteCandidaturasConfirm}
                    >
                        Eliminar seleccionadas ({selectedCandidaturas.length})
                    </Button>
                )}
                </Box>
                

                <Paper sx={{ p: 2, mb: 4 }}>
                    {loadingCandidaturas ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py:3 }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : errorCandidaturas ?(
                        <Alert severity='error'>
                            {errorCandidaturas}
                        </Alert>
                    ) : candidaturas.length === 0 ? (
                        <Alert security='info'>
                            No hay candidaturas asociadas a esta empresa.
                        </Alert>
                    ) : (
                        <>
                            <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: 'primary.main'}}>
                                        {isAdmin && (
                                            <TableCell padding='checkbox' sx={{ color: 'white'}}>
                                                <Checkbox 
                                                    color='default'
                                                    indeterminate = {selectedCandidaturas.length > 0 && selectedCandidaturas.length < candidaturas.length}
                                                    checked = {candidaturas.length > 0 && selectedCandidaturas.length === candidaturas.length}
                                                    onChange={handleSelectAllCandidaturas}
                                                    sx={{color: 'white'}}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell align='center' sx={{ color: 'white', fontWeight: 'bold'}}>Cargo</TableCell>
                                        <TableCell align='center' sx={{ color: 'white', fontWeight: 'bold'}}>Fecha</TableCell>
                                        <TableCell align='center' sx={{ color: 'white', fontWeight: 'bold'}}>Estado</TableCell>
                                        <TableCell align='center' sx={{ color: 'white', fontWeight: 'bold'}}>Usuario</TableCell>
                                        <TableCell align='center' sx={{ color: 'white', fontWeight: 'bold'}}>Reclutador</TableCell>
                                        <TableCell align='center' sx={{ color: 'white', fontWeight: 'bold'}}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {candidaturas.map((candidatura) => (
                                        <TableRow key={candidatura.id} hover>
                                            {isAdmin && (
                                                <TableCell padding='checkbox'>
                                                    <Checkbox
                                                        checked={selectedCandidaturas.includes(candidatura.id)}
                                                        onChange={() => handleSelectCandidatura(candidatura.id)}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell align='center'>{candidatura.cargo}</TableCell>
                                            <TableCell align='center'>
                                                {new Date(candidatura.fecha).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align='center'>
                                                <Chip 
                                                    label={estadosConfig[candidatura.estado].label}
                                                    color={estadosConfig[candidatura.estado].color as ChipColor}
                                                    size='small'
                                                />
                                            </TableCell>
                                            <TableCell align='center'>
                                                {candidatura.userInfo ? (
                                                    <Tooltip title={`Usuario: ${candidatura.userInfo.username}`}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                            <PersonIcon fontSize='small' sx={{ mr: 1,color: 'primary.main', opacity: 0.7}} />
                                                            {candidatura.userInfo.username}
                                                        </Box>
                                                    </Tooltip>
                                                ) : 'N/A'}
                                            </TableCell>
                                            <TableCell align='center'>
                                                {candidatura.reclutadores && candidatura.reclutadores.length > 0 ? (
                                                    <Tooltip title={`Reclutador: ${candidatura.reclutadores[0].nombre}`}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                            <PersonIcon fontSize='small' sx={{ mr:1, color:'secondary.main', opacity: 0.7}} />
                                                            {candidatura.reclutadores[0].nombre}
                                                        </Box>
                                                    </Tooltip>
                                                ) : 'Sin reclutador'}
                                                </TableCell>
                                                <TableCell align="center">
                                                <Tooltip title="Ver detalles">
                                                    <IconButton
                                                        size='small'
                                                        onClick={() => handleViewCandidatura(candidatura.id)}
                                                    >
                                                        <VisibilityIcon fontSize='small' />
                                                    </IconButton>
                                                </Tooltip>
                                                {isAdmin && (
                                                    <Tooltip title="Eliminar candidatura">
                                                        <IconButton
                                                            size='small'
                                                            color='error'
                                                            onClick={() => {
                                                                setSelectedCandidaturas([candidatura.id]);
                                                                handleDeleteCandidaturasConfirm();
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize='small' />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Paper>
                {/* Diálogo de confirmación para eliminar candidaturas */}
                <Dialog
                    open={openDeleteDialog}
                    onClose={handleCloseDeleteDialog}
                >
                    <DialogTitle>
                        {selectedCandidaturas.length > 1
                            ? `Eliminar candidaturas seleccionadas`
                            : `Eliminar candidatura`}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {selectedCandidaturas.length > 1 
                                ? `¿Estás seguro de eliminar ${selectedCandidaturas.length} candidaturas seleccionadas? Esta acción no se puede deshacer.`
                                : `¿Estás seguro de eliminar esta candidatura? Esta acción no se puede deshacer.`}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={handleCloseDeleteDialog}
                            color='primary'
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDeleteCandidaturas}
                            color='error'
                            variant='contained'
                            disabled={deletingCandidaturas}
                        >
                            {deletingCandidaturas ? <CircularProgress size={20} /> : 'Eliminar'}
                        </Button>
                    </DialogActions>
                </Dialog>

            {/* Snackbar para éxito de eliminación */}
            <Snackbar
                open={deleteSuccess}
                autoHideDuration={3000}
                onClose={() => setDeleteSuccess(false)}
                message='Candidatura eliminada correctamente'
            />
            </Box>
        </Box>
    );
};

export default EmpresaDetail;
