import { Empresa } from "@/types";
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
    FormHelperText
} from "@mui/material";
import { 
    Add as AddIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
    Phone as PhoneIcon
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";

// Datos simulados para desarrollo (en producción vendrían de la API)
const mockData: Empresa[] = [
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

// Interfaz para el formulario de empresa
interface EmpresaFormData {
    nombre: string;
    correo: string;
    telefono: string;
}

/**
 * Componente que muestra la lista de empresas y permite su gestión
 * Implementa funcionalidades de búsqueda, paginación y CRUD de empresas
 */
const EmpresasList = () => {
    // Estados para gestionar la lista de empresas
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filtroTexto, setFiltroTexto] = useState('');
    
    // Estados para el diálogo de creación/edición
    const [openDialog, setOpenDialog] = useState(false);
    const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
    
    const navigate = useNavigate();

    // Configuración del formulario con react-hook-form
    const { control, handleSubmit, reset, formState: { errors } } = useForm<EmpresaFormData>();

    // Cargar datos al montar el componente
    useEffect(() => {
        // Simulación de carga de datos (reemplazar por llamada a API)
        setTimeout(() => {
            setEmpresas(mockData);
            setLoading(false);
        }, 1000);
    }, []);

    // Gestión de paginación
    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Filtrar empresas según texto de búsqueda
    const empresasFiltradas = empresas.filter(empresa => 
        empresa.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        empresa.correo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        empresa.telefono.includes(filtroTexto)
    );

    // Aplicar paginación a los resultados filtrados
    const empresasPaginadas = empresasFiltradas.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Gestión del diálogo de creación/edición
    const handleOpenDialog = (empresa?: Empresa) => {
        if (empresa) {
            setEditingEmpresa(empresa);
            reset({
                nombre: empresa.nombre,
                correo: empresa.correo,
                telefono: empresa.telefono
            });
        } else {
            setEditingEmpresa(null);
            reset({
                nombre: '',
                correo: '',
                telefono: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingEmpresa(null);
    };

    // Guardar empresa (crear nueva o actualizar existente)
    const onSubmit = (data: EmpresaFormData) => {
        if (editingEmpresa) {
            // Actualizar empresa existente
            const updatedEmpresas = empresas.map(emp => 
                emp.id === editingEmpresa.id 
                    ? { ...emp, ...data, fechaActualizacion: new Date().toISOString().split('T')[0] }
                    : emp
            );
            setEmpresas(updatedEmpresas);
        } else {
            // Crear nueva empresa
            const newEmpresa: Empresa = {
                id: `${Date.now()}`, // Generar ID temporal (en producción lo generaría el backend)
                ...data,
                fechaCreacion: new Date().toISOString().split('T')[0],
                fechaActualizacion: new Date().toISOString().split('T')[0]
            };
            setEmpresas([...empresas, newEmpresa]);
        }
        handleCloseDialog();
    };

    // Eliminar empresa
    const handleDeleteEmpresa = (id: string) => {
        // En producción, confirmar antes de eliminar y llamar a la API
        const updatedEmpresas = empresas.filter(emp => emp.id !== id);
        setEmpresas(updatedEmpresas);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Gestión de Empresas
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Administra la información de las empresas para tus candidaturas
            </Typography>

            {/* Barra de acciones */}
            <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
                <TextField
                    label="Buscar empresas"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nueva Empresa
                </Button>
            </Box>

            {/* Tabla de empresas */}
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
                                        <TableCell>Correo</TableCell>
                                        <TableCell>Teléfono</TableCell>
                                        <TableCell>Fecha Creación</TableCell>
                                        <TableCell align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {empresasPaginadas.map((empresa) => (
                                        <TableRow key={empresa.id} hover>
                                            <TableCell>{empresa.nombre}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                                    {empresa.correo}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                                    {empresa.telefono}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(empresa.fechaCreacion).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Ver detalles">
                                                    <IconButton
                                                        size="small"
                                                        color="info"
                                                        onClick={() => navigate(`/empresas/${empresa.id}`)}  // Navegar a la página de detalles
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleOpenDialog(empresa)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteEmpresa(empresa.id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {empresasPaginadas.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                No se encontraron empresas
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={empresasFiltradas.length}
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

            {/* Diálogo para crear/editar empresa */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingEmpresa ? 'Editar Empresa' : 'Nueva Empresa'}
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
                                        <InputLabel htmlFor="nombre">Nombre de la empresa</InputLabel>
                                        <OutlinedInput
                                            id="nombre"
                                            label="Nombre de la empresa"
                                            {...field}
                                        />
                                        {errors.nombre && (
                                            <FormHelperText>{errors.nombre.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                            
                            <Controller
                                name="correo"
                                control={control}
                                rules={{ 
                                    required: 'El correo es obligatorio',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Correo electrónico inválido'
                                    }
                                }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.correo}>
                                        <InputLabel htmlFor="correo">Correo electrónico</InputLabel>
                                        <OutlinedInput
                                            id="correo"
                                            label="Correo electrónico"
                                            {...field}
                                        />
                                        {errors.correo && (
                                            <FormHelperText>{errors.correo.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                            
                            <Controller
                                name="telefono"
                                control={control}
                                rules={{ 
                                    required: 'El teléfono es obligatorio',
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
                            {editingEmpresa ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default EmpresasList;