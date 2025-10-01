import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 🚨 Importamos los componentes
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

import EmpleadoCreationForm from './pages/admin/CreateEmployeeForm.jsx'; 

function App() {
    return (
        <Router>
            <Routes>
                {/* Ruta de entrada (Pública) */}
                <Route path="/" element={<HomePage />} />
                
                {/* Ruta de Login (Pública) */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Rutas Protegidas: Usan PrivateRoute */}
                <Route element={<PrivateRoute />}>
                    {/* Ruta del Panel de Control principal */}
                    <Route path="/dashboard" element={<DashboardPage />} />
                    
                    {/* Nueva Ruta de Creación de Empleados (accesible desde el dashboard) */}
                    <Route path="/dashboard/empleados/crear" element={<EmpleadoCreationForm />} />
                </Route>

                {/* Ruta de 404 */}
                <Route path="*" element={<h1 style={{marginTop: '100px'}}>404 - Página no encontrada</h1>} />
            </Routes>
        </Router>
    );
}

export default App;
