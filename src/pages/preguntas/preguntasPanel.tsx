import preguntasService from "@/services/preguntasService";
import useAuthStore from "@/store/authStore";
import { Pregunta } from "@/types";
import { Alert, Box, Button, Card, CardContent, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItem, Pagination, Paper, Typography } from "@mui/material";
import {
    Add as AddIcon,
    Person as PersonIcon,
    Delete as DeleteIcon,
    QuestionAnswer as QuestionIcon
} from "@mui/icons-material";
import React, { useEffect, useState } from "react";

interface PreguntasPanelProps{
    candidaturaId: string;
    onAddClick?: () => void;
    editable?: boolean;
}

const PreguntasPanel: React.FC<PreguntasPanelProps> = ({
    candidaturaId,
    onAddClick,
    editable = false
}) => {
    const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [totalPage, setTotalPage] = useState<number>(1);
    const [count, setCount] = useState<number>(0);
    const [pageSize] = useState<number>(5);
    const [selected, setSelected] = useState<string[]>([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
    const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);

    const {user} = useAuthStore();
    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'ROOT');
    const canEdit = editable || isAdmin;

    // Cargar preguntas cuando cambia la página o el ID de candidatura
    useEffect(() => {
        fetchPreguntas();
    }, [candidaturaId, page]);

    // Cargar el conteo total de preguntas
    useEffect(() => {
        fetchPreguntasCount();
    }, [candidaturaId]);

    const fetchPreguntasCount = async () => {
        if(!candidaturaId) return;

        try {
            const totalCount = await preguntasService.getCountByCandidatura(candidaturaId);
            setCount(totalCount);
            setTotalPage(Math.max(1, Math.ceil(totalCount / pageSize)));
        } catch (error) {
            console.error('Error al obtener el conteo de preguntas:', error);
        }
    };

    const fetchPreguntas = async () => {
        if(!candidaturaId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await preguntasService.getPreguntasByCandidatura(
                candidaturaId,
                page,
                pageSize
            );
            setPreguntas(response.content || []);

            // Actualizar total de páginas basado en la respuesta
            if(response.totalPages){
                setTotalPage(response.totalPages);
            }

            if(response.totalElements){
                setCount(response.totalElements);
            }
        } catch (err: any) {
            console.error('Error al cargar preguntas:', err);
            let erroMsg = 'Error al cargar las preguntas de entrevista.';

            if(err.response?.data?.message){
                erroMsg = err.response.data.message;
            }else if(err.message){
                erroMsg = err.message;
            }

            setError(erroMsg);
        }finally{
            setLoading(false);
        }
    };

    const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleToggleSelect = (id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];

        if(selectedIndex === - 1){
            newSelected = [...selected, id];
        }else{
            newSelected = selected.filter((itemId) => itemId !== id);
        }

        setSelected(newSelected);
    };

    const handleSelectAll = () => {
        if(selected.length === preguntas.length){
            setSelected([]);
        }else{
            setSelected(preguntas.map(p => p.id));
        }
    };

    const handleDeleteClick = () => {
        if(selected.length > 0){
            setOpenDeleteDialog(true);
        }
    };

    const handleDeleteConfirm = async () => {
        if(selected.length === 0 ){
            setOpenDeleteDialog(true);
            return;
        };

        setLoading(true);

        try {
            await preguntasService.deletePreguntasBatch(selected);
            setDeleteSuccess(true);
            setSelected([]);

            //Refrescar datos
            await fetchPreguntasCount();
            await fetchPreguntas();
        } catch (err: any) {
            console.error('Error al eliminar preguntas:', err);
            let errorMsg = 'Error al eliminar las preguntas seleccionadas.';

            if(err.response?.data?.message){
                errorMsg = err.response.data.message;
            }else if(err.message){
                errorMsg = err.message;
            }

            setError(errorMsg);
        }finally{
            setLoading(false);
            setOpenDeleteDialog(false);
        }
    };
    
    const handleAddPregunta = () => {
        if(onAddClick){
            onAddClick();
        }
    };

    const isSelected = (id: string) => selected.indexOf(id) !== -1;

    return (
        <Card sx={{ mt: 3, width: '100%'}}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                    <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center'}}>
                        <QuestionIcon sx={{ mr: 1}} />
                        Preguntas de Entrevistas ({count})
                    </Typography>

                    {canEdit && (
                        <Box>
                            {selected.length > 0 && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDeleteClick}
                                    sx={{mr:1}}
                                >
                                    Eliminar ({selected.length})
                                </Button>
                            )}

                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={handleAddPregunta}
                            >
                                Agregar Pregunta
                            </Button>
                        </Box>
                    )}
                </Box>

                <Divider sx={{ mb: 2}} />

                {deleteSuccess && (
                    <Alert severity="success" sx={{ mb: 2}}>
                        Preguntas eliminadas correctamente
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2}}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', p:3}}>
                        <CircularProgress />
                    </Box>
                ) : preguntas.length > 0 ? (
                    <>
                        {canEdit && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1}}>
                                <Button
                                    size="small"
                                    onClick={handleSelectAll}
                                >
                                    {selected.length === preguntas.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                                </Button>
                            </Box>
                        )}

                        <List sx={{ width: '100%'}}>
                            {preguntas.map((pregunta) => {
                                const isItemSelected = isSelected(pregunta.id);
                                return (
                                    <Paper
                                        key={pregunta.id}
                                        elevation={1}
                                        sx={{
                                            mb:2,
                                            p:2,
                                            borderLeft: isItemSelected ? '4px solid' : 'none',
                                            bgcolor: isItemSelected ? 'action.selected' : 'background.paper'
                                        }}
                                    >
                                        <ListItem
                                            disableGutters
                                            secondaryAction={
                                                canEdit && (
                                                    <Checkbox
                                                        edge="end"
                                                        checked={isItemSelected}
                                                        onChange={() => handleToggleSelect(pregunta.id)}
                                                        inputProps={{ 'aria-labelledby' : `pregunta-${pregunta.id}`}}
                                                    />
                                                )
                                            }
                                        >
                                            <Box sx={{ width: '100%'}}>
                                                <Typography
                                                    variant="body1"
                                                    id={`pregunta-${pregunta.id}`}
                                                    sx={{ fontWeight: isItemSelected ? 'bold':'normal'}}
                                                >
                                                    {pregunta.pregunta}
                                                </Typography>

                                                <Box sx={{ display:'flex', alignItems:'center', mt:1}}>
                                                    <PersonIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5}} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {pregunta.usuario?.username || 'Usuario'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </ListItem>
                                    </Paper>
                                );
                            })}
                        </List>
                        {totalPage > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2}}>
                                <Pagination 
                                    count={totalPage}
                                    page={page}
                                    onChange={handleChangePage}
                                    color="primary"
                                    size="small"
                                />
                            </Box>
                        )}
                    </>
                ): (
                    <Alert severity="info">
                        No hay preguntas de entrevista registradas para esta candidatura.
                    </Alert>
                )}
            </CardContent>

            {/* Diálogo de confirmación para eliminar */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
            >
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                ¿Estás seguro de que deseas eliminar {selected.length} {selected.length === 1 ? 'pregunta' : 'preguntas'}? Esta acción no se puede deshacer.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>Eliminar</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default PreguntasPanel;