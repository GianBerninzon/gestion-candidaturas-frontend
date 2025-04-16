import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { Person as PersonIcon,
     Business as BusinessIcon, 
     Menu as MenuIcon, 
     Dashboard as DashboardIcon, 
     Description as DescriptionIcon,
     ExitToApp as LogoutIcon
    } from "@mui/icons-material";
import { AppBar, Box, CssBaseline, Divider, Drawer, 
    IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, 
    useTheme
} from "@mui/material";
import { alpha, useMediaQuery } from "@mui/system";


const drawerWidth = 220;

const MainLayout: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();

    // Usar el tema correctamente
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon /> ,path: '/' },
        { text: 'Candidaturas', icon: <DescriptionIcon />, path: '/candidaturas' },
        { text: 'Empresas', icon: <BusinessIcon />, path: '/empresas' },
        { text: 'Reclutadores', icon: <PersonIcon />, path: '/reclutadores' },
    ];

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    Gestion Candidaturas
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItemButton 
                        key={item.text}
                        onClick={() => {
                            navigate(item.path);
                            if (isMobile) setMobileOpen(false);
                        }}
                        sx={{
                            py:1,
                            '&.Mui-selected':{
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderLeft: `4px solid ${theme.palette.primary.main}`,
                            },
                            '&:hover':{
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                            },
                            borderLeft: `4px solid transparent`,
                            // Destacar el item seleccionado basado en la ruta actual
                            ...(window.location.pathname === item.path ||
                                (item.path !== '/' && window.location.pathname.startsWith(item.path)) ? {
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                                } : {}
                            )
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItemButton>
                ))}
            </List>
            <Divider />
            <List>
                <ListItemButton 
                    onClick={handleLogout}
                    sx={{ py: 1 }}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Cerrar Sesión" />
                </ListItemButton>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        { user?.username ?  `Hola, ${user.username}` : 'Gestion de Candidaturas' }
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                {/* Drawer para moviles */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Mejor Rendimiento en moviles
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-praper': { boxSizing:'border-box', width: drawerWidth, bgcolor: 'Background.paper' },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Drawer para tablet/desktop */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider'},
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: '64px', //Altura del AppBar
                    minHeight: '100vh',
                    p: { xs: 1, sm: 2, md: 3},
                    pt: {xs: 9, sm:10},
                    bgcolor: theme.palette.background.default
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;