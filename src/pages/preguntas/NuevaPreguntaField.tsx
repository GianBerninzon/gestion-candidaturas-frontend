import { PreguntaDTO } from "@/types";
import React, { useState } from "react";
import preguntasService from "@/services/preguntasService";
import { Alert, Box, Button, CircularProgress, TextField } from "@mui/material";
import { Add as AddIcon, QuestionAnswer as QuestionIcon } from "@mui/icons-material";

interface NuevaPreguntaFieldProps {
    candidaturaId: string;
    onPreguntaCreated?: () => void;
}

const NuevaPreguntaField: React.FC<NuevaPreguntaFieldProps> = ({
    candidaturaId,
    onPreguntaCreated
}) => {
    const [pregunta, setPregunta] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();

        if(!pregunta.trim()){
            setError('La Pregunta no puede estar vacía');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const nuevaPregunta: PreguntaDTO = {
                candidaturaId,
                pregunta: pregunta.trim()
            };
            
            await preguntasService.createPregunta(nuevaPregunta);
            
            // Cerrar diálogo y limpiar
            setPregunta('');
            setSuccess(true);

            //Llamar al callback
            if(onPreguntaCreated){
                onPreguntaCreated();
            }

            //Ocultar mensaje de éxito después de 3 segundos
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
            
        } catch (err: any) {
            console.error('Error al guardar la pregunta:', err);
            let erroMsg = 'Error al guardar la pregunta.';

            if(err.response?.data.message){
                erroMsg = err.response.data.message;
            }else if (err.message){
                erroMsg = err.message;
            }

            setError(erroMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2}}>
            {error && (
                <Alert severity="error" sx={{ mb: 2}}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2}}>
                    Pregunta guardada exitosamente.
                </Alert>
            )}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap:1}}>
                <QuestionIcon sx={{ mt:2, color: 'text.secondary'}} />
                <TextField
                    fullWidth
                    label="Nueva Pregunta"
                    placeholder="Escribe una pregunta de entrevista..."
                    variant="outlined"
                    multiline
                    rows={2}
                    value={pregunta}
                    onChange={(e) => setPregunta(e.target.value)}
                    disabled={loading}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || !pregunta.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                    sx={{ mt: 1, minWidth: '120px' }}
                >
                    {loading ? 'Guardando...' : 'Guardar'}
                </Button>
            </Box>
        </Box>
    );
};

export default NuevaPreguntaField;


