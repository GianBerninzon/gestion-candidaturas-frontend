import React, { useEffect, useState } from "react";
import empresasService from "@/services/empresasService";
import reclutadoresService from "@/services/reclutadoresService";
import useAuthStore from "@/store/authStore";
import { Empresa, ReclutadorDTO } from "@/types";
import { Alert, 
    Box, 
    Button, 
    CircularProgress, 
    FormControl, 
    FormHelperText, 
    IconButton, 
    InputLabel, 
    MenuItem, 
    Paper, 
    Select, 
    TextField, 
    Typography 
} from "@mui/material";
import { 
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from "@mui/icons-material";

import { useNavigate, useParams } from "react-router-dom"
import { SelectChangeEvent } from "node_modules/@mui/material";

/**
 * Componente para crear o editar reclutadores
 */
const ReclutadorForm: React.FC = () => {
    const {id} = useParams<{ id: string}>();
    const navigate = useNavigate();
    const {user} = useAuthStore();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROOT';
    const isEdit = !!id;

    // Estado para reclutador
    const [reclutador, setReclutador] = useState<ReclutadorDTO>({
        nombre: '',
        linkinUrl:'',
        empresaId: ''
    });

    // Estado para la lista de empresas
    const [empresas, setEmpresas] = useState<Empresa[]>([]);

    // Estados para los mensajes y carga
    const [loading, setLoading] = useState(false);
    const [loadingEmpresas, setLoadingEmpresas] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Estado para error de validacion
    const [validationErrors, setValidationErrors] = useState<{
        nombre?: string;
        empresaId?: string;
        linkinUrl?: string;
    }>({});

    // Cargar los datos iniciales
    useEffect(() => {
        // Cargar empresas
        const fetchEmpresas = async () => {
            setLoading(true);
            try {
                const response = await empresasService.getEmpresas(0, 100);
                if(response && response.content){
                    setEmpresas(response.content);
                }
            } catch (err) {
                console.error('Error al cargar empresas:', err);
            }finally{
                setLoadingEmpresas(false);
            }
        };

        // Cargar datos del reclutador si estamos en modo edicion
        const fetchReclutador = async () => {
            if(!isEdit) return;

            setLoading(true);
            try {
                const data = await reclutadoresService.getReclutadorById( id as string);
                setReclutador({
                    nombre: data.nombre,
                    linkinUrl: data.linkinUrl || '',
                    empresaId: data.empresa?.id || ''
                });
            } catch (err: any) {
                console.error('Error al cargar reclutador:', err);
                setError('Error al cargar los datos del recutador. Por favor, intentalo de nuevo.');
            }finally{
                setLoading(false);
            }
        };

        // Ejecutar las cargar de datos
        fetchEmpresas();
        fetchReclutador();
    }, [id, isEdit]);

    // Validar el formulario
    const validateForm = (): boolean => {
        const errors: {
            nombre?: string;
            empresaId?: string;
            linkinUrl?: string;
        }= {};

        // Validar nombre
        if(!reclutador.nombre.trim()){
            errors.nombre = 'El nombre es obligatorio';
        }

        // Validar empresa
        if(!reclutador.empresaId){
            errors.empresaId = 'La empresa es obligatoria';
        }

        // Validar formato linkedIn URl 
        if(reclutador.linkinUrl){
            const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
            if(!linkedinRegex.test(reclutador.linkinUrl)){
                errors.linkinUrl='URL de linkedIn no valida (debe ser el formato: linkedin.com/in/perfil)';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Manejar cambios en los campos del formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | {name?: string; value:unknown}>) => {
        const {name, value} = e.target;
        if(name){
            setReclutador(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Manejar cambios en Select
    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const {name, value} = e.target;
        if(name){
            setReclutador(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Manejar el envio del formulario
    const handleSubmit= async (e:React.FormEvent) => {
        e.preventDefault();

        // Validar el formulario
        if(!validateForm()){
            return;
        }

        setSaving(true);
        setError(null);

        try {
         if(isEdit){
            // Si es edicion
            if(isAdmin){
                // Admin usa el endpoint completo
                await reclutadoresService.updateReclutador(id as string, reclutador);
            }else{
                // Usuario normal usa el endpoint de user-update
                await reclutadoresService.updateReclutadorByUser(id as string, reclutador);
            }
            setSuccess('Reclutador actualizado correctamente');
         }else{
            // Si es creacion
            if(isAdmin){
                //Admin crea normalmente
                await reclutadoresService.createReclutador(reclutador);
            }else{
                // Usuario usa el endpoint de crear con candidatura
                await reclutadoresService.createReclutadorWithCandidatura(reclutador);
            }
            setSuccess('Reclutador creado correctamente');
         }
         
         // Esperar un momento para mostrar el mensaje de exito
         setTimeout(() => {
            navigate('/reclutadores');
         }, 1500);
        } catch (err: any) {
            console.error('Error al guardar reclutador:', err);

            let errorMessage = 'Error al guardar los datos del reclutador.';

            if(err.response){
                if(err.response.status === 403){
                    errorMessage = 'No tienes permisos para realizar esta accion.';
                }else if(err.response.data?.message){
                    errorMessage = err.response.data.message;
                }else if(err.response.data?.error?.message){
                    errorMessage = err.response.data.error.message;
                }
            }

            setError(errorMessage);
        }finally{
            setSaving(false);
        }
    };

    // Mostrar spinner mientras cargan los datos
    if(loading){
        return (
            <Box sx={{ display:'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
        }}>
            <Box sx={{
                    maxWidth: '800px',
                    width: '100%',
                    mx:'auto',
                    p:2
                }}>
                    <Box sx={{ mb:3, display:'flex', alignItems:'center'}}>
                        <IconButton
                            color="primary"
                            onClick={() => navigate('/reclutadores')}
                            sx={{mr:1}}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h4" component="h1">
                            {isEdit? 'Editar Reclutador' : 'Nuevo Reclutador'}
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{mb: 3}}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{mb: 3}}>
                            {success}
                        </Alert>
                    )}

                    <Paper sx={{p:3}}>
                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display:'flex', flexDirection: 'column', gap: 3 }}>
                                {/* Campo Nombre */}
                                <TextField
                                    required
                                    fullWidth
                                    id="nombre"
                                    name="nombre"
                                    label="Nombre del reclutador"
                                    value={reclutador.nombre}
                                    onChange={handleChange}
                                    variant="outlined"
                                    disabled={saving}
                                    error={!!validationErrors.nombre}
                                    helperText={validationErrors.nombre}
                                />

                                {/* Campo Empresa */}
                                <FormControl
                                    fullWidth
                                    required
                                    error={!!validationErrors.empresaId}
                                >
                                    <InputLabel id="empresa-label">Empresa</InputLabel>
                                    <Select
                                        labelId="empresa-label"
                                        id="empresaId"
                                        name="empresaId"
                                        value={reclutador.empresaId}
                                        label="Empresa"
                                        onChange={handleSelectChange}
                                        disabled={saving || loadingEmpresas}
                                    >
                                        {loadingEmpresas ? (
                                            <MenuItem value="" disabled>
                                                Cargando empresas...
                                            </MenuItem>
                                        ) : (
                                            empresas.map((empresa) => (
                                                <MenuItem key={empresa.id} value={empresa.id}>
                                                    {empresa.nombre}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                    {validationErrors.empresaId && (
                                        <FormHelperText>{validationErrors.empresaId}</FormHelperText>
                                    )}
                                </FormControl>

                                {/* Campo LinkedIn URL */}
                                <TextField 
                                    fullWidth
                                    id="linkinUrl"
                                    name="linkinUrl"
                                    label="URL de LinkedIn"
                                    value={reclutador.linkinUrl}
                                    onChange={handleChange}
                                    variant="outlined"
                                    placeholder="https://www.linkedin.com/in/perfil"
                                    disabled={saving}
                                    error={!!validationErrors.linkinUrl}
                                    helperText={validationErrors.linkinUrl || 'Ejemplo: https://www.linkedin.com/in/perfil'}
                                />

                                {/* Botones de accion */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap:2, mt:2 }}>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() =>navigate('/reclutadores')}
                                        startIcon={<CancelIcon />}
                                        disabled={saving}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<SaveIcon />}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <CircularProgress size={24} color="inherit" sx={{mr:1}} />
                                                Guardando...
                                            </>
                                        ) : (
                                            isEdit ? 'Actualizar Reclutador' : 'Crear Reclutador'
                                        )}
                                    </Button>
                                </Box>
                            </Box>
                        </form>
                    </Paper>
                </Box>
        </Box>
    );
};

export default ReclutadorForm;