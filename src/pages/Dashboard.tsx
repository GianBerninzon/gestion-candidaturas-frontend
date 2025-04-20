import { Box, Button, Card, CardContent, Chip, IconButton, LinearProgress, Pagination, Paper, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography, useTheme } from "@mui/material";
import { 
    Add as AddIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Business as BusinessIcon
 } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CandidaturaWithEmpresaDTO, EstadoCandidatura } from "@/types";
import useAuthStore from "@/store/authStore";
import candidaturasService from "@/services/candidaturasService";

// Estados con colores y etiquetas
const estadosConfig ={
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



const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pendientes: 0,
        entrevistas: 0,
        segundaEntrevista: 0,
        enProceso: 0,
        aceptadas: 0,
        rechazadas: 0,
        archivadas: 0
    });
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROOT';

    // Estados para candidaturas recientes
    const [candidaturas, setCandidaturas] = useState<CandidaturaWithEmpresaDTO[]>([]);
    const [candidaturasPage, setCandidaturasPage] = useState(0);
    const [candidaturasTotal, setCandidaturasTotal] = useState(0);
    const [candidaturasTotalPage, setCandidaturasTotalPage] = useState(0);
    const [loadingCandidaturas, setLoadingCandidaturas] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchStats = async () => {
            try{
                setLoading(true);

                let allCandidaturas;
                
                if(isAdmin){
                    // para ADMIN/ROOT, usar filtrado global para obtener todas las candidaturas
                    const response = await candidaturasService.filtrar(
                        undefined, // sin texto de búsqueda
                        undefined, // todos los usuarios
                        0,
                        1000
                    );
                    allCandidaturas = response.content;
                }else{
                    // apara usuarios normales, obtener solo sus candidaturas
                    const response = await candidaturasService.getCandidaturas(0, 1000);
                    allCandidaturas = response.content;
                }

                // Calculamos las estadísticas
                const total = allCandidaturas.length;
                const pendientes = allCandidaturas.filter(c => c.estado === EstadoCandidatura.PENDIENTE).length;
                const entrevistas = allCandidaturas.filter(c => c.estado === EstadoCandidatura.ENTREVISTA).length;
                const segundaEntrevista = allCandidaturas.filter(c => c.estado === EstadoCandidatura.SEGUNDA_ENTREVISTA).length;
                const enProceso = allCandidaturas.filter(c => c.estado === EstadoCandidatura.EN_PROCESO).length;
                const aceptadas = allCandidaturas.filter(c => c.estado === EstadoCandidatura.ACEPTADA).length;
                const rechazadas = allCandidaturas.filter(c => c.estado === EstadoCandidatura.RECHAZADA).length;
                const archivadas = allCandidaturas.filter(c => c.estado === EstadoCandidatura.ARCHIVADA).length;
                setStats({
                    total,
                    pendientes,
                    entrevistas,
                    segundaEntrevista,
                    enProceso,
                    aceptadas,
                    rechazadas,
                    archivadas
                });
            }catch (err){
                console.error('Error al cargar estadisticas', error);
                setError('No se pudieron cargar las estadisticas. Por favor, intenta de nuevo.');
            } finally{
                setLoading(false);
            }
        };

        fetchStats();
    }, [isAdmin]);

    // Cargar candidaturas recientes
    useEffect(() => {
        const fetchRecentCandidaturas = async () => {
            try {
                setLoadingCandidaturas(true);
    
                let response;
    
                if(isAdmin){
                    // Para ADMIN/ROOT, usar filtrado global con todos los usuarios
                    response = await candidaturasService.filtrar(
                        undefined, // sin texto de búsqueda
                        undefined, // todos los usuarios
                        candidaturasPage,
                        5
                    );
                }else{
                    // Para usuarios normales, obtener sus propias candidaturas
                    response = await candidaturasService.getCandidaturas(
                        candidaturasPage,
                        5,
                        undefined, // sin texto de búsqueda
                        undefined // todos los usuarios
                    );
                }
                const candidaturasData = response.content as CandidaturaWithEmpresaDTO[];
                setCandidaturas(candidaturasData);
                setCandidaturasTotal(response.totalElements);
                setCandidaturasTotalPage(response.totalPages);
            } catch (err) {
                console.error('Error al cargar candidaturas recientes', err);
                setError('No se pudieron cargar las candidaturas recientes.')
            } finally{
                setLoadingCandidaturas(false);
            }
        };
        fetchRecentCandidaturas();        
    },[isAdmin, candidaturasPage]);

    const handleCreateCandidatura = () => {
        navigate('/candidaturas/new');
    };

    const handleViewCandidatura = (id: string) => {
        navigate(`/candidaturas/${id}`);
    };

    const handleEditCandidatura = (id: string) => {
        navigate(`/candidaturas/${id}/edit`);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCandidaturasPage(page -1);
    }

    // Tarjeta de estadisticas con colores especificos
    const statCards = [
        {
            title: 'Candidaturas',
            value: stats.total,
            color: theme.palette.primary.main,
            description: isAdmin ? 'Total de candidaturas' : 'Total de tus candidaturas'
        },
        {
            title: 'Pendientes',
            value: stats.pendientes,
            color: theme.palette.warning.main,
            description: 'Candidaturas pendientes'
        },
        {
            title: 'Entrevistas',
            value: stats.entrevistas,
            color: theme.palette.info.main,
            description: 'Candidaturas con entrevistas'
        },
        {
            title: 'En proceso',
            value: stats.enProceso,
            color: theme.palette.primary.light,
            description: 'Candidaturas en proceso de evaluación'
        },
        {
            title: 'Aceptadas',
            value: stats.aceptadas,
            color: theme.palette.success.main,
            description: 'Candidaturas aceptadas'
        },
        {
            title: 'Rechazadas',
            value: stats.rechazadas,
            color: theme.palette.error.main,
            description: 'Candidaturas rechazadas'
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isAdmin ? 'Dashboard Administrativo' : 'Dashboard'}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon= {<AddIcon />}
                    onClick={handleCreateCandidatura}
                >
                    Nueva Candidatura
                </Button>
            </Box>

            {loading ? (
                <LinearProgress sx={{ my: 4 }} />
            ) : (
                <>
                    {/* Tarjetas de estadísticas */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',      // una Columna en moviles
                            sm: 'repeat(2, 1fr)', // dos columnas en tabletas
                            md: 'repeat(3, 1fr)', // tres columnas en desktops
                            lg: 'repeat(6, 1fr)', // seis columnas en desktops
                        },
                        gap: 3,
                        mb:4
                    }}>
                        {statCards.map((card) =>(
                            <Card key={card.title} elevation={2} sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="subtitle1" sx={{ color: card.color, fontWeight: 500 }}>
                                        {card.title}
                                    </Typography>
                                    <Typography variant="h3" component="div" sx={{ my: 1 }}>
                                        {card.value}
                                    </Typography>
                                    <Typography variant="body2" color= 'text.secondary'>
                                        {card.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    {/* Candidaturas recientes */}
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            {isAdmin ? 'Últimas candidaturas en el Sistema' : 'Tus Candidaturas Recientes'}
                        </Typography>
                        <Paper sx={{ p: 2 }}>
                            {loadingCandidaturas ? (
                                <LinearProgress sx={{ my: 2}} />
                            ) : candidaturas.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center'}}>
                                    No hay candidaturas recientes para mostrar.
                                </Typography>
                            ) : (
                                <>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Cargo</TableCell>
                                                <TableCell>Empresa</TableCell>
                                                <TableCell>Fecha</TableCell>
                                                <TableCell>Estado</TableCell>
                                                {isAdmin && <TableCell>Usuario</TableCell>}
                                                <TableCell align="right">Acciones</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {candidaturas.map((candidatura) => (
                                                <TableRow key={candidatura.id} hover>
                                                    <TableCell>{candidatura.cargo}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center'}}>
                                                            <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', opacity: 0.7}} />
                                                            {candidatura.empresa?.nombre || 'N/A'}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(candidatura.fecha).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={estadosConfig[candidatura.estado].label}
                                                            color={estadosConfig[candidatura.estado].color as ChipColor}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    {isAdmin && (
                                                        <TableCell>
                                                            {candidatura.userInfo?.username || 'N/A'}
                                                        </TableCell>
                                                    )}
                                                    <TableCell align="right">
                                                        <Tooltip title="Ver detalles">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleViewCandidatura(candidatura.id)}
                                                            >
                                                                <VisibilityIcon fontSize="small"/>
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Editar">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleEditCandidatura(candidatura.id)}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            </TableBody>
                                    </Table>
                                    {/* Paginación */}
                                    {candidaturasTotalPage > 1 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2}}>
                                            <Pagination 
                                                count={candidaturasTotalPage}
                                                page={candidaturasPage + 1}
                                                onChange={handlePageChange}
                                                color="primary"
                                                size="small"
                                            />
                                        </Box>
                                    )}
                                </>
                            )}
                        </Paper>
                    </Box>
                </>
            )}
            {/* Mensaje de error */}
            {error && (
                <Box sx={{ mt: 2}}>
                    <Typography variant="body2" color="error">
                        {error}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default Dashboard;