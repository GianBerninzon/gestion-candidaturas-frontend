import useAuthStore from "@/store/authStore";
import { Person as PersonIcon,
     Business as BusinessIcon, 
     Menu as MenuIcon, 
     Dashboard as DashboardIcon, 
     Description as DescriptionIcon,
     ExitToApp as LogoutIcon
    } from "@mui/icons-material";
import { AppBar, Box, Container, CssBaseline, Divider, Drawer, 
    IconButton, List, ListItemButton, ListItemIcon, ListItemText, Theme, Toolbar, Typography 
} from "@mui/material";
import { useMediaQuery } from "@mui/system";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const drawerWidth = 240;

const MainLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

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
                    <ListItemButton key={item.text} onClick={() => {
                        navigate(item.path);
                        if (isMobile) setMobileOpen(false);
                    }}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItemButton>
                ))}
            </List>
            <Divider />
            <List>
                <ListItemButton onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
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
                    bgcolor: 'primary.main',
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
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Mejor Rendimiento en moviles
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-praper': { boxSizing:'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth},
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
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: '64px', //Altura del AppBar
                    backgroundColor: 'background.default',
                    minHeight: '100vh',
                }}
            >
                <Container maxWidth="lg">
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
};

export default MainLayout;