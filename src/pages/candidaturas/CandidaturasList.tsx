import { Candidatura, CandidaturaWithEmpresaDTO, EstadoCandidatura } from "@/types";
import { Box, Button, Paper, TextField, Typography, MenuItem, Table, TableBody, IconButton, TableContainer, TablePagination, TableHead, TableRow, TableCell, Chip, Alert, CircularProgress, Snackbar, Container, Dialog, DialogTitle, DialogContentText, DialogContent, Checkbox, DialogActions } from "@mui/material";
import { 
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    Delete as DeleteIcon,

} from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import candidaturasService from "@/services/candidaturasService";
import useAuthStore from "@/store/authStore";

// Estados con colores y etiquetas
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

const CandidaturasList: React.FC = () => {
    const [candidaturas, setCandidaturas] = useState<CandidaturaWithEmpresaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filtroEstado, setFiltroEstado] = useState<string>('');
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroUsuario, setFiltroUsuario] = useState('');
    const [totalElements, setTotalElements] = useState(0);
    const [retrying, setRetrying] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    
    const navigate = useNavigate();
    const isDev = import.meta.env.DEV;
    const {user} = useAuthStore();

    // Verificar si el usuario es administrador
    const isAdmin = user && user.role && user.role === 'ADMIN';

    // Cargar candidaturas utilizando el servicio
    const fetchCandidaturas = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log(`Cargando candidaturas (pagina ${page}, tamaño ${rowsPerPage})`);

            let response;

            // Si es administrador y hay filtros, usamos el endpoint de filtrado avanzado
            if(isAdmin){
                console.log('Usando endpoint de filtrado avanzado para admin');
                response = await candidaturasService.filtrar(
                    filtroTexto,
                    filtroUsuario,
                    page,
                    rowsPerPage
                );
            }else if(filtroEstado || filtroTexto){
                // Si hay filtros normales, usamos el endpoint de busqueda estandar
                response = await candidaturasService.getCandidaturas(
                    page,
                    rowsPerPage,
                    filtroEstado,
                    filtroTexto
                );
            }else{
                // si no hay filtros, usamos el endpoint principal
                response = await candidaturasService.getCandidaturas(
                    page,
                    rowsPerPage
                );
            }

            console.log('Estructura de las candidaturas recibidas:', JSON.stringify(response.content[0], null, 2));

            if(response && response.content){
                console.log(`Candidaturas cargadas: ${response.content.length} de ${response.totalElements}`);
                setCandidaturas(response.content as CandidaturaWithEmpresaDTO[]);
                setTotalElements(response.totalElements);
            }else{
                console.warn(`Respuesta vacia o sin contenido`);
                setCandidaturas([] as CandidaturaWithEmpresaDTO[]);
                setTotalElements(0);
            }
        } catch (err: any) {
            console.error(`Error al cargar candidaturas:`, err)

            // Mensaje de error mas informatico
            let errorMessage = `Erro al cargar candidaturas.`;

            if(err.response){
                // Error con respuesta del servidor
                if(err.response.status === 500){
                    errorMessage += 'Error interno del servidor (500). Contacta con el administrador.';
                } else if(err.response.status === 403){
                    errorMessage += 'No tienes permiso para ver estas candidaturas (403).';
                }else if(err.response.data?.message){
                    errorMessage += err.response.data.message;
                }else{
                    errorMessage += `Error ${err.response.status}: ${err.response.statusText}`;
                }
            }else if(err.request){
                // Error sin respuesta del servidor
                errorMessage += 'No se pudo conectar con el servidor. Verifica tu conexion';
            }else{
                errorMessage += 'Error inesperado al procesar la solicitud';
            }

            setError(errorMessage);
            setCandidaturas([]);
            setTotalElements(0);
        }finally{
            setLoading(false);
            setRetrying(false);
        }
    };

    // Cargar candidaturas al montar el componente o cambiar filtros/paginacion
    useEffect(() => {
        fetchCandidaturas();
    }, [page, rowsPerPage, filtroEstado, filtroTexto, filtroUsuario]);

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

    const handleCreateCandidatura = () => {
        navigate('/candidaturas/new');
    };

    const handleViewCandidatura = (id: string) => {
        navigate(`/candidaturas/${id}`);
    };

    const handleEditCandidatura = (id: string) => {
        navigate(`/candidaturas/${id}/edit`);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.checked){
            const newSelected = candidaturas.map((c) => c.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClickCheckBox = (id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];

        if(selectedIndex === -1){
            newSelected = [...selected, id];
        }else {
            newSelected = selected.filter(item => item !== id);
        }

        setSelected(newSelected);
    };

    const isSelected = (id: string) => selected.indexOf(id) !== -1;

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };

    const handleDeleteSelected = () => {
        if(selected.length > 0){
            setDeleteId(null);
            setOpenDeleteDialog(true);
        }
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        try {
         setLoading(true);
         if(deleteId){
            // Eliminar una sola candidatura
            await candidaturasService.deleteCandidatura(deleteId);
            setCandidaturas(candidaturas.filter(c=> c.id !== deleteId));
         }else if(selected.length > 0){
            //Eliminar multiples candidaturas
            const result = await candidaturasService.deleteCandidaturasBatch(selected);
            console.log('Candidaturas eliminadas:', result);

            // Actualizamos el estado local
            setCandidaturas(candidaturas.filter(c=> !selected.includes(c.id)));
            setSelected([]);
         }
         setDeleteSuccess(true);
         setOpenDeleteDialog(false);
         // Refrescar la lista para mantener la paginacion correcta
         fetchCandidaturas();
        } catch (err: any) {
            console.error('Error al eliminar candidatura(s):', err);
            setError(`Error al eliminar: ${err.message || 'Hubo un problema al procesar la solicitud'}`);
        }finally{
            setLoading(false);
        }
    };

    const handleRetry = () => {
        setRetrying(true);
        fetchCandidaturas();
    };

    // Limpiar filtros
    const handleClearFilters = () => {
        setFiltroEstado('');
        setFiltroTexto('');
        setFiltroUsuario('');
        setPage(0);
    };

    //Funcion para mostrar el nombre de la empresa con fallback a N/A
    const renderEmpresaNombre = (candidatura: Candidatura) => {
        // Si existe empresa con nombre no vacio, mostrarlo
        if(candidatura.empresa?.nombre && candidatura.empresa.nombre !== 'N/A'){
            return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon fontSize="small" sx={{ mr:1, color: 'text.secondary', opacity:0.7 }} />
                    {candidatura.empresa.nombre}
                </Box>
            );
        }

        return (
            <Typography variant="body2" color="text.secondary">
                N/A
            </Typography>
        );
    };

     return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center'}}>
            <Container maxWidth="lg" sx={{ p: 3 }}>
            {/* Encabezado y boton de nueva candidatura */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Candidaturas
                </Typography>
                <Box>
                    {isAdmin && selected.length > 0 && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDeleteSelected}
                            sx={{mr:2}}
                        >
                            Eliminar ({selected.length})
                        </Button>
                    )}
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateCandidatura}
                >
                    Nueva Candidatura
                </Button>
                </Box>

                {/* Filtros */}
                <Paper sx={{
                    p:2, 
                    mb: 3,
                    width: '100%',
                    maxWidth: '900px',
                    mx: 'auto'
                }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap:'wrap'}}>
                        <TextField
                            label="Buscar"
                            variant="outlined"
                            size="small"
                            value={filtroTexto}
                            onChange={(e) => setFiltroTexto(e.target.value)}
                            sx={{flexGrow: 1, minWidth: '200px'}}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{mr: 1, color: 'text.secondary'}}/>,
                            }}
                        />

                        {/* Campo para filtrar por usuario (solo administradores) */}
                        {isAdmin && (
                            <TextField
                                label="Usuario"
                                variant="outlined"
                                size="small"
                                value={filtroUsuario}
                                onChange={(e) => setFiltroUsuario(e.target.value)}
                                placeholder="ID o nombre de usuario"
                                sx={{ minWidth: '200px'}}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{mr: 1, color: 'text.secondary'}}/>,
                                }}
                            />
                        )}

                        <TextField
                            select
                            label="Estado"
                            variant="outlined"
                            size="small"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            sx={{minWidth: '200px'}}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {Object.values(EstadoCandidatura).map((estado) =>(
                                <MenuItem key={estado} value={estado}>
                                    {estadosConfig[estado].label}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Boton para limpiar filtros */}
                        {(filtroTexto || filtroEstado || filtroUsuario) && (
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

                {/* Mensaje de error */}
                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 3, maxWidth: '900px', mx: 'auto'}}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={handleRetry}
                                startIcon={<RefreshIcon />}
                                disabled={retrying}
                            >
                                {retrying ? 'Reintentando...' : 'Reintentar'}
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                )}

                {/* Tabla de candidaturas */}
                <Paper sx={{ 
                    width: '100%', 
                    overflow: 'hidden',
                    maxWidth: '900px',
                    mx: 'auto'
                }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py:4}}>
                            <CircularProgress />
                        </Box>
                    ):(
                        <>
                            <TableContainer sx={{ maxHeight: 440 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            {isAdmin && (
                                                <TableCell padding="checkbox">
                                                    <Checkbox 
                                                        indeterminate={selected.length > 0 && selected.length < candidaturas.length}
                                                        checked={candidaturas.length > 0 && selected.length === candidaturas.length}
                                                        onChange={handleSelectAllClick}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell align="center">Empresa</TableCell>
                                            <TableCell align="center">Cargo</TableCell>
                                            <TableCell align="center">Fecha</TableCell>
                                            <TableCell align="center">Estado</TableCell>
                                            {isAdmin && (
                                                <TableCell align="center">Usuario</TableCell>
                                            )}
                                            <TableCell align="center">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {candidaturas.length > 0 ? (
                                            candidaturas.map((candidatura) => {
                                                const isItemSelected = isSelected(candidatura.id);
                                                return (
                                                    <TableRow 
                                                        hover 
                                                        key={candidatura.id}
                                                        selected={isItemSelected}
                                                    >
                                                        {isAdmin && (
                                                            <TableCell padding="checkbox">
                                                                <Checkbox
                                                                    checked={isItemSelected}
                                                                    onClick={() => handleClickCheckBox(candidatura.id)}
                                                                />
                                                            </TableCell>
                                                        )}
                                                        <TableCell>
                                                            {renderEmpresaNombre(candidatura)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box
                                                                component="span"
                                                                sx={{
                                                                    cursor: 'pointer',
                                                                    '&:hover':{
                                                                        textDecoration: 'underline',
                                                                        color: 'primary.main'
                                                                    }
                                                                }}
                                                                onClick={() => handleViewCandidatura(candidatura.id)}
                                                            >
                                                                {candidatura.cargo}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(candidatura.fecha).toLocaleString()}
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
                                                                {candidatura.userInfo ? (
                                                                <Box sx={{ display: 'flex', alignItems: 'center'}}>
                                                                    <PersonIcon fontSize="small" sx={{ mr:1, color: 'text.secondary', opacity: 0.7}} />
                                                                    {candidatura.userInfo.username}
                                                                </Box>
                                                                ) :(
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Usuario no disponible
                                                                    </Typography>
                                                                )}
                                                            </TableCell>
                                                        )}
                                                        <TableCell align="right">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleEditCandidatura(candidatura.id)}
                                                                title="Editar"
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteClick(candidatura.id)}
                                                                title="Eliminar"
                                                                color="error"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                </TableRow>
                                        )})
                                    ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    No se encontraron candidaturas
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
                                        rowsPerPageOptions={[5,10,25]}
                            />
                        </>
                    )}
                </Paper>

                {/* Daialog de confirmacion para eliminar */}
                <Dialog
                    open={openDeleteDialog}
                    onClose={handleCloseDeleteDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        ¿Eliminar candidatura?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {deleteId
                                ? "Estas seguro de eliminar esta candidatura? Esta accion no se puede deshacer"
                                : `¿Estas seguro de eliminar ${selected.length} candidaturas seleccionadas? Esta accion no se puede deshacer`
                            }
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteDialog} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmDelete} color="error" autoFocus>
                            Eliminar
                        </Button>
                    </DialogActions>
                </Dialog>

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
        </Container>
        </Box>
     );
};

export default CandidaturasList;