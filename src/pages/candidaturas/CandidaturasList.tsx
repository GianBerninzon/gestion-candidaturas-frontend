import { Candidatura, EstadoCandidatura } from "@/types";
import { Box, Button, Paper, TextField, Typography, MenuItem, LinearProgress, Table, TableBody, IconButton, TableContainer, TablePagination, TableHead, TableRow, TableCell, Chip } from "@mui/material";
import { 
    Add as AddIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Edit as EditIcon,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

// Datos simulados (en produccion vendrian de la API)
const mockData = [
    {
        id: '1',
        empresa: {id:'1', nombre: 'Empresa ABC', 
            correo: 'empresaabc@example.com', telefono: '123456789',
            fechaCreacion: '2022-01-01', fechaActualizacion: '2022-01-01'},
        cargo: 'Desarrollador Frontend',
        fecha: '2023-12-01',
        estado: EstadoCandidatura.ENTREVISTA,
        notas: 'Pendiente de segunda entrevista'
    },
    {
        id: '2',
        empresa: {id:'2', nombre: 'Corporacion XYZ',
            correo: 'corporacionxyz@example.com', telefono: '987654321',
            fechaCreacion: '2022-01-01', fechaActualizacion: '2022'
        },
        cargo: 'Desarrollador Backend',
        fecha: '2023-11-15',
        estado: EstadoCandidatura.ACEPTADA,
        notas: 'Candidatura aceptada'
    },
    {
        id: '3',
        empresa: {id:'3', nombre: 'Tech Solutions',
            correo: 'techsolutions@example.com', telefono: '555555555',
            fechaCreacion: '2022-01-01', fechaActualizacion: '2022'
        },
        cargo: 'DevOps Enginner',
        fecha: '2023-11-25',
        estado: EstadoCandidatura.RECHAZADA,
        notas: 'Candidatura rechazada'
    },
    {
        id: '4',
        empresa: {id:'4', nombre: 'Startup Inc',
            correo: 'startupinc@example.com', telefono: '666666666',
            fechaCreacion: '2022-01-01', fechaActualizacion: '2022'
        },
        cargo: 'Full Stack Developer',
        fecha: '2023-12-05',
        estado: EstadoCandidatura.PENDIENTE,
        notas: 'Esperando respuesta Inicial'
    },
];

const CandidaturasList = () => {
    const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filtroEstado, setFiltroEstado] = useState<String>('');
    const [filtroTexto, setFiltroTexto] = useState('');
    
    const navigate = useNavigate();

    useEffect(() => {
        // Simular carga de datos
        setTimeout(() => {
            setCandidaturas(mockData);
            setLoading(false);
        }, 1000);
    }, []);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
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

    // Filtrar candidaturas
    const candidaturasFiltradas = candidaturas.filter(candidatura => {
        const matchesEstado = filtroEstado ? candidatura.estado === filtroEstado : true;
        const matchesTexto = filtroTexto 
            ? candidatura.empresa.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) 
            : true;
        return matchesEstado && matchesEstado;
    });

    // Paginacion
    const candidaturasPaginadas = candidaturasFiltradas
     .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

     return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Candidaturas
                </Typography>
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
                <Paper sx={{p:2, mb: 3}}>
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
                    </Box>
                </Paper>

                {/* Tabla de candidaturas */}
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    {loading ? (
                        <LinearProgress />
                    ):(
                        <>
                            <TableContainer sx={{ maxHeight: 440 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Empresa</TableCell>
                                            <TableCell>Cargo</TableCell>
                                            <TableCell>Fecha</TableCell>
                                            <TableCell>Estado</TableCell>
                                            <TableCell align="right">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {candidaturasPaginadas.map((candidatura) => (
                                            <TableRow key={candidatura.id}>
                                                <TableCell>{candidatura.empresa.nombre}</TableCell>
                                                <TableCell>{candidatura.cargo}</TableCell>
                                                <TableCell>
                                                    {new Date(candidatura.fecha).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                <Chip 
                                                    label={estadosConfig[candidatura.estado].label}
                                                    color={estadosConfig[candidatura.estado].color as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                                                    size="small"
                                                />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleViewCandidatura(candidatura.id)}
                                                        title="ver Detalles"
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditCandidatura(candidatura.id)}
                                                        title="Editar"
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {candidaturasPaginadas.length === 0 && (
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
                                        count={candidaturasFiltradas.length}
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
        </Box>
     );
};

export default CandidaturasList;