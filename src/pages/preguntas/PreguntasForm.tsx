import useAuthStore from "@/store/authStore";
import { Pregunta, PreguntaDTO } from "@/types";
import React, { useEffect, useState } from "react";
import preguntasService from "@/services/preguntasService";
import { Box, Button, IconButton, List, ListItem, Paper, Typography, Checkbox, CircularProgress, Alert, ListItemIcon, ListItemText, ListItemSecondaryAction, TextField } from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    QuestionAnswer as QuestionIcon
 } from "@mui/icons-material";

interface PreguntasFormProps{
    candidaturaId: string;
    onPreguntasChange?: (preguntas: PreguntaDTO[]) => void;
    editable?: boolean;
}

const PreguntasForm: React.FC<PreguntasFormProps> = ({
    candidaturaId,
    onPreguntasChange,
    editable = true
}) => {
    const [preguntas, setPreguntas] = useState<PreguntaDTO[]>([{candidaturaId: candidaturaId || '', pregunta: ''}]);
    const [existingPreguntas, setExistingPreguntas] = useState<Pregunta[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<string[]>([]);
    const [showDelete, setShowDelete] = useState<boolean>(false);

    const { user } = useAuthStore();
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'ROOT');

    // Cargar preguntas existentes si estamos en modo edición
    useEffect(() => {
        if (candidaturaId) {
        fetchExistingPreguntas();
        }
    }, [candidaturaId]);

    const fetchExistingPreguntas = async () => {
        if (!candidaturaId) return;
        
        setLoading(true);
        setError(null);
        
        try {
        const response = await preguntasService.getPreguntasByCandidatura(candidaturaId);
        setExistingPreguntas(response.content || []);
        } catch (err: any) {
        console.error('Error al cargar preguntas:', err);
        setError('No se pudieron cargar las preguntas existentes');
        } finally {
        setLoading(false);
        }
    };

    //Agregar campo para nueva pregunta
    const handleAddPregunta = () => {
        const newPreguntas = [...preguntas, { candidaturaId: candidaturaId || '', pregunta: ''}];
        setPreguntas(newPreguntas);

        if(onPreguntasChange){
            onPreguntasChange(newPreguntas);
        }
    };

    // Remover campo de pregunta
    const handleRemovePreguntas = (index: number) => {
        const newPreguntas = preguntas.filter((_, i) => i !== index);
        setPreguntas(newPreguntas);

        if(onPreguntasChange){
            onPreguntasChange(newPreguntas);
        }
    };

    // Actualizar valor de pregunta
    const handlePreguntaChange = (index: number, value: string) => {
        const newPreguntas = [...preguntas];
        newPreguntas[index].pregunta = value;
        setPreguntas(newPreguntas);

        if(onPreguntasChange){
            onPreguntasChange(newPreguntas);
        }
    };

    //Manejar selección de preguntas existentes para eliminar
    const handleToggleSelect = (id:string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];

        if(selectedIndex === -1){
            newSelected = [...selected, id];
        }else{
            newSelected = selected.filter(itemId => itemId !== id);
        }

        setSelected(newSelected);
        setShowDelete(newSelected.length > 0);
    };

    // Verificar si una pregunta está seleccionada
    const isSelected = (id: string) => selected.indexOf(id) !== -1;

    // Eliminar preguntas seleccionadas
    const handleDeleteSeleceted = async () => {
        if(selected.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            await preguntasService.deletePreguntasBatch(selected);
            //Recargar las preguntas
            fetchExistingPreguntas();
            setSelected([]);
            setShowDelete(false);
        } catch (err: any) {
            console.error('Error al eliminar preguntas', err);
            setError('No se pudieron eliminar las preguntas seleccionadas');
        }finally{
            setLoading(false);
        }
    };

    // Eliminar una sola pregunta
    const handleDeletePregunta = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            await preguntasService.deletePregunta(id);
            // Recarga las preguntas
            fetchExistingPreguntas();
        } catch (err: any) {
            console.error('Error al eliminar pregunta.', err);
            setError('No se pudo eliminar la pregunta.');
        }finally{
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Preguntas de entrevista
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2}}>
                    {error}
                </Alert>
            )}

            {/* Preguntas existentes */}
            {loading ? (
                <Box  sx={{ display: 'flex', justifyContent: 'center', my: 2}}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                existingPreguntas.length > 0 && (
                    <Paper sx={{ mb:3, maxHeight: 300, overflow: 'auto'}}>
                        <List dense>
                            {showDelete && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p:1}}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleDeleteSeleceted}
                                    >
                                        Eliminar ({selected.length})
                                    </Button>
                                </Box>
                            )}
                            {existingPreguntas.map((pregunta) => {
                                const isItemSelected = isSelected(pregunta.id);
                                return (
                                    <ListItem key={pregunta.id} dense>
                                        {editable && (
                                            <ListItemIcon>
                                                <Checkbox 
                                                    edge="start"
                                                    checked={isItemSelected}
                                                    onChange={() => handleToggleSelect(pregunta.id)}
                                                    tabIndex={-1}
                                                    disableRipple
                                                />
                                            </ListItemIcon>
                                        )}
                                        <ListItemIcon>
                                            <QuestionIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={pregunta.pregunta}
                                            secondary={`Creada por: ${pregunta.usuario?.username || 'Usuario'}`}
                                        />
                                        {editable && !isItemSelected && (
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    onClick={() => handleDeletePregunta(pregunta.id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        )}
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Paper>
                )
            )}

            {editable && (
                <>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddPregunta}
                        sx={{ mt:1}}
                    >
                        Agregar pregunta
                    </Button>
                    
                    <Typography variant="subtitle2" gutterBottom>
                        Agregar nuevas preguntas:
                    </Typography>

                    

                    {preguntas.map((pregunta, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                mb:2,
                                gap: 1
                            }}
                        >
                            <QuestionIcon sx={{ mt:2, color: 'text.secondary'}} />
                            <TextField
                                fullWidth
                                label={`Pregunta ${index + 1}`}
                                placeholder="Escribe una pregunta para esta candidatura"
                                variant="outlined"
                                multiline
                                rows={2}
                                value={pregunta.pregunta}
                                onChange={(e) => handlePreguntaChange(index, e.target.value)}
                            />
                            <IconButton
                                sx={{ mt:1}}
                                size="small"
                                onClick={() => handleRemovePreguntas(index)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                    
                </>
            )}
        </Box>
    );
 };
 export default PreguntasForm;
