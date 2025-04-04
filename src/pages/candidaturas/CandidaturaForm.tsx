import { CandidaturaDTO, Empresa, EstadoCandidatura } from "@/types";
import { 
    Alert, Button, CircularProgress, Paper, Typography,
    Autocomplete, 
    TextField,
    Divider,
    MenuItem,
    DialogContent,
    DialogActions,
    Dialog,
    DialogTitle,
    Chip
} from "@mui/material";
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    Business as BusinessIcon
} from "@mui/icons-material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

// Estados con colores y etiquetas
const estadosConfig = {
    [EstadoCandidatura.PENDIENTE]: {color: 'warning', label: 'Pendiente'},
    [EstadoCandidatura.ENTREVISTA]: {color: 'info', label: 'Entrevista'},
    [EstadoCandidatura.SEGUNDA_ENTREVISTA]: {color: 'info', label: 'Segunda Entrevista'},
    [EstadoCandidatura.EN_PROCESO]: {color:'primary', label: 'En Proceso'},
    [EstadoCandidatura.ACEPTADA]: {color: 'success', label: 'Aceptada'},
    [EstadoCandidatura.RECHAZADA]: {color: 'error', label: 'Rechazada'},
    [EstadoCandidatura.ARCHIVADA]: {color: 'error', label: 'Cancel'}
};

//Datos mock para pruebas
const mockEmpresas =[
    {
        id: '1',
        nombre: 'Empresa ABC',
        correo: 'empresa@abc.com',
        telefono: '123456789',
        fechaCreacion: '2022-01-01',
        fechaActualizacion: '2022-01-01',
    },
    {
        id: '2',
        nombre: 'Corporacion XYZ',
        correo: 'corporacion@xyz.com',
        telefono: '987654321',
        fechaCreacion: '2022-01-01',
        fechaActualizacion: '2022-01-01'
    },
    {
        id: '3',
        nombre: 'Tech Solutions',
        correo: 'tech@solution.com',
        telefono: '555555555',
        fechaCreacion: '2022-01-01',
        fechaActualizacion: '2022-01-01'
    }
];

const mockCandidaturas = {
    id: '1',
    empresaId: '1',
    cargo: 'Desarrollador FrontEnd',
    fecha: '2022-01-01',
    estado: EstadoCandidatura.ENTREVISTA,
    notas: 'Pendiente de segunda entrevista'
};

//Interfaz para los datos del formulario de empresa
interface EmpresaFormData{
    nombre: string;
    correo: string;
    telefono: string;
}

interface EmpresaFormData{
    nombre: string;
    correo: string;
    telefono: string;
}

const CandidaturaForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [openNuevaEmpresa, setOpenNuevaEmpresa] = useState(false);

    // Form para la candidatura principal
    const {control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CandidaturaDTO>({
        defaultValues: {
            empresaId: '',
            cargo: '',
            fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
            estado: EstadoCandidatura.PENDIENTE,
            notas: ''
        }
    });

    // Form para nueva empresa (dialogo)
    const { control: controlEmpresa, handleSubmit: handleSubmitEmpresa, reset: resetEmpresa } = useForm<EmpresaFormData>({
        defaultValues: {
            nombre: '',
            correo: '',
            telefono: ''
        }
    });

    //Cargar los datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // En un entrorno real hariamos estas a la API
                // const empresasResponse = await apiService.get('/api/empresas');
                // setEmpresa(empresasResponse);

                // Simulacion con datos mock
                setTimeout(() => {
                    setEmpresas(mockEmpresas);

                    // Si es edicion, cargar datos de la candidatura
                    if (id) {
                        // const cadidaturaResponse = await apiService.get(`/api/candidaturas/${id}`);
                        // const candidaturaData = candidaturaResponse;

                        // Simular carga de candidatura para edicion
                        const candidaturaData = mockCandidaturas;
                        reset({
                            empresaId: candidaturaData.empresaId,
                            cargo: candidaturaData.cargo,
                            fecha: candidaturaData.fecha,
                            estado: candidaturaData.estado,
                            notas: candidaturaData.notas
                        });
                    }

                    setLoading(false);
                },1000);
            }catch (err){
                console.error('Error al cargar los datos', err);
                setError('Errro al cargar los datos necesarios, Intente nuevamente.');
                setLoading(false);
            }
        };

        fetchData();
    }, [id, reset]);

    //Enviar formulario principal
    const onSubmit= async (data: CandidaturaDTO) => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            //En un entorno real:
            // let response;
            // if (id) {
            //     response = await apiService.put(`/api/candidaturas/${id}`, data);
            // } else {
            //     response = await apiService.post('/api/candidaturas', data);
            // }

            // Simulacion
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess(`Candidatura ${id ? 'actualizada' : 'creada'} correctamente`);
            setSaving(false);

            // Redigir despues de un breve retraso
            setTimeout(() => {
                navigate('/candidaturas');
            }, 1500);
        }catch (err){
            console.error('Error al guarda candidatura', err);
            setError(`Error al ${id ? 'actualizar' : 'crear'} la candidatura. Verifique los datos e intente nuevamente.`);
            setSaving(false);
        }
    };

    // Crear una nueva empresa
    const handleCreateEmpresa = async (data: EmpresaFormData) => {
        try {
            // En un entorno real:
            // const response = await apiService.post('/api/empresas/crear-con-candidatura', data);

            // Simulacion
            await new Promise (resolve => setTimeout(resolve, 1000));

            // Crear una nueva con ID generado
            const newEmpresa: Empresa = {
                id: `new-${Date.now}`,
                nombre: data.nombre,
                correo: data.correo,
                telefono: data.telefono,
                fechaCreacion: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString()
            };

            //Actualizar la lista de empresas
            setEmpresas([...mockEmpresas, newEmpresa]);

            // Seleccionar la nueva empresa en el formulario principal
            setValue('empresaId', newEmpresa.id);

            // Cerrar el dialogo y resetear su formulario
            setOpenNuevaEmpresa(false);
            resetEmpresa();
        }catch (err){
            console.error('Error al crear empresa', err);
            setError(`Error al crear la empresa. Intente nuevamente.`);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/candidaturas')}
                    sx={{ mr: 2 }}
                >
                    Volver
                </Button>
                <Typography variant="h4" component="h1">
                    {id ? 'Editar Candidatura': 'Nueva Candidatura'}
                </Typography>
            </Box>

            {/* Alertas de error o exito */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper sx={{p:3}}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Seccion de Empresa */}
                        <Typography variant="h6" gutterBottom>
                            Empresa
                        </Typography>
                        <Box sx={{ mb: 3}}>
                            <Box sx={{ display: 'flex', gap:1, alignItems: 'flex-start' }}>
                                <Controller
                                    name="empresaId"
                                    control={control}
                                    rules={{ required: 'La empresa es obligatorio' }}
                                    render={({ field }) => (
                                        <Autocomplete
                                            options={empresas}
                                            getOptionLabel={(option) => option.nombre}
                                            isOptionEqualToValue={(options, value) => options.id === value.id}
                                            value={empresas.find(empresa => empresa.id === field.value) || null}
                                            onChange={(_, newValue) => {
                                                field.onChange(newValue ? newValue.id : '');
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Empresa"
                                                    variant="outlined"
                                                    fullWidth
                                                    error={!!errors.empresaId?.message}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <>
                                                                <BusinessIcon color="action" sx={{mr:1}}/>
                                                                {params.InputProps.startAdornment}
                                                            </>
                                                        )
                                                    }}
                                                />
                                            )}
                                            sx={{ width: '100%' }}
                                        />
                                    )}
                                />
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<AddIcon />}
                                    onClick={() => setOpenNuevaEmpresa(true)}
                                    sx={{ mt: 1 }}
                                >
                                    Nueva
                                </Button>
                            </Box>
                        </Box>

                        <Divider sx={{ my:3 }} />

                        {/* Detalles de la Candidatura */}
                        <Typography variant="h6" gutterBottom>
                                    Detalles de la Candidatura
                        </Typography>
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                            gap: 3 
                        }}>
                            {/* Primer campo (Cargo) */}
                            <Box>
                                <Controller
                                    name="cargo"
                                    control={control}
                                    rules={{ required: 'El cargo es obligatorio' }}
                                    render={({ field }) => (
                                        <TextField
                                        label="Cargo / Puesto"
                                        variant="outlined"
                                        fullWidth
                                        error={!!errors.cargo}
                                        helperText={errors.cargo?.message}
                                        {...field}
                                        />
                                    )}
                                />
                            </Box>

                            {/* Segundo campo (Fecha) */}
                            <Box>
                                <Controller
                                    name="fecha"
                                    control={control}
                                    rules={{ required: 'La fecha es obligatoria' }}
                                    render={({ field }) => (
                                        <TextField
                                        label="Fecha de Aplicación"
                                        type="date"
                                        variant="outlined"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={!!errors.fecha}
                                        helperText={errors.fecha?.message}
                                        {...field}
                                        />
                                    )}
                                />
                            </Box>
                            
                             {/* Campo de Estado (ocupará todo el ancho) */}
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <Controller
                                    name="estado"
                                    control={control}
                                    rules={{ required: 'El estado es obligatorio' }}
                                    render={({ field }) => (
                                        <TextField
                                            select
                                            label="Estado"
                                            variant="outlined"
                                            fullWidth
                                            error={!!errors.estado}
                                            helperText={errors.estado?.message}
                                            {...field}
                                        >
                                        {Object.entries(EstadoCandidatura).map(([key, value]) => (
                                            <MenuItem key={key} value={value}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Chip 
                                                        label={estadosConfig[value].label} 
                                                        color={estadosConfig[value].color as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                    />
                                                    {estadosConfig[value].label}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                        </TextField>
                                    )}
                                />
                            </Box>

                            {/* Campo de Notas (ocupará todo el ancho) */}
                            <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                                <Controller
                                    name="notas"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            label="Notas / Observaciones"
                                            variant="outlined"
                                            fullWidth
                                            multiline
                                            rows={4}
                                            {...field}
                                        />
                                    )}
                                />
                            </Box>
                        </Box>
                            {/* Botones de accion */}
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/candidaturas')}
                                    sx={{ mr: 2 }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                    disabled={saving}
                                >
                                    {saving ? 'Guardando...' : 'Guardar Candidatura'}
                                </Button>
                            </Box>
                    </form>
                </Paper>
            )}

            {/* Dialogo para crear nueva empresa */}
            <Dialog 
                open={openNuevaEmpresa} 
                onClose={() => setOpenNuevaEmpresa(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Crear Nueva Empresa</DialogTitle>
                <form onSubmit={handleSubmitEmpresa(handleCreateEmpresa)}>
                <DialogContent>

                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 2 
                }}>
                    <Box sx={{ gridColumn: { xs: '1', sm: 'span 2' } }}>
                        <Controller
                            name="nombre"
                            control={controlEmpresa}
                            rules={{ required: 'El nombre es obligatorio' }}
                            render={({ field, fieldState }) => (
                            <TextField
                                label="Nombre de la Empresa"
                                variant="outlined"
                                fullWidth
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                                {...field}
                            />
                            )}
                        />
                    </Box>

                    <Box>
                        <Controller
                            name="correo"
                            control={controlEmpresa}
                            rules={{ 
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Correo electrónico inválido'
                                }
                            }}
                            render={({ field, fieldState }) => (
                                <TextField
                                    label="Correo Electrónico"
                                    variant="outlined"
                                    fullWidth
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    {...field}
                                />
                            )}
                        />
                    </Box>

                    <Box>
                        <Controller
                            name="telefono"
                            control={controlEmpresa}
                            render={({ field }) => (
                                <TextField
                                    label="Teléfono"
                                    variant="outlined"
                                    fullWidth
                                    {...field}
                                />
                            )}
                        />
                    </Box>
                </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNuevaEmpresa(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                        Crear Empresa
                    </Button>
                </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default CandidaturaForm;
