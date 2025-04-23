import { CandidaturaDTO, Empresa, EstadoCandidatura, Pregunta, PreguntaDTO, Reclutador } from "@/types";
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
    Chip,
    IconButton,
    ListItemText,
    List,
    ListItem,
    FormControl,
    InputLabel,
    Select,
    FormHelperText
} from "@mui/material";
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    Business as BusinessIcon,
    LinkedIn as LinkedInIcon,
    Person as PersonIcon,
    Delete as DeleteIcon
} from "@mui/icons-material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import empresasService from "@/services/empresasService";
import candidaturasService from "@/services/candidaturasService";
import reclutadoresService from "@/services/reclutadoresService";
import _default from "@mui/material/InitColorSchemeScript";
import preguntaService from "@/services/preguntasService";
import PreguntasForm from "../preguntas/PreguntasForm";

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

//Interfaz para los datos del formulario de empresa
interface EmpresaFormData{
    nombre: string;
    correo: string;
    telefono: string;
}

//Interfaz para los datos del formulario de reclutador
interface ReclutadorFormData{
    nombre: string;
    linkinUrl: string;
    empresaId: string;
}

const CandidaturaForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [reclutadores, setReclutadores] = useState<Reclutador[]>([]);
    const [selectedReclutadores, setSelectedReclutadores] = useState<Reclutador[]>([]);
    const [loadingReclutadores, setLoadingReclutadores] = useState(false);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('');

    //Gestión de empresas
    const [openNuevaEmpresa, setOpenNuevaEmpresa] = useState(false);
    const [openNuevoReclutador, setOpenNuevoReclutador] = useState(false);
    const [creatingEmpresa, setCreatingEmpresa] = useState(false);
    const [creatingReclutador, setCreatingReclutador] = useState(false);
    
    

    //Gestión de preguntas
    const [preguntas, setPreguntas] = useState<PreguntaDTO[]>([]);
    const [nuevasPreguntas, setNuevasPreguntas] = useState<PreguntaDTO[]>([]);
    const [preguntasExistentes, setPreguntasExistentes] = useState<Pregunta[]>([]);
    const [preguntasAEliminar, setPreguntasAEliminar] = useState<string[]>([]);

    // Form para la candidatura principal
    const {control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CandidaturaDTO>({
        defaultValues: {
            empresaId: '',
            cargo: '',
            fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
            estado: EstadoCandidatura.PENDIENTE,
            notas: ''
        }
    });

    // para empresa seleccionada
    const watchEmpresaId = watch('empresaId');

    // Form para nueva empresa (dialogo)
    const { control: controlEmpresa, handleSubmit: handleSubmitEmpresa, reset: resetEmpresa, formState: { errors: errorsEmpresa} } = useForm<EmpresaFormData>({
        defaultValues: {
            nombre: '',
            correo: '',
            telefono: ''
        }
    });

    // Form para nuevo reclutador (dialogo)
    const { control: controlReclutador, handleSubmit: handleSubmitReclutador, reset: resetReclutador,setValue: setValueReclutador, formState: { errors: errorsReclutador} } = useForm<ReclutadorFormData>({
        defaultValues: {
            nombre: '',
            linkinUrl: '',
            empresaId: ''
        }
    });

    //Cargar los datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Cargar empresas desde la API
                const empresasResponse = await empresasService.getEmpresas(0,100);
                if(empresasResponse && empresasResponse.content){
                    setEmpresas(empresasResponse.content);
                }

                // Si es edicion, cargar datos de la candidatura
                if(id) {
                    const candidaturaData = await candidaturasService.getCandidaturaById(id);

                    // Formato de fecha para el input type="date"
                    const fechaFormateada = new Date(candidaturaData.fecha)
                        .toISOString()
                        .split('T')[0];

                    // Establecer valores en el formulario
                    reset({
                        empresaId: candidaturaData.empresa?.id || '',
                        cargo: candidaturaData.cargo,
                        fecha: fechaFormateada,
                        estado: candidaturaData.estado,
                        notas: candidaturaData.notas
                    });

                    // Si tiene empresa, establecer el ID para carga reclutadores
                    if(candidaturaData.empresa?.id) {
                        setSelectedEmpresaId(candidaturaData.empresa.id);
                    }

                    // Si tiene reclutadores asociados, cargarlos
                    if(candidaturaData.reclutadoresIds && candidaturaData.reclutadoresIds.length > 0){
                        // Obtener detalles de cada reclutador
                        const reclutadoresData = await Promise.all(
                            candidaturaData.reclutadoresIds.map(reclId =>
                                reclutadoresService.getReclutadorById(reclId)
                            )
                        );
                        setSelectedReclutadores(reclutadoresData);
                    }
                }
            }catch (err: any){
                console.error('Error al cargar los datos', err);
                let erroMsg = 'Error al cargar los datos necesarios. Intente nuevamente.';

                if(err.response?.message){
                    erroMsg = err.response.data.message;
                }else if(err.message){
                    erroMsg = err.message;
                }

                setError(erroMsg);
            }finally{
                setLoading(false);
            }
        };

        fetchData();
    }, [id, reset]);

    // Cargar reclutadores cuando cambia la empresa seleccionada
    useEffect(() => {
        const fetchReclutadores = async () => {
            if(!watchEmpresaId){
                setReclutadores([]);
                return;
            }

            setSelectedEmpresaId(watchEmpresaId);
            setLoadingReclutadores(true);

            try {
                // Cargar reclutadores de la empresa seleccionada
                const response = await reclutadoresService.getReclutadoresByEmpresa(watchEmpresaId, 0, 50);
                if(response && response.content){
                    setReclutadores(response.content);
                }
            } catch (err) {
                console.error('Error al cargar reclutadores:', err);
            }finally{
                setLoadingReclutadores(false);
            }
        };

        if(watchEmpresaId){
            fetchReclutadores();
        }
    }, [watchEmpresaId]);

    //Enviar formulario principal
    const onSubmit= async (data: CandidaturaDTO) => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Guardar la candidatura en la API
            let candidatura;
            let candidaturaId;
            if(id){
                await candidaturasService.updateCandidatura(id, data);
                candidaturaId = id;
            }else {
                candidatura = await candidaturasService.createCandidatura(data);
                candidaturaId = candidatura.id;
            }

            // Asociar reclutadores seleccionados a la candidatura
            if(selectedReclutadores.length > 0){
                let candidaturaId: string;

                if(id){
                    candidaturaId = id; // Usamos el ID de la URL (edicion)
                }else if(candidatura && candidatura.id){
                    candidaturaId = candidatura.id; // Usamos el ID de la candidatura recien creada
                }else {
                    console.error('No se pudo determinar el ID de la candidatura');
                    throw new Error('No se pudo determinar el ID de la candidatura');
                }
                
                // Asociar
                for(const reclutador of selectedReclutadores){
                    await candidaturasService.asignarReclutador(candidaturaId, reclutador.id);
                }
            }

            // Guardar las nuevas preguntas
            if(nuevasPreguntas.length > 0){
                const preguntasValidas = nuevasPreguntas.filter(p => p.pregunta.trim() !== '');

                if(preguntasValidas.length > 0){
                    //Asegurarse que todas las preguntas tengan el ID de candidatura
                    const preguntasConId = preguntasValidas.map(p => ({
                        ...p,
                        candidaturaId
                    }));

                    // crear cada pregunta en la API
                    await Promise.all(
                        preguntasConId.map(pregunta =>
                            preguntaService.createPregunta(pregunta)
                        )
                    );
                }
            }

            setSuccess(`Candidatura ${id ? 'actualizada' : 'creada'} correctamente`);

            // Redigir despues de un breve retraso
            setTimeout(() => {
                navigate('/candidaturas');
            }, 1500);
        }catch (err: any){
            console.error('Error al guarda candidatura', err);

            let errMsg = `Error al ${id ? 'actualizar': 'crear'} la candidatura. Verifica los datos e intenta nuevamente.`;

            if(err.response?.data?.message){
                errMsg = err.response.data.message;
            }else if(err.message){
                errMsg = err.message;
            }

            setError(errMsg);
        }finally{
            setSaving(false);
        }
    };

    // Crear una nueva empresa
    const handleCreateEmpresa = async (data: EmpresaFormData) => {
        setCreatingEmpresa(true);

        try {

            //Crear empresa usando el endpoint especifico para crear con candidatura
            const newEmpresa = await empresasService.createEmpresaWithCandidatura({
                nombre: data.nombre,
                correo: data.correo,
                telefono: data.telefono
            });
            
            // Actualizar la lista de empresas
            setEmpresas(prevEmpresas => [...prevEmpresas, newEmpresa]);

            // Seleccionar la nueva empresa en el formulario principal
            setValue('empresaId', newEmpresa.id);

            // Cerrar el dialogo y resetear su formulario
            setOpenNuevaEmpresa(false);
            resetEmpresa();

            // Mostrar mensaje de exito
            setSuccess('Empresa creada correctamente');
        }catch (err: any){
            console.error('Error al crear empresa', err);

            let errorMsg = 'Error al crear la empresa. Intente nuevamente.';

            if(err.response?.data?.message){
                errorMsg = err.response.data.message;
            }else if(err.message){
                errorMsg = err.message;
            }

            setError(errorMsg);;
        }finally{
            setCreatingEmpresa(false);
        }
    };

    // Crear un nuevo reclutador
    const handleCreateReclutador = async (data: ReclutadorFormData) => {
        setCreatingReclutador(true);
        
        try {
            // Usar la empresa seleccionado si esta disponible
            const empresaId = selectedEmpresaId || data.empresaId;

            // Crear reclutador usando el endpoint para crear con candidatura
            const newReclutador = await reclutadoresService.createReclutadorWithCandidatura({
                nombre: data.nombre,
                linkinUrl: data.linkinUrl,
                empresaId: empresaId
            });

            // Actualizar la lista de reclutadores
            setReclutadores(prevReclutadores => [...prevReclutadores, newReclutador]);

            // Añadir a la lista de reclutadores seleccionados
            setSelectedReclutadores(prevReclutadores => [...prevReclutadores, newReclutador]);

            // Cerrar el dialogo y resetear su formulario
            setOpenNuevoReclutador(false);
            resetReclutador();

            // Mostar mensaje de exito
            setSuccess('Reclutador creado y asociado correctamente');
        } catch (err: any) {
            console.error('Error al crear reclutador', err);

            let errMsg = 'Error al crear reclutador. Intente nuevamente.';

            if(err.response?.data?.message){
                errMsg = err.response.data.message;
            }else if(err.message){
                errMsg = err.message;
            }

            setError(errMsg);
        }finally{
            setCreatingReclutador(false);
        }
    };

    // Añadir un reclutador existente a la lista de seleccionados
    const handleAddReclutador = (reclutador : Reclutador) => {
        // Verificar si ys esta seleccionado
        if(!selectedReclutadores.some(r => r.id === reclutador.id)){
            setSelectedReclutadores([...selectedReclutadores, reclutador]);
        }
    };

    //Eliminar un reclutador de la lista de seleccionados
    const handleRemoveReclutador = (reclutadorId : string) => {
        setSelectedReclutadores(selectedReclutadores.filter(r => r.id !== reclutadorId));
    };

    // Abrir dialogo para crear reclutador
    const handleOpenNuevoReclutador = () => {
        // Establecer la empresa actual como predeterminada
        setValueReclutador('empresaId', selectedEmpresaId);
        setOpenNuevoReclutador(true);
    };

    // Manejador para cambios en las preguntas
    const handlePreguntasChange = (preguntas: PreguntaDTO[]) => {
        setNuevasPreguntas(preguntas);
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
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            value={empresas.find(empresa => empresa.id === field.value) || null}
                                            onChange={(_, newValue) => {
                                                field.onChange(newValue ? newValue.id : '');
                                                // Al cambiar la empresa, limpiamos los reclutadores seleccionados
                                                setSelectedReclutadores([]);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Empresa"
                                                    variant="outlined"
                                                    fullWidth
                                                    error={!!errors.empresaId}
                                                    helperText={errors.empresaId?.message}
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

                        {/* Seccion de reclutadores */}
                        <Typography variant="h6" gutterBottom>
                            Reclutadores
                        </Typography>
                        <Box sx={{ mb: 3}}>
                            {selectedEmpresaId ? (
                                <>
                                    {/* Lista de reclutadores seleccionados */}
                                    {selectedReclutadores.length > 0 && (
                                        <Box sx={{ mb:2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Reclutadores asociados:
                                            </Typography>
                                            <List dense>
                                                {selectedReclutadores.map(reclutador => (
                                                     <ListItem
                                                     key={reclutador.id}
                                                     secondaryAction={
                                                         <IconButton
                                                             edge="end"
                                                             onClick={() => handleRemoveReclutador(reclutador.id)}
                                                             size="small"
                                                         >
                                                             <DeleteIcon fontSize="small"/>
                                                         </IconButton>
                                                     }
                                                 >
                                                     <ListItemText 
                                                         primary={
                                                             <Box sx={{ display: ' flex', alignItems: 'center' }}>
                                                                 <PersonIcon fontSize="small" sx={{mr:1, color: 'primary.main'}}/>
                                                                 {reclutador.nombre}
                                                             </Box>
                                                         }
                                                         secondary={
                                                             reclutador.linkinUrl && (
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <LinkedInIcon fontSize="small" sx={{ mr:0.5, color: '#0077b5'}} />
                                                                    <a
                                                                        href={reclutador.linkinUrl.startsWith('https') ? reclutador.linkinUrl : `https://${reclutador.linkinUrl}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{fontSize: '0.8rem', color: '#0077b5' }}
                                                                    >
                                                                        Perfil LinkedIn
                                                                    </a>
                                                                </Box>
                                                             )
                                                         }
                                                     />
                                                 </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}

                                    {/* Selector y boton para agregar reclutadores */}
                                    <Box sx={{ display: 'flex', gap: 1, alignItems:'flex-start' }}>
                                        <Autocomplete 
                                            options={reclutadores.filter(r => !selectedReclutadores.some(sr => sr.id === r.id))}
                                            getOptionLabel={(option) => option.nombre}
                                            onChange={(_, newValue) => {
                                                if(newValue){
                                                    handleAddReclutador(newValue);
                                                }
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Seleccionar Reclutador"
                                                    variant="outlined"
                                                    fullWidth
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment:(
                                                            <>
                                                                <PersonIcon color="action" sx={{mr:1}}/>
                                                                {params.InputProps.startAdornment}
                                                            </>
                                                        )
                                                    }}
                                                />
                                            )}
                                            sx={{ width: '100%' }}
                                            loading={loadingReclutadores}
                                            loadingText="Cargando Reclutadores..."
                                            noOptionsText="No hay Reclutadores disponibles"
                                        />
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            startIcon={<AddIcon />}
                                            onClick={handleOpenNuevoReclutador}
                                            sx={{ mt: 1 }}
                                            disabled={!selectedEmpresaId}
                                        >
                                            Nuevo
                                        </Button>
                                    </Box>
                                </>
                            ) : (
                                <Alert severity="info">
                                    Seleccione una empresa para gestionar reclutadores
                                </Alert>
                            )}
                        </Box>

                        <Divider sx={{ my: 3 }} />

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

                        {/* Preguntas de la candidatura */}
                        <Divider sx={{ my: 3}} />
                        <PreguntasForm 
                            candidaturaId={id || ''}
                            onPreguntasChange={handlePreguntasChange}
                            editable={true}
                        />
                        <Divider sx={{ my: 3 }} />
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
                onClose={() => !creatingEmpresa && setOpenNuevaEmpresa(false)}
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
                                    disabled={creatingEmpresa}
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
                                        disabled={creatingEmpresa}
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
                                        disabled={creatingEmpresa}
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
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        disabled={creatingEmpresa}
                        startIcon={creatingEmpresa ? <CircularProgress size={20} /> : null}
                    >
                        {creatingEmpresa ? 'Creando...' : 'Crear Empresa'}
                    </Button>
                </DialogActions>
                </form>
            </Dialog>

            {/* Dialogo para crear nuevo reclutador */}
            <Dialog
                open={openNuevoReclutador}
                onClose={() => !creatingReclutador && setOpenNuevoReclutador(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Crear Nuevo Reclutador</DialogTitle>
                <form onSubmit={handleSubmitReclutador(handleCreateReclutador)}>
                    <DialogContent>
                        <Box sx={{
                                display:'grid',
                                gridTemplateColumns: {xs: '1fr'},
                                gap: 2
                        }}>
                            <Box>
                                <Controller 
                                    name="nombre"
                                    control={controlReclutador}
                                    rules={{ required: 'El nombre es obligatorio' }}
                                    render={({ field, fieldState }) => (
                                        <TextField 
                                            label="Nombre del Reclutador"
                                            variant="outlined"
                                            fullWidth
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            {...field}
                                            disabled={creatingReclutador}
                                            InputProps={{
                                                startAdornment: <PersonIcon color="action" sx={{ mr: 1 }}/>
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                            <Box>
                                <Controller 
                                    name="linkinUrl"
                                    control={controlReclutador}
                                    rules={{
                                        pattern: {
                                            value: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
                                            message: 'URL de LinkedIn no válida (formato: linkedin.com/in/perfil)'
                                        }
                                    }}
                                    render={({ field, fieldState}) => (
                                        <TextField 
                                            label="URL de LinkedIn"
                                            variant="outlined"
                                            fullWidth
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message || 'Ejemplo: https://www.linkedin.com/in/perfil'}
                                            {...field}
                                            disabled={creatingReclutador}
                                            InputProps={{
                                                startAdornment: <LinkedInIcon color="action" sx={{ mr: 1, color: '#0077b5' }}/>
                                            }}
                                        />
                                    )}
                                />
                            </Box>
                            
                            <Box>
                                <Controller 
                                    name="empresaId"
                                    control={controlReclutador}
                                    rules={{ required: 'La empresa es obligatoria'}}
                                    render={({ field, fieldState}) => (
                                        <FormControl 
                                            fullWidth
                                            error={!!fieldState.error}
                                            disabled={creatingReclutador || !!selectedEmpresaId}
                                        >
                                            <InputLabel id="empresa-reclutador-label">Empresa</InputLabel>
                                            <Select
                                                labelId="empresa-reclutador-label"
                                                label="Empresa"
                                                {...field}
                                            >
                                                {empresas.map(empresa => (
                                                    <MenuItem key={empresa.id} value={empresa.id}>
                                                        {empresa.nombre}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {fieldState.error && (
                                                <FormHelperText>{fieldState.error.message}</FormHelperText>
                                            )}
                                            {!!selectedEmpresaId && (
                                                <FormHelperText>
                                                    El reclutador se asociará a la empresa seleccionada en el formulario principal
                                                </FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setOpenNuevoReclutador(false)}
                            disabled={creatingReclutador}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={creatingReclutador}
                            startIcon={creatingReclutador ? <CircularProgress size={20} /> : null}
                        >
                            {creatingReclutador ? 'Creando...' : 'Crear Reclutador'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default CandidaturaForm;
