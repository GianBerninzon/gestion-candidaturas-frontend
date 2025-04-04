import { Empresa, Reclutador, ReclutadorDTO } from "@/types";
import reclutadoresService from "@/services/reclutadoresService";
import empresasService from "@/services/empresasService";
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    LinearProgress,
    Table,
    TableBody,
    IconButton,
    TableContainer,
    TablePagination,
    TableHead,
    TableRow,
    TableCell,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    OutlinedInput,
    FormHelperText,
    MenuItem,
    Select
} from "@mui/material";
import { 
    Add as AddIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    LinkedIn as LinkedInIcon,
    Business as BusinessIcon
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";

// Datos simulados para desarrollo (en producción vendrían de la API)
const mockEmpresas: Empresa[] = [
    {
        id: '1',
        nombre: 'Empresa ABC',
        correo: 'contacto@empresaabc.com',
        telefono: '123456789',
        fechaCreacion: '2023-01-15',
        fechaActualizacion: '2023-05-20'
    },
    {
        id: '2',
        nombre: 'Corporación XYZ',
        correo: 'info@corporacionxyz.com',
        telefono: '987654321',
        fechaCreacion: '2023-02-10',
        fechaActualizacion: '2023-06-15'
    },
    {
        id: '3',
        nombre: 'Tech Solutions',
        correo: 'soporte@techsolutions.com',
        telefono: '555555555',
        fechaCreacion: '2023-03-05',
        fechaActualizacion: '2023-07-10'
    },
    {
        id: '4',
        nombre: 'Startup Inc',
        correo: 'hello@startupinc.com',
        telefono: '666666666',
        fechaCreacion: '2023-04-20',
        fechaActualizacion: '2023-08-05'
    },
    {
        id: '5',
        nombre: 'Global Enterprises',
        correo: 'info@globalenterprises.com',
        telefono: '111222333',
        fechaCreacion: '2023-05-15',
        fechaActualizacion: '2023-09-01'
    }
];

// Datos simulados de reclutadores
const mockReclutadores: Reclutador[] = [
    {
        id: '1',
        nombre: 'Ana Martínez',
        empresa: mockEmpresas[0],
        linkedinUrl: 'https://linkedin.com/in/anamartinez',
        telefono: '611222333'
    },
    {
        id: '2',
        nombre: 'Carlos López',
        empresa: mockEmpresas[1],
        linkedinUrl: 'https://linkedin.com/in/carloslopez',
        telefono: '622333444'
    },
    {
        id: '3',
        nombre: 'Elena Rodríguez',
        empresa: mockEmpresas[0],
        linkedinUrl: 'https://linkedin.com/in/elenarodriguez',
        telefono: '633444555'
    },
    {
        id: '4',
        nombre: 'Javier Sánchez',
        empresa: mockEmpresas[2],
        linkedinUrl: 'https://linkedin.com/in/javiersanchez',
        telefono: '644555666'
    },
    {
        id: '5',
        nombre: 'María González',
        empresa: mockEmpresas[3],
        linkedinUrl: 'https://linkedin.com/in/mariagonzalez',
        telefono: '655666777'
    }
];

// Interfaz para el formulario de reclutador
interface ReclutadorFormData {
    nombre: string;
    empresaId: string;
    linkedinUrl?: string;
    telefono?: string;
}

/**
 * Componente que muestra la lista de reclutadores y permite su gestión
 * Implementa funcionalidades de búsqueda, paginación y CRUD de reclutadores
 */
const ReclutadoresList = () => {
    // Estados para gestionar la lista de reclutadores
    const [reclutadores, setReclutadores] = useState<Reclutador[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroEmpresa, setFiltroEmpresa] = useState<string>('');
    
    // Estados para el diálogo de creación/edición
    const [openDialog, setOpenDialog] = useState(false);
    const [editingReclutador, setEditingReclutador] = useState<Reclutador | null>(null);
    
    const navigate = useNavigate();
    const location = useLocation();

    // Configuración del formulario con react-hook-form
    const { control, handleSubmit, reset, formState: { errors } } = useForm<ReclutadorFormData>();

    // Cargar datos al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Cargar empresas y reclutadores desde la API
                const empresasResponse = await empresasService.getEmpresas(0, 100); // Cargar todas las empresas para el selector
                const reclutadoresResponse = await reclutadoresService.getReclutadores(page, rowsPerPage, filtroTexto, filtroEmpresa);
                
                setEmpresas(empresasResponse.content);
                setReclutadores(reclutadoresResponse.content);
                setLoading(false);
                
                // Verificar si hay un ID de reclutador a editar en el estado de navegación
                const state = location.state as { editReclutadorId?: string } | null;
                if (state?.editReclutadorId) {
                    try {
                        const reclutadorToEdit = await reclutadoresService.getReclutadorById(state.editReclutadorId);
                        handleOpenDialog(reclutadorToEdit);
                        // Limpiar el estado para evitar que se abra el diálogo nuevamente al recargar
                        window.history.replaceState({}, document.title);
                    } catch (error) {
                        console.error('Error al cargar el reclutador para editar:', error);
                    }
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                setLoading(false);
            }
        };
        
        fetchData();
    }, [location, page, rowsPerPage, filtroTexto, filtroEmpresa]);

    // Gestión de paginación
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    // Refrescar datos cuando cambian los filtros
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiltroTexto(e.target.value);
    };
    
    const handleEmpresaFilterChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setFiltroEmpresa(e.target.value as string);
    };

    // Los datos ya vienen filtrados y paginados de la API
    const reclutadoresPaginados = reclutadores;

    // Gestión del diálogo de creación/edición
    const handleOpenDialog = (reclutador?: Reclutador) => {
        if (reclutador) {
            setEditingReclutador(reclutador);
            reset({
                nombre: reclutador.nombre,
                empresaId: reclutador.empresa.id,
                linkedinUrl: reclutador.linkedinUrl || '',
                telefono: reclutador.telefono || ''
            });
        } else {
            setEditingReclutador(null);
            reset({
                nombre: '',
                empresaId: '',
                linkedinUrl: '',
                telefono: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingReclutador(null);
    };

    // Guardar reclutador (crear nuevo o actualizar existente)
    const onSubmit = async (data: ReclutadorFormData) => {
        try {
            // Preparar los datos para enviar a la API
            const reclutadorDTO: ReclutadorDTO = {
                nombre: data.nombre,
                empresaId: data.empresaId,
                linkedinUrl: data.linkedinUrl || '',
                telefono: data.telefono
            };
            
            if (editingReclutador) {
                // Actualizar reclutador existente
                await reclutadoresService.updateReclutador(editingReclutador.id, reclutadorDTO);
            } else {
                // Crear nuevo reclutador
                await reclutadoresService.createReclutador(reclutadorDTO);
            }
            
            // Recargar la lista de reclutadores
            const response = await reclutadoresService.getReclutadores(page, rowsPerPage, filtroTexto, filtroEmpresa);
            setReclutadores(response.content);
            
            handleCloseDialog();
        } catch (error) {
            console.error('Error al guardar el reclutador:', error);
        }
    };

    // Eliminar reclutador
    const handleDeleteReclutador = async (id: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este reclutador?')) {
            try {
                await reclutadoresService.deleteReclutador(id);
                
                // Recargar la lista de reclutadores
                const response = await reclutadoresService.getReclutadores(page, rowsPerPage, filtroTexto, filtroEmpresa);
                setReclutadores(response.content);
            } catch (error) {
                console.error('Error al eliminar el reclutador:', error);
            }
        }
    };

    // Ver detalles del reclutador
    const handleViewReclutador = (id: string) => {
        navigate(`/reclutadores/${id}`);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Gestión de Reclutadores
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Administra la información de los reclutadores de las empresas
            </Typography>

            {/* Barra de acciones y filtros */}
            <Box sx={{ display: 'flex', mb: 3, gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    label="Buscar reclutadores"
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ flex: 2, minWidth: '200px' }}
                    value={filtroTexto}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                    }}
                />
                <FormControl 
                    size="small" 
                    sx={{ flex: 1, minWidth: '150px' }}
                >
                    <InputLabel id="empresa-filter-label">Filtrar por empresa</InputLabel>
                    <Select
                        labelId="empresa-filter-label"
                        value={filtroEmpresa}
                        label="Filtrar por empresa"
                        onChange={handleEmpresaFilterChange}
                    >
                        <MenuItem value="">
                            <em>Todas</em>
                        </MenuItem>
                        {empresas.map((empresa) => (
                            <MenuItem key={empresa.id} value={empresa.id}>
                                {empresa.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    Nuevo Reclutador
                </Button>
            </Box>

            {/* Tabla de reclutadores */}
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {loading ? (
                    <LinearProgress />
                ) : (
                    <>
                        <TableContainer sx={{ maxHeight: 440 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>Empresa</TableCell>
                                        <TableCell>Contacto</TableCell>
                                        <TableCell align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reclutadoresPaginados.map((reclutador) => (
                                        <TableRow key={reclutador.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <PersonIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                                    {reclutador.nombre}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <BusinessIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                                    {reclutador.empresa.nombre}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {reclutador.linkedinUrl && (
                                                    <Tooltip title="Perfil de LinkedIn">
                                                        <IconButton 
                                                            size="small" 
                                                            color="primary"
                                                            href={reclutador.linkedinUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <LinkedInIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Ver detalles">
                                                    <IconButton
                                                        size="small"
                                                        color="info"
                                                        onClick={() => handleViewReclutador(reclutador.id)}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleOpenDialog(reclutador)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteReclutador(reclutador.id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {reclutadoresPaginados.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                No se encontraron reclutadores
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={reclutadoresFiltrados.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Filas por página:"
                            labelDisplayedRows={({ from, to, count }) =>
                                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                            }
                            rowsPerPageOptions={[5, 10, 25]}
                        />
                    </>
                )}
            </Paper>

            {/* Diálogo para crear/editar reclutador */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingReclutador ? 'Editar Reclutador' : 'Nuevo Reclutador'}
                </DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Controller
                                name="nombre"
                                control={control}
                                rules={{ required: 'El nombre es obligatorio' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.nombre}>
                                        <InputLabel htmlFor="nombre">Nombre del reclutador</InputLabel>
                                        <OutlinedInput
                                            id="nombre"
                                            label="Nombre del reclutador"
                                            {...field}
                                        />
                                        {errors.nombre && (
                                            <FormHelperText>{errors.nombre.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                            
                            <Controller
                                name="empresaId"
                                control={control}
                                rules={{ required: 'La empresa es obligatoria' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.empresaId}>
                                        <InputLabel id="empresa-label">Empresa</InputLabel>
                                        <Select
                                            labelId="empresa-label"
                                            id="empresa"
                                            label="Empresa"
                                            {...field}
                                        >
                                            {empresas.map((empresa) => (
                                                <MenuItem key={empresa.id} value={empresa.id}>
                                                    {empresa.nombre}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.empresaId && (
                                            <FormHelperText>{errors.empresaId.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                            
                            <Controller
                                name="linkedinUrl"
                                control={control}
                                rules={{ 
                                    pattern: {
                                        value: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
                                        message: 'URL de LinkedIn inválida'
                                    }
                                }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.linkedinUrl}>
                                        <InputLabel htmlFor="linkedinUrl">URL de LinkedIn</InputLabel>
                                        <OutlinedInput
                                            id="linkedinUrl"
                                            label="URL de LinkedIn"
                                            {...field}
                                        />
                                        {errors.linkedinUrl && (
                                            <FormHelperText>{errors.linkedinUrl.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                            
                            <Controller
                                name="telefono"
                                control={control}
                                rules={{ 
                                    pattern: {
                                        value: /^[0-9]{9,}$/,
                                        message: 'Debe contener al menos 9 dígitos'
                                    }
                                }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.telefono}>
                                        <InputLabel htmlFor="telefono">Teléfono</InputLabel>
                                        <OutlinedInput
                                            id="telefono"
                                            label="Teléfono"
                                            {...field}
                                        />
                                        {errors.telefono && (
                                            <FormHelperText>{errors.telefono.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="inherit">
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            {editingReclutador ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default ReclutadoresList;