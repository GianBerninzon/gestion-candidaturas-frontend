import { Candidatura, Empresa, EstadoCandidatura } from '@/types';
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
    Tooltip
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Business as BusinessIcon,
    Visibility as VisibilityIcon
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
    
    const [empresa, setEmpresa] = useState<Empresa | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado para las canidatuas asociadas
    const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
    const [loadingCandidaturas, setLoadingCandidaturas] = useState(false);
    const [errorCandidaturas, setErrorCandidaturas] = useState<string | null>(null);

    // Cargar los datos de la empresa
    useEffect(() => {
        const fetchEmpresa = async () => {
            setLoading(true);
            try {
                const data = await empresasService.getEmpresaById(id as string);
                setEmpresa(data);
            } catch (err:any) {
                console.error('Error al cargar empresa:', err);
                setError('Error al cargar los datos de la empresa. Por favor, intetalo de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        fetchEmpresa();
    }, [id]);

    // Cargar las candidaturas asociadas a esta empresa
    useEffect(() =>{
        if(!id) return;

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
    }, [id, empresa]);

    // Manejador para ver detalles de una candidatura
    const handleViewCandidatura = (candidaturaId: string) => {
        navigate(`/candidaturas/${candidaturaId}`);
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
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/empresas/${id}/edit`)}
                    >
                        Editar
                    </Button>
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
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    Candidaturas asociadas a esta empresa
                </Typography>

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
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align='center'>Cargo</TableCell>
                                        <TableCell align='center'>Fecha</TableCell>
                                        <TableCell align='center'>Estado</TableCell>
                                        <TableCell align='center'>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {candidaturas.map((candidatura) => (
                                        <TableRow key={candidatura.id} hover>
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
                                                <Tooltip title="Ver detalles">
                                                    <IconButton
                                                        size='small'
                                                        onClick={() => handleViewCandidatura(candidatura.id)}
                                                    >
                                                        <VisibilityIcon fontSize='small' />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default EmpresaDetail;
