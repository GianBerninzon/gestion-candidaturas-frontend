import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CandidaturasList from './pages/candidaturas/CandidaturasList';
import AuthDebugger from './components/AuthDebugger';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './MainLayout';
import { Dashboard } from '@mui/icons-material';
import CandidaturaForm from './pages/candidaturas/CandidaturaForm';
import CandidaturaDetail from './pages/candidaturas/CandidaturaDetail';

// Importaciones para Material UI Theme
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import EmpresasList from './pages/empresas/EmpresasList';
import EmpresaForm from './pages/empresas/EmpresaForm';
import EmpresaDetail from './pages/empresas/EmpresaDetail';
import ReclutadoresList from './pages/reclutadores/ReclutadoresList';
import ReclutadorForm from './pages/reclutadores/ReclutadorForm';
import ReclutadorDetail from './pages/reclutadores/ReclutadorDetail';
import { ToastContainer } from 'react-toastify';

function App() {
  const isDev = import.meta.env.DEV;

  // Crear el tema de Material UI
  const theme = createTheme({
    palette: {
      mode: 'light', // 'light' or 'dark'
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e', //color secundario - rosa por defecto
      },
      background: {
        default: '#f5f5f5', //color de fondo claro
        paper: '#ffffff', //color de para las tarjetas/papers
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSysteamFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(', '),
    },
    components: {
      // Personalizaciones de componentes 
      MuiButton: {
        styleOverrides: {
          root:{
            borderRadius: 4,
          },
        },
      },
    },
  });

  return (
    // Envolver toda la aplicacion con el ThemeProvider
    <ThemeProvider theme={theme}>
      {/* CssBaseline normaliza los estilos base */}
      <CssBaseline />
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          {/* Rutas Publicas */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Rutas Protegidas dentro del MainLayout */}
          <Route path="/" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <MainLayout />
              </ErrorBoundary>
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            {/* Rutas de candidaturas */}
            <Route path="candidaturas" element={<CandidaturasList />} />
            <Route path="candidaturas/new" element={<CandidaturaForm />} />
            <Route path="candidaturas/:id" element={<CandidaturaDetail />} />
            <Route path="candidaturas/:id/edit" element={<CandidaturaForm />} />

            {/* Rutas de empresas */}
            <Route path="empresas">
              <Route index element={<EmpresasList />} />
              <Route path="new" element={<EmpresaForm />} />
              <Route path=":id" element={<EmpresaDetail />} />
              <Route path=":id/edit" element={<EmpresaForm />} />
            </Route>

            {/* Rutas de reclutadores */}
            <Route path="reclutadores">
              <Route index element={<ReclutadoresList />} />
              <Route path="new" element={<ReclutadorForm />} />
              <Route path=":id" element={<ReclutadorDetail />} />
              <Route path=":id/edit" element={<ReclutadorForm />} />
            </Route>

            {/* Redireccion global para rutas no encontradas dentro del área autenticada */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* Redireccion global para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Mostrar el depurador solo en desarrollo */}
        {isDev && <AuthDebugger />}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App
