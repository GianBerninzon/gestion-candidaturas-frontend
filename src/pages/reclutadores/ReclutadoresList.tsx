import { Reclutador, ReclutadorWithEmpresaDTO } from "@/types";
import reclutadoresService from "@/services/reclutadoresService";
import {
    Box,
    Button,
    Paper,
    Typography,
    Table,
    TableBody,
    IconButton,
    TableContainer,
    TablePagination,
    TableHead,
    TableRow,
    TableCell,
    Alert,
    CircularProgress,
    Snackbar
} from "@mui/material";
import { 
    Add as AddIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Person as PersonIcon,
    LinkedIn as LinkedInIcon,
    Business as BusinessIcon
} from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

/**
 * Componente para mostrar la lista de reclutadores
 */
const ReclutadoresList: React.FC = () => {
    // Estados para gestionar la lista de reclutadores
    const [reclutadores, setReclutadores] = useState<ReclutadorWithEmpresaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [retrying, setRetrying] = useState(false);
    
    const navigate = useNavigate();
    const {user} = useAuthStore();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROOT';

    // Cargar reclutadores con paginacion
    const fetchReclutadores = async () => {
        setLoading(true);
        setError(null);


        try {
            const response = await reclutadoresService.getReclutadores(page, rowsPerPage);

            if(response && response.content){
                console.log(`Reclutadores cargados: ${response.content.length} de ${response.totalElements}`);
                setReclutadores(response.content);
                setTotalElements(response.totalElements);
            }else {
                console.warn('Respuesta vacia o sin contenido');
                setReclutadores([]);
                setTotalElements(0);
            }
        } catch (err: any) {
            console.error('Error al cargar reclutadores:', err);

            // Mensaje de error informativo
            let errorMessage = 'Error al cargar reclutadores.';

            if(err.response){
                if(err.response.status === 500) {
                    errorMessage += 'Error interno del servidor (500). Contacta con el administrador.';
                }else if(err.response.status === 403){
                    errorMessage += 'No tienes para ver estos reclutadores (403).';
                }else if(err.response.data?.message){
                    errorMessage += err.response.data.message;
                }else {
                    errorMessage += `Error ${err.response.status}: ${err.response.statusText}`;
                }
            }else if(err.request){
                errorMessage += 'No se pudo conectar con el servidor. Verifica tu conexion.';
            }else{
                errorMessage += 'Error inesperado al procesar la solicitud.';
            }

            setError(errorMessage);
            setReclutadores([]);
            setTotalElements(0);
        }finally{
            setLoading(false);
            setRetrying(false);
        }
    };

    // Cargar reclutadores al montar el componente o cambiar de paginacion
    useEffect(() => {
        fetchReclutadores();
    }, [page, rowsPerPage]);

    // Manejadores de enventos
    const handleChangePage = (_event: unknown, newPage: number) =>{
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (evt: React.ChangeEvent<HTMLInputElement>) =>{
        if(evt?.target?.value){
            setRowsPerPage(parseInt(evt.target.value, 10));
            setPage(0);
        }
    };

    const handleCreateReclutador = () => {
        navigate('/reclutadores/new');
    };

    const handleViewReclutador = (id: string) => {
        navigate(`/reclutadores/${id}`);
    };

    const handleEditReclutador = (id: string) => {
        navigate(`/reclutadores/${id}/edit`)
    };

    const handleRetry = () => {
        setRetrying(true);
        fetchReclutadores();
    };


    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '1000px',
                mx: 'auto'
            }}>
                {/* Encabezado y boton de nuevo reclutador */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    width: '100%'
                }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Reclutadores
                    </Typography>
                    {isAdmin && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleCreateReclutador}
                        >
                            Nuevo Reclutador
                        </Button>
                    )}
                </Box>

                {/* Mensaje de error */}
                {error && (
                    <Alert
                    severity="error"
                    sx={{ mb:3, width: '100%' }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleRetry}
                            disabled={retrying}
                        >
                            {retrying ? 'Reintentando...' : 'Reintentar'}
                        </Button>
                    }
                    >
                        {error}
                    </Alert>
                )}

                {/* Tabla de reclutadores */}
                <Paper sx={{ width: '100%', overflow: 'hidden', mb:3 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <TableContainer sx={{ maxHeight: 440 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">Nombre</TableCell>
                                            <TableCell align="center">Empresa</TableCell>
                                            <TableCell align="center">LinkedIn</TableCell>
                                            <TableCell align="center">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reclutadores.length > 0 ? (
                                            reclutadores.map((reclutador) => (
                                                <TableRow hover key={reclutador.id}>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <PersonIcon fontSize="small" sx={{ mr:1, color: 'primary.main', opacity: 0.7 }}/>
                                                            {reclutador.nombre}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {reclutador.empresa ? (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <BusinessIcon fontSize="small" sx={{ mr:1, color:'secondary.main', opacity: 0.7 }} />
                                                                {reclutador.empresa.nombre}
                                                            </Box>
                                                        ): (
                                                            'N/A'
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {reclutador.linkinUrl ? (
                                                            <a
                                                                href={reclutador.linkinUrl.startsWith('https') ? reclutador.linkinUrl: `http://${reclutador.linkinUrl}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0077b5', textDecoration:'none' }}
                                                            >
                                                                <LinkedInIcon fontSize="small" sx={{ mr:0.5 }} />
                                                                Perfil
                                                            </a>
                                                        ): (
                                                            'No disponible'
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewReclutador(reclutador.id)}
                                                            title="Ver Detaller"
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                        {isAdmin && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleEditReclutador(reclutador.id)}
                                                                title="Editar"
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ): (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    No se encontraron Reclutadores
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={totalElements}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Filas por pagina:"
                                labelDisplayedRows={({ from, to, count }) => 
                                    `${from}-${to} de ${count !== -1 ? count : `mas de ${to}`}`
                                }
                                rowsPerPageOptions={[5, 10, 25]}
                            />
                        </>
                    )}
                </Paper>
            </Box>

            {/* Snackbar para errores de red */}
            <Snackbar
                open={!!error && error.includes('No se pudo conectar')}
                autoHideDuration={6000}
                message="Error de conexion con el servidor"
                action={
                    <Button
                        color="secondary"
                        size="small"
                        onClick={handleRetry}
                    >
                        Reintentar
                    </Button>
                }
            />
        </Box>
    );
};

export default ReclutadoresList;