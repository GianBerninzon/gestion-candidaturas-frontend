import useAuthStore from '@/store/authStore';
import { JSX, lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import EmpresasList from '../pages/empresas/EmpresasList';
import ReclutadorForm from '@/pages/reclutadores/ReclutadorForm';


// Componentes de carga
const Loading = () => <div>Cargando...</div>

// Layouts
const MainLayout = lazy(() => import('../MainLayout'));

// Paginas de autenticacion
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));

//Paginas principales
const Dashboard = lazy(() => import('../pages/Dashboard'));

// Paginas de candidaturas
const CandidaturasList = lazy(() => import('../pages/candidaturas/CandidaturasList'));
const CandidaturaDetail = lazy(() => import('../pages/candidaturas/CandidaturaDetail'));
const CandidaturaForm = lazy(() => import('../pages/candidaturas/CandidaturaFormFinal'));

{/* Rutas para empresas */}
const EmpresaForm = lazy(() => import('../pages/empresas/EmpresaForm'));
const EmpresaDetail = lazy(() => import('../pages/empresas/EmpresaDetail'));
//const EmpresasList = lazy(() => import('../pages/empresas/EmpresasList'));


// Paginas de reclutadores
const ReclutadoresList = lazy(() => import('../pages/reclutadores/ReclutadoresList'));
const ReclutadorDetail = lazy(() => import('../pages/reclutadores/ReclutadorDetail'));

// Pagina 404
const NotFound = lazy(() => import('../pages/NotFound'));

//Componenete que verifica si el usuario esta autenticado
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<Loading />}>
                <Routes>
                    {/* Rutas publicas*/}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Rutas protegidas */}
                    <Route path="/" element={
                        <PrivateRoute>
                            <MainLayout />
                        </PrivateRoute>
                    }>
                        <Route index element={<Dashboard />} />
                            {/* Rutas de candidaturas */}
                            <Route path="candidaturas"> 
                                <Route index element={<CandidaturasList />} />
                                <Route path="new" element={<CandidaturaForm />} />
                                <Route path=":id" element={<CandidaturaDetail />} />
                                <Route path=":id/edit" element={<CandidaturaForm />} />
                            </Route>

                            {/* Ruta de empresas */}
                            <Route path="empresas">
                                <Route index element={<EmpresasList />} />
                                <Route path="new" element={<EmpresaForm />} />
                                <Route path=":id" element={<EmpresaDetail />} />
                                <Route path=':id/edit' element={<EmpresaForm />} />
                            </Route>

                            {/* Rutas de reclutadores */}
                            <Route path="reclutadores">
                                <Route index element={<ReclutadoresList />} />
                                <Route path="new" element={<ReclutadorForm />} />
                                <Route path=":id" element={<ReclutadorDetail />} />
                                <Route path=":id/edit" element={<ReclutadorForm />} />
                            </Route>
                        </Route>

                        {/* Ruta 404 */}
                        <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default AppRoutes;