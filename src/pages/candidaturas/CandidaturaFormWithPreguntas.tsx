import candidaturasService from "@/services/candidaturasService";
import empresasService from "@/services/empresasService";
import reclutadoresService from "@/services/reclutadoresService";
import { CandidaturaDTO, Empresa, EstadoCandidatura, PreguntaDTO, Reclutador } from "@/types";
import { Alert, 
    Autocomplete, 
    Box, 
    Button, 
    Chip, 
    CircularProgress, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle, 
    Divider, 
    FormControl, 
    FormHelperText, 
    IconButton, 
    InputLabel, 
    List, 
    ListItem, 
    ListItemText, 
    MenuItem,
    Paper, 
    Select, 
    Tab, 
    Tabs, 
    TextField, 
    Typography } from "@mui/material";
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    Business as BusinessIcon,
    LinkedIn as LinkedInIcon,
    Person as PersonIcon,
    Delete as DeleteIcon,
    QuestionAnswer as QuestionIcon
}from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import PreguntasPanel from "../preguntas/preguntasPanel";
import NuevaPreguntaField from "../preguntas/NuevaPreguntaField";
import preguntasService from "@/services/preguntasService";

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

// Interfaz para pestañas
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

// Componente para pestañas
const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`candidatura-tabpanel-${index}`}
        aria-labelledby={`candidatura-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
};

// Interfaz para los datos del formulario de empresa
interface EmpresaFormData{
    nombre: string;
    correo: string;
    telefono: string;
}

// Interfaz para los datos del formulario de reclutador
interface ReclutadorFormData{
    nombre: string;
    linkinUrl: string;
    empresaId: string;
}

const CandidaturaFormWithPreguntas = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [reclutadores, setReclutadores] = useState<Reclutador[]>([]);
    const [selectedReclutadores, setSelectedReclutadores] = useState<Reclutador[]>([]);
    const [openNuevaEmpresa, setOpenNuevaEmpresa] = useState(false);
    const [openNuevoReclutador, setOpenNuevoReclutador] = useState(false);
    const [creatingEmpresa, setCreatingEmpresa] = useState(false);
    const [creatingReclutador, setCreatingReclutador] = useState(false);
    const [loadingReclutadores, setLoadingReclutadores] = useState(false);
    const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('');

    //Estado para gestionar pestañas
    const [tabValue, setTabValue] = useState(0);

    //Estado para refrescar la lista de preguntas
    const [refreshPreguntas, setRefreshPreguntas] = useState(0);

    //Estado para preguntas temporales
    const [preguntasTemporales, setPreguntasTemporales] = useState<PreguntaDTO[]>([]);

    // Estados para el dialogo de agregar pregunta
    const [openAddPreguntaDialog, setOpenAddPreguntaDialog] = useState(false);
    const [nuevaPregunta, setNuevaPregunta] = useState('');
    const [savingPregunta, setSavingPregunta] = useState(false);
    const [preguntaError, setPreguntaError] = useState<string | null>(null);
    
    //FORM para la candidatura principal
    const {control, handleSubmit, reset, setValue, watch, formState: {errors }} = useForm<CandidaturaDTO>({
        defaultValues: {
            empresaId: '',
            cargo:'',
            fecha: new Date().toISOString().split('T')[0],
            estado: EstadoCandidatura.PENDIENTE,
            notas: ''   
        }
    });

    //Observar cambios en empresaId para cargar reclutadores asociados
    const watchEmpresaId = watch('empresaId');

    // Form para nueva empresa (dialogo)
    const {control: controlEmpresa, handleSubmit: handleSubmitEmpresa, reset: resetEmpresa, setValue: setValueEmpresa, formState:{errors: errorsEmpresa}} = useForm<EmpresaFormData>({
        defaultValues: {
            nombre: '',
            correo: '',
            telefono: ''
        }
    });

    // Form para nuevo reclutador (dialogo)
    const {control: controlReclutador, handleSubmit: handleSubmitReclutador, reset: resetReclutador, setValue: setValueReclutador, formState:{errors: errorsReclutador}} = useForm<ReclutadorFormData>({
        defaultValues: {
            nombre: '',
            linkinUrl: '',
            empresaId: ''
        }
    });

    // Cambiar pestaña
    const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Refrescar lista de preguntas
    const handlePreguntaCreated = () => {
        setRefreshPreguntas(prev => prev + 1);
    };

    // Funcion para abrir el dialogo de agregar pregunta
    const handleOpenAddPregunta = () => {
        setNuevaPregunta('');
        setPreguntaError(null);
        setOpenAddPreguntaDialog(true);
    };

     // Funcion para guardar la pregunta (para candidaturas existentes)
     const handleSavePregunta = async () => {
        if(!id || !nuevaPregunta.trim()){
            setPreguntaError('La pregunta no puede estar vacia');
            return;
        }

        setSavingPregunta(true);
        setPreguntaError(null);

        try {
            const preguntaDTO: PreguntaDTO ={
                candidaturaId: id,
                pregunta: nuevaPregunta.trim()
            };

            await preguntasService.createPregunta(preguntaDTO);

            // Cerrar dialogo y limpiar
            setOpenAddPreguntaDialog(false);
            setNuevaPregunta('');
            setRefreshPreguntas(prev => prev + 1);
        } catch (error) {
            console.error('Error al guardar la pregunta:', error);
            setPreguntaError('Error al guardar la pregunta. Intentalo de nuevo');
        } finally{
            setSavingPregunta(false);
        }
    };

    // funcion para guardar pregunta temporal (para nuevas candidaturas)
    const handleSavePreguntaTemporal = () => {
        if(!nuevaPregunta.trim()){
            setPreguntaError('La pregunta no puede estar vacia');
            return;
        }

        // Crear nueva Pregunta temporañ
        const nuevaPreguntaObj: PreguntaDTO = {
            candidaturaId: 'temp',
            pregunta: nuevaPregunta.trim()
        };

        // Añadir a la lista de preguntas temporales
        setPreguntasTemporales([...preguntasTemporales, nuevaPreguntaObj]);

        // Limpiar el campo
        setOpenAddPreguntaDialog(false);
        setNuevaPregunta('');
    };

    // Funcion para eliminar una pregunta temporal
    const handleRemovePreguntaTemporal = (index: number) => {
        const nuevasPreguntas = [...preguntasTemporales];
        nuevasPreguntas.splice(index, 1);
        setPreguntasTemporales(nuevasPreguntas);
    };
    
    // Cargar los datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Cargar empresa desde la API
                const empresasResponse = await empresasService.getEmpresas(0,100);
                if(empresasResponse && empresasResponse.content){
                    setEmpresas(empresasResponse.content);
                }

                // Si es edicion, cargar de la candidatura
                if(id){
                    const candidaturaData = await candidaturasService.getCandidaturaById(id);

                    // Formato de fecha para el input type="date"
                    const fechaFormateada = new Date(candidaturaData.fecha).toISOString().split('T')[0];

                    // Establecer valores en el formulario
                    reset({
                        empresaId: candidaturaData.empresa?.id || '',
                        cargo: candidaturaData.cargo,
                        fecha: fechaFormateada,
                        estado: candidaturaData.estado,
                        notas: candidaturaData.notas
                    });

                    // Si tiene empresa, establecer el ID para carga reclutadores
                    if(candidaturaData.empresa?.id){
                        setSelectedEmpresaId(candidaturaData.empresa.id);
                    }

                    // Si tiene empresa, establecer el ID para carga reclutadores
                    if(candidaturaData.empresa?.id){
                        setSelectedEmpresaId(candidaturaData.empresa.id);
                    };
                

                // Si tiene reclutadores asociados, cargarlos
                if(candidaturaData.reclutadoresIds && candidaturaData.reclutadoresIds.length > 0){
                    // Obtener detalles de cada reclutador
                    const reclutadoresData = await Promise.all(
                        candidaturaData.reclutadoresIds.map(recId =>
                            reclutadoresService.getReclutadorById(recId)
                        )
                    );
                    setSelectedReclutadores(reclutadoresData);
                }
            }
            } catch (err: any) {
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

    // Enviar formulario principal
    const onSubmit = async (data: CandidaturaDTO) => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Guardar la candidatura en la API
            let candidatura;
            let candidaturaId;

            if(id){
                // Actualizar candidatura existente
                await candidaturasService.updateCandidatura(id, data);
                candidaturaId = id;
            }else {
                // Crear nueva candidatura
                candidatura = await candidaturasService.createCandidatura(data);
                candidaturaId = candidatura.id;
            }

            // Asociar reclutadores selccionados a la candidatura
            if(selectedReclutadores.length > 0){
                try {
                    //Asociar cada reclutador
                    for(const reclutador of selectedReclutadores){
                        await candidaturasService.asignarReclutador(candidaturaId, reclutador.id);
                    }
                } catch (err) {
                    console.error('Error al asociar reclutadores:', err);
                }
            }

            // Guardar preguntas temporales si es una nueva candidatura
            if(!id && preguntasTemporales.length > 0){
                try {
                    // Guardar cada pregunta asociandola a la candidatura creada
                    for(const pregunta of preguntasTemporales){
                        await preguntasService.createPregunta({
                            candidaturaId: candidaturaId,
                            pregunta: pregunta.pregunta
                        });
                    }
                } catch (err) {
                    console.error('Error al guardar preguntas:', err);
                }
            }

            setSuccess(`Candidatura ${id ? 'actualizada': 'creada'} correctamente`);

            // Si es nueva candidatura, redirigir a edición para permitir agregar preguntas
            if(!id){
                setTimeout(() => {
                    navigate(`/candidaturas/${candidaturaId}/edit`);
                }, 1500);
            }else{
                // Si estamos editando, actualizar la vista actual
                setRefreshPreguntas(prev => prev + 1);
            }
        } catch (err: any) {
            console.error('Error al guardar la candidatura:', err);
            let erroMsg = `Error al ${id ? 'actualizar': 'crear'} la candidatura. Verifica los e intenta nuevamente.`;

            if(err.response?.data?.message){
                erroMsg = err.response.data.message;
            }else if(err.message){
                erroMsg = err.message;
            }

            setError(erroMsg);
        }finally{
            setSaving(false);
        }
    };

    //Crear una nueva empresa
    const handleCreateEmpresa = async (data: EmpresaFormData) => {
        setCreatingEmpresa(true);

            try {
                //crear empresa usando el endpoint específico para crear con candidatura
                const newEmpresa = await empresasService.createEmpresaWithCandidatura({
                    nombre: data.nombre,
                    correo: data.correo,
                    telefono: data.telefono
                });

                // Actualizar la lista de empresas
                setEmpresas(prevEmpresas => [...prevEmpresas, newEmpresa]);

                // Seleccionar la nueva empresa en el formulario principal
                setValue('empresaId', newEmpresa.id);

                //Cerrar el dialogo y resetear su formulario
                setOpenNuevaEmpresa(false);
                resetEmpresa();

                //Mostrar mensaje de exito
                setSuccess('Empresa creada correctamente');
            } catch (err: any) {
                console.error('Error al crear empresa', err);
                
                let erroMsg = 'Error al crear la empresa. Verifica los e intenta nuevamente.';

                if(err.response?.data?.message){
                    erroMsg = err.response.data.message;
                }else if(err.message){
                    erroMsg = err.message;
                }

                setError(erroMsg);
            }finally{
                setCreatingEmpresa(false);
            }
        };

        // Crear nuevo reclutador
        const handleCreateReclutador = async (data: ReclutadorFormData) => {
            setCreatingReclutador(true);

            try {
                //Usar la empresa seleccionada si está disponible
                const empresaId = selectedEmpresaId || data.empresaId;

                // Crear reclutador usando el endpoint para crear con candidatura
                const newReclutador = await reclutadoresService.createReclutadorWithCandidatura({
                    nombre: data.nombre,
                    linkinUrl: data.linkinUrl,
                    empresaId: data.empresaId
                });

                //Actualizar la lista de reclutadores
                setReclutadores(prevReclutadores => [...prevReclutadores, newReclutador]);

                //Añadir a la lista de reclutadores seleccionados
                setSelectedReclutadores(prevReclutadores => [...prevReclutadores, newReclutador]);

                //Cerrar el diálogo y resetear su formulario
                setOpenNuevoReclutador(false);
                resetReclutador();

                //Mostrar mensaje de éxito
                setSuccess('Reclutador creado y asociado exitosamente');
            } catch (err: any) {
                console.error('Error al crear reclutador', err);
                let erroMsg = 'Error al crear el reclutador. Verifica los datos e intenta nuevamente.';

                if(err.response?.data?.message){
                    erroMsg = err.response.data.message;
                }else if(err.message){
                    erroMsg = err.message;
                }

                setError(erroMsg);
            }finally{
                setCreatingReclutador(false);
            }
        };

        //Añadir un reclutador existente a la lista de seleccionados
        const handleAddReclutador = (reclutador: Reclutador) => {
            //Verificar si ya está seleccionado
            if(!selectedReclutadores.some(rec => rec.id === reclutador.id)){
                setSelectedReclutadores([...selectedReclutadores,reclutador]);
            }
        };

        //Eliminar un reclutador de la lista de seleccionados
        const handleRemoveReclutador = (reclutadorId: string) => {
            setSelectedReclutadores(selectedReclutadores.filter(rec => rec.id !== reclutadorId));
        };

        //Abrir diálogo para crear reclutador
        const handleOpenNuevoReclutador = () => {
            //Establecer la empresa actual como predeterminada
            setValueReclutador('empresaId', selectedEmpresaId);
            setOpenNuevoReclutador(true);
        };

        return (
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb:3}}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/candidaturas')}
                        sx={{ mr:2}}
                    >Volver</Button>
                    <Typography variant="h4" component="h1">
                        {id ? 'Editar candidatura': 'Nueva Candidatura'}
                    </Typography>
                </Box>

                {/* Alertas de error o éxito */}
                {error && (
                    <Alert severity="error" sx={{mb:3}}>{error}</Alert>
                )}
                {success&& (
                    <Alert severity="success" sx={{mb:3}}>{success}</Alert>
                )}

                {loading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', mt:4}}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper sx={{p:3}}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb:2}}>
                            <Tabs
                                value={tabValue}
                                onChange={handleChangeTab}
                                aria-label="candidatura tabs"
                                variant="fullWidth"
                            >
                                <Tab
                                    label="Informacion Principal"
                                    id="candidatura-tab-0"
                                    aria-controls="candidatura-tabpanel-0"
                                    icon={<BusinessIcon />}
                                    iconPosition="start"
                                />
                                <Tab 
                                    label="Preguntas de Entrevista"
                                    id="candidatura-tab-1"
                                    aria-controls="candidatura-tabpanel-1"
                                    icon={<QuestionIcon />}
                                    iconPosition="start"
                                />
                            </Tabs>
                        </Box>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Pestaña de Información Principal */}
                            <TabPanel value={tabValue} index={0}>
                                {/* Sección de Empresa */}
                                <Typography variant="h6" gutterBottom>
                                    Empresa
                                </Typography>
                                <Box sx={{mb:3}}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start'}}>
                                        <Controller 
                                            name="empresaId"
                                            control={control}
                                            rules={{required: 'La empresa es obligatoria'}}
                                            render={({field}) => (
                                                <Autocomplete
                                                    options={empresas}
                                                    getOptionLabel={(option) => option.nombre}
                                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                                    value={empresas.find(empresa => empresa.id === field.value) || null}
                                                    onChange={(_, newValue) => {
                                                        field.onChange(newValue ? newValue.id :'');
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
                                                                        <BusinessIcon color="action" sx={{ mr: 1 }} />
                                                                        {params.InputProps.startAdornment}
                                                                    </>
                                                                )
                                                            }}
                                                        />
                                                    )}
                                                    sx={{ width: '100%'}}
                                                />
                                            )}
                                        />
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            startIcon={<AddIcon />}
                                            onClick={() => setOpenNuevaEmpresa(true)}
                                            sx={{mt:1}}
                                        >
                                            Nueva
                                        </Button>
                                    </Box>
                                </Box>

                                <Divider sx={{my:3}}/>

                                {/* Sección de Reclutadores */}
                                <Typography variant="h6" gutterBottom>
                                    Reclutadores
                                </Typography>
                                <Box sx={{ mb: 3}}>
                                    {selectedEmpresaId ? (
                                        <>
                                            {/* Lista de reclutadores seleccionados */}
                                            {selectedReclutadores.length > 0 && (
                                                <Box sx={{ mb:2}}>
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
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                }
                                                            >
                                                                <ListItemText 
                                                                    primary={
                                                                        <Box sx={{ display: 'flex', alignItems: 'center'}}>
                                                                            <PersonIcon fontSize="small" sx={{mr: 1, color:'primary.main'}}/>
                                                                            {reclutador.nombre}
                                                                        </Box>
                                                                    }
                                                                    secondary={
                                                                        reclutador.linkinUrl && (
                                                                            <Box sx={{ display: 'flex', alignItems: 'center'}}>
                                                                                <LinkedInIcon fontSize="small" sx={{mr: 0.5, color:'#0077b5'}}/>
                                                                                <a
                                                                                    href={reclutador.linkinUrl.startsWith('https') ? reclutador.linkinUrl : `https://${reclutador.linkinUrl}`}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    style={{ fontSize: '0.8rem', color: '#0077b5'}}
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
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start'}}>
                                                <Autocomplete 
                                                    options={reclutadores.filter(r => !selectedReclutadores.some(sr => sr.id === r.id))}
                                                    getOptionLabel= {(option) => option.nombre}
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
                                                                        <PersonIcon color="action" sx={{mr:1}} />
                                                                        {params.InputProps.startAdornment}
                                                                    </>
                                                                )
                                                            }}
                                                        />
                                    )}
                                                    sx={{width: '100%'}}
                                                    loading = {loadingReclutadores}
                                                    loadingText = "Cargando Reclutadores..."
                                                    noOptionsText = "No hay reclutadores disponibles"
                                                />
                                                <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    startIcon={<AddIcon />}
                                                    onClick={handleOpenNuevoReclutador}
                                                    sx={{mt:1}}
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

                                <Divider sx={{my:3}}/>

                                {/* Detalled de la candidatura */}
                                <Typography variant="h6" gutterBottom>
                                    Detalles de la candidatura
                                </Typography>
                                <Box sx={{ 
                                    display: 'grid',
                                    gridTemplateColumns: { sx: '1fr', md: 'repeat(2,1fr)'},
                                    gap:3
                                }}>
                                    {/* Primer campo (cargo) */}
                                    <Box>
                                        <Controller 
                                            name="cargo"
                                            control={control}
                                            rules={{ required: 'El cargo es obligatorio'}}
                                            render={({ field}) => (
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

                                    {/* Segundo campo (fecha) */}
                                    <Box>
                                        <Controller 
                                            name="fecha"
                                            control={control}
                                            rules={{ required: 'La fecha es obligatoria'}}
                                            render={({ field}) => (
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

                                    {/* Campor de Estado (ocupará todo el ancho)*/}
                                    <Box sx={{ gridColumn: {xs: '1', md: 'span 2'}}}>
                                        <Controller 
                                            name="estado"
                                            control={control}
                                            rules={{ required: 'El estado es obligatorio'}}
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
                                                            <Box sx={{ display: 'flex', alignItems: 'center'}}>
                                                                <Chip 
                                                                    label={estadosConfig[value].label}
                                                                    color={estadosConfig[value].color as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                                                                    size="small"
                                                                    sx={{mr:1}}
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
                                    <Box sx={{ gridColumn: {xs: '1', md: 'span 2'}}}>
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
                            </TabPanel>

                            {/* Pestaña de Preguntas de Entrevista */}
                            <TabPanel value={tabValue} index={1}>
                                {id ? (
                                    // Para edición - mostrar panel completo de preguntas
                                    <>
                                        <PreguntasPanel 
                                            candidaturaId={id}
                                            editable={true}
                                            key={`preguntas-panel-${refreshPreguntas}`}
                                            onAddClick={handleOpenAddPregunta}
                                        />
                                    </>
                                ) : (
                                    // Para creación - permitir crear preguntas temporales
                                    <>
                                        <Alert severity="info" sx={{mb:3}}>
                                        Estas preguntas se guardarán cuando crees la candidatura. Puedes agregar todas las que necesites ahora.
                                        </Alert>

                                        <Box sx={{mt:2}}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', mb:2}}>
                                                <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center'}}>
                                                    <QuestionIcon sx={{ mr: 1}} />
                                                    Preguntas de entrevistas ({preguntasTemporales.length})
                                                </Typography>

                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                    startIcon={<AddIcon />}
                                                    onClick={handleOpenAddPregunta}
                                                >
                                                    Añadir pregunta
                                                </Button>
                                            </Box>

                                            <Divider sx={{mb:2}} />

                                            {/* Lista de preguntas temporales */}
                                            {preguntasTemporales.length > 0 ? (
                                                <List sx={{ width: '100%'}}>
                                                    {preguntasTemporales.map((pregunta, index) => (
                                                        <Paper
                                                            key={index}
                                                            elevation={1}
                                                            sx={{p:2, mb:2, borderLeft: '4px solid #1976d2'}}
                                                        >
                                                            <ListItem
                                                                disableGutters
                                                                secondaryAction={
                                                                    <IconButton
                                                                        edge="end"
                                                                        onClick={() => handleRemovePreguntaTemporal(index)}
                                                                        size="small"
                                                                    >
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                }
                                                            >
                                                                <Box sx={{ width: '100%'}}>
                                                                    <Typography variant="body1">
                                                                        <QuestionIcon 
                                                                        fontSize="small" 
                                                                        sx={{ 
                                                                            mr:1, 
                                                                            color: 'primary.main', 
                                                                            verticalAlign: 'middle'
                                                                        }} />
                                                                        {pregunta.pregunta}
                                                                    </Typography>
                                                                </Box>
                                                            </ListItem>
                                                        </Paper>
                                                    ))}
                                                </List>
                                            ) : (
                                            <Alert severity="info" sx={{mb:3}}>
                                                No hay preguntas agregadas aún.
                                            </Alert>
                                        )}
                                        </Box>
                                    </>
                                    
                                )}
                            </TabPanel>

                            {/* Botones de acción */}
                            <Box sx={{mt:4, display: 'flex', justifyContent: 'flex-end'}}>
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

                {/* Dialogo para crear nueva Empresa */}
                <Dialog
                    open={openNuevaEmpresa}
                    onClose={() => !creatingEmpresa && setOpenNuevaEmpresa(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Crear Nueva Empresa</DialogTitle>
                    <form onSubmit={handleSubmitEmpresa(handleCreateEmpresa)}>
                        <DialogContent>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)'},
                                gap: 2
                            }}>
                                <Box sx={{ gridColumn: {xs: '1', sm: 'span 2'}}}>
                                    <Controller 
                                        name="nombre"
                                        control={controlEmpresa}
                                        rules={{ required: 'El nombre de la empresa es obligatorio' }}
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
                                                message: 'Correo electrónico no válido'
                                            }
                                        }}
                                        render={({ field, fieldState}) => (
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
                                        render={({ field}) => (
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
                                {creatingEmpresa ? 'Creando..' : 'Crear Empresa'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* Dialogo para crear nuevo Reclutador */}
                <Dialog
                    open={openNuevoReclutador}
                    onClose={() => !creatingReclutador && setOpenNuevoReclutador(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Crear Nuevo Reclutador</DialogTitle>
                    <form onSubmit={handleSubmitReclutador(handleCreateReclutador)}>
                    <DialogContent>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: {xs: '1fr'},
                            gap: 2
                        }}>
                            <Box>
                                <Controller 
                                    name="nombre"
                                    control={controlReclutador}
                                    rules={{ required: 'El nombre del reclutador es obligatorio' }}
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
                                                startAdornment : <PersonIcon color="action" sx={{ mr:1}} />
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
                                    render={({field, fieldState}) => (
                                        <TextField 
                                            label="URL de LinkedIn"
                                            variant="outlined"
                                            fullWidth
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message || 'Ejemplo: https://www.linkedin.com/in/perfil'}
                                            {...field}
                                            disabled={creatingReclutador}
                                            InputProps={{
                                                startAdornment : <LinkedInIcon color="action" sx={{ mr:1, color: '#0077b5'}} />
                                            }}
                                        />
                                    )}
                                />
                            </Box>

                            <Box>
                                <Controller 
                                    name="empresaId"
                                    control={controlReclutador}
                                    rules={{ required: 'La empresa es obligatoria' }}
                                    render={({field, fieldState}) => (
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
                        {creatingReclutador? 'Creando...' : 'Crear Reclutador'}
                        </Button>
                    </DialogActions>
                </form>
                </Dialog>

                {/* Diálogo para agregar pregunta */}
                <Dialog
                    open={openAddPreguntaDialog}
                    onClose={() => !savingPregunta && setOpenAddPreguntaDialog(false)}
                    fullWidth
                    maxWidth="md"
                >
                    <DialogTitle>Agregar Nueva Pregunta</DialogTitle>
                    <DialogContent>
                        <TextField 
                            autoFocus
                            margin="dense"
                            label="Pregunta"
                            fullWidth
                            multiline
                            rows={3}
                            value={nuevaPregunta}
                            onChange={(e) => setNuevaPregunta(e.target.value)}
                            placeholder="Escribe la pregunta de entrevista"
                            error={!!preguntaError}
                            disabled={savingPregunta}
                            helperText={preguntaError}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setOpenAddPreguntaDialog(false)}
                            disabled={savingPregunta}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="contained"
                            color="primary"
                            disabled={savingPregunta}
                            startIcon={savingPregunta ? <CircularProgress size={20} /> : <AddIcon />}
                            onClick={id ? handleSavePregunta : handleSavePreguntaTemporal}
                        >
                            {savingPregunta ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
};

export default CandidaturaFormWithPreguntas;
