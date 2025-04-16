import { Empresa } from "@/types";
import {
    Box,
    Button,
    Paper,
    TextField,
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
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Business as BusinessIcon
} from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import empresasService from "@/services/empresasService";

/**
 * Componente que muestra la lista de empresas y permite su gestión
 * Implementa funcionalidades de búsqueda, paginación y CRUD de empresas
 */
const EmpresasList: React.FC = () => {
    console.log('EmpresasList - Inicio del renderizado');
    // Estados para gestionar la lista de empresas
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [totalElements, setTotalElements] = useState(0);
    const [retrying, setRetrying] = useState(false);
    
    const navigate = useNavigate();
    const isDev = import.meta.env.DEV;

    // Cargar empresas con paginacion y filtros
    const fetchEmpresas = async () => {
        console.log('EmpresasList - Cargar empresas');
        setLoading(true);
        setError(null);

        try {
            let response;

            // Si hay un filtro de nombre, usamos el endpoint de busqueda
            if(filtroNombre){
                response = await empresasService.buscarPorNombre(
                    filtroNombre,
                    page,
                    rowsPerPage
                );
            } else{
                // De lo contrario, obtenemos todas las empresas
                response = await empresasService.getEmpresas(
                    page,
                    rowsPerPage
                );
            }

            if(response && response.content){
                console.log(`Empresas cargadas: ${response.content.length} de ${response.totalElements}`);
                setEmpresas(response.content);
                setTotalElements(response.totalElements);
            }else{
                console.warn('Respuesta vacia o sin contenido');
                setEmpresas([]);
                setTotalElements(0);
            }
        } catch (err: any) {
            console.error('Error al cargar empresas:', err);

            // Mensaje de error informativo
            let errorMessage = 'Error al cargar empresas';

            if(err.response){
                if(err.response.status === 500){
                    errorMessage += 'Error interno del servidor (500). Contacta con el administrador.';
                }else if(err.response.status === 403){
                    errorMessage += 'No tienes permisos para ver estas empresas (403).';
                }else if(err.response.data?.message){
                    errorMessage += err.response.data.message;
                }else {
                    errorMessage += `Error ${err.response.status}: ${err.response.statusText}`;
                }
            }else if(err.request){
                errorMessage += 'No se pudo conectar con el servidor. Verifica tu conexion.';
            }else {
                errorMessage += 'Error inesperado al procesar la solicitud.';
            }

            setError(errorMessage);
            setEmpresas([]);
            setTotalElements(0);
        }finally{
            setLoading(false);
            setRetrying(false);
        }
    };

    // Cargar empresas al montar el componente o cambiar filtros/paginacion
    useEffect(() => {
        console.log('EmpresasList - useEffect');
        fetchEmpresas();
    }, [page, rowsPerPage, filtroNombre]);

    // Manejadores de eventos
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (evt: React.ChangeEvent<HTMLInputElement>) => {
        if(evt?.target?.value){
            setRowsPerPage(parseInt(evt.target.value, 10));
            setPage(0);
        }
    };

    const handleCreateEmpresa = () => {
        navigate('/empresas/new');
    };

    const handleViewEmpresa = (id: string) => {
        navigate(`/empresas/${id}`);
    };

    const handleEditEmpresa = (id: string) => {
        navigate(`/empresas/${id}/edit`);
    };

    const handleRetry = () => {
        setRetrying(true);
        fetchEmpresas();
    };

    // Limpiar filtros
    const handleClearFilters = () => {
        setFiltroNombre('');
        setPage(0);
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
                {/* Encabezado y boton de nueva empresa */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    width: '100%'
                }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Empresas
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleCreateEmpresa}
                    >
                        Nueva Empresa
                    </Button>
                </Box>

                {/* Filtros */}
                <Paper sx={{
                    p:2,
                    mb:3,
                    width: '100%'
                }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                        label="Buscar por nombre"
                        variant="outlined"
                        size="small"
                        value={filtroNombre}
                        onChange={(e) => setFiltroNombre(e.target.value)}
                        sx={{ flexGrow: 1, minWidth: '200px'}}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr:1, color: 'text.secondary' }} />,
                        }}
                    />

                    {/* Boton para limpiar filtros */}
                    {filtroNombre && (
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleClearFilters}
                        >
                            Limpiar Filtros
                        </Button>
                    )}
                    </Box>
                </Paper>

                {/* Mensaje de erro */}
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

                {/* Tabla de empresas */}
                <Paper sx={{ width: '100%', overflow: 'hidden', mb:3 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py:4 }}>
                            <CircularProgress />
                        </Box>
                    ): (
                        <>
                            <TableContainer sx={{ maxHeight: 440 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">Nombre</TableCell>
                                            <TableCell align="center">Correo</TableCell>
                                            <TableCell align="center">Telefono</TableCell>
                                            <TableCell align="center">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {empresas.length > 0 ? (
                                            empresas.map((empresa) => (
                                                <TableRow hover key={empresa.id}>
                                                    <TableCell align="center">
                                                        <Box sx={{ 
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                         }}>
                                                            <BusinessIcon
                                                                fontSize="small"
                                                                sx={{ mr:1, color: 'primary.main', opacity: 0.7 }}
                                                            />
                                                            {empresa.nombre}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">{empresa.correo || 'N/A'}</TableCell>
                                                    <TableCell align="center">{empresa.telefono || 'N/A'}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewEmpresa(empresa.id)}
                                                            title="Ver detalles"
                                                        >
                                                            <VisibilityIcon fontSize="small"/>
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditEmpresa(empresa.id)}
                                                            title="Editar"
                                                        >
                                                            <EditIcon fontSize="small"/>
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    No se encontraron empresas
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
                                labelRowsPerPage="Filas por página"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}-${to} de ${count !== -1 ? count : `mas de ${to}`}`
                                }
                                rowsPerPageOptions={[5, 10, 25]}
                            />
                        </>
                    )}
                </Paper>
            </Box>

            {/* SnackBar para errores de red */}
            <Snackbar
                open={!!error && error.includes('No se pudo conectar')}
                autoHideDuration={6000}
                message='Error de conexion con el servidor'
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

export default EmpresasList;