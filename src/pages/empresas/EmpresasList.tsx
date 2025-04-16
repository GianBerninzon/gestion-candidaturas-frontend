import empresasService from "@/services/empresasService";
import { Empresa } from "@/types";
import {
    Add as AddIcon,
    Business as BusinessIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    Delete as DeleteIcon,
    Check as CheckIcon
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

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

    //Estados para selección múltiple y eliminación
    const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deletingMultiple, setDeletingMultiple] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);


    const navigate = useNavigate();
    const isDev = import.meta.env.DEV;
    const user = useAuthStore(state => state.user);
    const isAdmin = user?.role === 'ADMIN' || user?.role == 'ROOT';

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

    // Funcion para manejar la seleccion de empresas
    const handleSelectEmpresa = (id: string) =>{
        setSelectedEmpresas(prev => {
            if(prev.includes(id)){
                return prev.filter(empresaId  => empresaId  !== id);
            }else{
                return [...prev, id];
            }
        })
    };

    // Función para seleccionar o deseleccionar todas las empresas
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.checked){
            const allIds = empresas.map(empresa => empresa.id);
            setSelectedEmpresas(allIds);
        }else{
            setSelectedEmpresas([]);
        }
    };

    // Abrir diálogo de confirmación para eliminar una empresa
    const handleDeleteConfirm = (id: string) => {
        setDeleteId(id);
        setDeletingMultiple(false);
        setOpenDeleteDialog(true);
    };

    // Abrir diálogo de confirmación para eliminar múltiples empresas
    const handleDeleteMultipleConfirm = () => {
        setDeletingMultiple(true);
        setOpenDeleteDialog(true);
    };

    // Cerrar diálogo de confirmación
    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setDeleteId(null);
    };

    // Eliminar empresa
    const handleDeleteEmpresa = async () => {
        try {
            if (deletingMultiple) {
                // Eliminar múltiples empresas
                await empresasService.deleteEmpresasBatch(selectedEmpresas);
                setSelectedEmpresas([]);
            }else if(deleteId){
                // Eliminar una sola empresa
                await empresasService.deleteEmpresa(deleteId);
            }

            setDeleteSuccess(true);
            fetchEmpresas();
        } catch (error) {
            console.error('Error al eliminar empresa:', error);
            setError('Error al eliminar empresa(s). Inténtelo de nuevo.');
        } finally {
            setOpenDeleteDialog(false);
            setDeleteId(null);
        }
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

        <Box sx={{ with:'100%'}}>
            <Box
                sx={{
                    display:'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width:'100%',
                    maxWidth:'100%',
                    mx: 'auto',
                    p: 2
                }}>
                    {/* Encabezado y acciones */}
                    <Box sx={{
                        display:'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb:3,
                        width:'100%',
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Typography variant="h4" component="h1">
                            Empresas
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1}}>
                            {isAdmin && selectedEmpresas.length > 0 && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDeleteMultipleConfirm}
                                >
                                    Eliminar seleccionadas ({selectedEmpresas.length})
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleCreateEmpresa}
                            >
                                Nueva empresa
                            </Button>
                        </Box>
                    </Box>

                    {/* Filtros */}
                    <Paper sx={{
                        p:2,
                        mb:3,
                        width:'100%'
                    }}>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                            <TextField 
                                label="Buscar por nombre"
                                variant="outlined"
                                size="small"
                                value={filtroNombre}
                                onChange={(e) => setFiltroNombre(e.target.value)}
                                sx={{ flexGrow: 1, minWidth: '200px'}}
                                inputProps={{
                                    startAdornment: <SearchIcon sx={{ mr:1, color: 'text.secondary'}} />,
                                }}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleClearFilters}
                            >
                                Limpiar filtros
                            </Button>
                        </Box>
                    </Paper>

                    {/* Mensaje de error */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 3, width: '100%' }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Indicador de carga */}
                    {loading ? (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                            p: 4
                        }}>
                            <CircularProgress />
                        </Box>
                    ): (
                        <>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: 'primary.main'}}>
                                            {isAdmin && (
                                                <TableCell padding="checkbox" sx={{ color: 'white'}}>
                                                    <Checkbox 
                                                        color="default"
                                                        indeterminate={selectedEmpresas.length > 0 && selectedEmpresas.length < empresas.length}
                                                        checked={empresas.length > 0 && selectedEmpresas.length === empresas.length}
                                                        onChange={handleSelectAll}
                                                        sx={{ color: 'white' }}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell align="left" sx={{ color: 'white', fontWeight: 'bold'}}>Nombre</TableCell>
                                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold'}}>Email</TableCell>
                                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold'}}>Teléfono</TableCell>
                                            <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold'}}>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {empresas.length > 0 ? (
                                            empresas.map((empresa) => (
                                                <TableRow key={empresa.id} hover>
                                                    {isAdmin && (
                                                        <TableCell padding="checkbox">
                                                            <Checkbox 
                                                                checked={selectedEmpresas.includes(empresa.id)}
                                                                onChange={() => handleSelectEmpresa(empresa.id)}
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                cursor: 'pointer',
                                                                '&: hover': { textDecoration: 'underline', color: 'primary.main' }
                                                            }}
                                                            onClick={() => handleViewEmpresa(empresa.id)}
                                                        >
                                                            <BusinessIcon 
                                                                fontSize="small"
                                                                sx={{ mr: 1, color: 'primary.main', opacity: 0.7 }}
                                                            />
                                                            {empresa.nombre}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">{empresa.correo || 'N/A'}</TableCell>
                                                    <TableCell align="center">{empresa.telefono || 'N/A'}</TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="Editar empresa">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleEditEmpresa(empresa.id)}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {isAdmin && (
                                                            <Tooltip title="Eliminar empresa">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDeleteConfirm(empresa.id)}
                                                                    color="error"
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={isAdmin ? 5 : 4} align="center">
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
                                labelDisplayedRows={({ from, to, count}) =>
                                    `${from}-${to} de ${count !== -1 ? count : `mas de ${to}`}`
                            }
                            />
                        </>
                    )}

                    {/* Snackbar para errores de red */}
                    <Snackbar
                        open={!!error && error.includes('No se pudo conectar')}
                        autoHideDuration={6000}
                        message="Error de conexión con el servidor"
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

                    {/* Snackbar para exito de eliminación */}
                    <Snackbar
                        open={deleteSuccess}
                        autoHideDuration={3000}
                        onClose={() => setDeleteSuccess(false)}
                        message="Empresa(s) eliminada(s) exitosamente"
                    />

                    {/* Dialogo de confirmación para eliminar */}
                    <Dialog
                        open={openDeleteDialog}
                        onClose={handleCloseDeleteDialog}
                    >
                        <DialogTitle>
                            {deletingMultiple ? "Eliminar empresas seleccionadas" : "Eliminar empresa"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                {deletingMultiple
                                    ? `¿Estás seguro de eliminar las ${selectedEmpresas.length} empresas seleccionadas? Esta acción no se puede deshacer.`
                                    : `¿Estás seguro de eliminar esta empresa? Esta acción no se puede deshacer.`
                                }
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDeleteDialog} color="primary">
                                Cancelar
                            </Button>
                            <Button onClick={handleDeleteEmpresa} color="error" variant="contained">
                                Eliminar
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
        </Box>
    );
        
};

export default EmpresasList;