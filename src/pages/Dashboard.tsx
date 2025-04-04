import { Box, Button, Card, CardContent, LinearProgress, Paper, Typography, useTheme } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pendientes: 0,
        entrevistas: 0,
        aceptadas: 0,
        rechazadas: 0
    });
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        // En un caso real obtendriamos datos de API
        // Simulacion de carga de datos
        const loadData = async () => {
            try{
                // Comentado hasta tener la API real
                // const response = await apiService.get('/api/candidaturas/stats');
                // setStats(response);

                // Datos simulados
                setTimeout(() => {
                    setStats({
                        total: 12,
                        pendientes: 2,
                        entrevistas: 5,
                        aceptadas: 2,
                        rechazadas: 3
                    });
                    setLoading(false);
                }, 1000);
            }catch (error){
                console.error('Error al cargar estadisticas', error);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleCreateCandidatura = () => {
        navigate('/candidaturas/new');
    };

    // Tarjeta de estadisticas con colores especificos
    const statCards = [
        {
            title: 'Candidaturas',
            value: stats.total,
            color: theme.palette.primary.main,
            description: 'Total de candidaturas'
        },
        {
            title: 'Entrevistas',
            value: stats.entrevistas,
            color: theme.palette.info.main,
            description: 'Candidaturas con entrevistas'
        },
        {
            title: 'Aceptadas',
            value: stats.aceptadas,
            color: theme.palette.success.main,
            description: 'Candidaturas aceptadas'
        },
        {
            title: 'Rechazadas',
            value: stats.rechazadas,
            color: theme.palette.error.main,
            description: 'Candidaturas rechazadas'
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Dashboard
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon= {<AddIcon />}
                    onClick={handleCreateCandidatura}
                >
                    Nueva Candidatura
                </Button>
            </Box>

            {loading ? (
                <LinearProgress sx={{ my: 4 }} />
            ) : (
                <>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',      // una Columna en moviles
                        sm: 'repeat(2, 1fr)', // dos columnas en tabletas
                        md: 'repeat(4, 1fr)', // cuatro columnas en desktops
                    },
                    gap: 3,
                    mb:4
                }}>
                    {statCards.map((card) =>(
                        <Card key={card.title} elevation={2} sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle1" sx={{ color: card.color, fontWeight: 500 }}>
                                    {card.title}
                                </Typography>
                                <Typography variant="h3" component="div" sx={{ my: 1 }}>
                                    {card.value}
                                </Typography>
                                <Typography variant="body2" color= 'text.secondary'>
                                    {card.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Candidaturas Recientes
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                        {/* Aqui iria una tabla o lista de candidaturas recientes */}
                        <Typography variant="body2" color="text.secondary" sx={{ py:2, textAlign:'center' }}>
                            Proximamente: Lista de candidaturas recientes
                        </Typography>
                    </Paper>
                </Box>
                </>
            )}
        </Box>
    );
};

export default Dashboard;