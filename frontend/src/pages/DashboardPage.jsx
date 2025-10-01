import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import '../styles/DashboardPage.css';
import logoImage from '../assets/logo.jpg'; 

const DashboardPage = () => {
    // ESTADO AÑADIDO PARA ROLES
    const [userRoles, setUserRoles] = useState([]);

    const [summaryData, setSummaryData] = useState({
        ingresos_mes: '$0.00',
        alquileres_activos: 0,
        pedidos_pendientes: 0,
        incidentes_abiertos: 0,
    });
    const [message, setMessage] = useState('Cargando datos protegidos...');
    const [username, setUsername] = useState('Administrador');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username_login'); 
        navigate('/login');
    };

    // Carga de Datos y Autenticación
    useEffect(() => {
        const storedUsername = localStorage.getItem('username_login') || 'Administrador';
        setUsername(storedUsername);

        const fetchProtectedData = async () => {
            try {
                // (Validación de Token y ROLES)
                const userInfoResponse = await api.get('user/info/'); 
                const userDisplayName = userInfoResponse.data.username;
                const roles = userInfoResponse.data.roles; // obtenemos los roles
                
                setUsername(userDisplayName); 
                setUserRoles(roles); //gguardamos los roles en el estado
                localStorage.setItem('username_login', userDisplayName);
                
                const displayName = userDisplayName.includes('@') ? userDisplayName.split('@')[0] : userDisplayName;
                setMessage(`¡Bienvenid@ ${displayName}! Has accedido a una ruta segura con éxito.`);

                // 2. OBTENER DATOS DEL DASHBOARD
                const summaryResponse = await api.get('dashboard/summary/');
                
                const formattedIngresos = new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS', 
                }).format(summaryResponse.data.ingresos_mes);

                setSummaryData({
                    ingresos_mes: formattedIngresos,
                    alquileres_activos: summaryResponse.data.alquileres_activos,
                    pedidos_pendientes: summaryResponse.data.pedidos_pendientes,
                    incidentes_abiertos: summaryResponse.data.incidentes_abiertos,
                });
                
            } catch (error) {
                console.error('Error al cargar datos:', error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                   handleLogout(); 
                }
            }
        };

        fetchProtectedData();
    }, [navigate]); 

    // Lógica para determinar si el usuario es Admin.
    const isAdmin = userRoles?.includes('Admin'); 
    // Lógica para determinar si el usuario es Empleado
    const isEmployee = userRoles?.includes('Empleado');
    

    // Ítems de gestión (Menú inferior)
    let entityItems = [
        { name: "Alquileres", path: "/rentals" },
        { name: "Entregas", path: "/deliveries" },
        { name: "Pedidos", path: "/orders" },
        { name: "Clientes", path: "/clients" },
        { name: "Caja", path: "/cashregister"},
        { name: "Facturas", path: "/invoices" },
        { name: "Pagos", path: "/payments" },
    ];

    return (
        <div className="dashboard-layout">
            
            {/* -------------------- SIDEBAR (Menú Lateral) -------------------- */}
            <div className="sidebar">
                
                <div className="sidebar-header">
                    <img src={logoImage} alt="HP Logo" className="sidebar-logo"/>
                </div>

                {/* MENÚ PARA ADMINISTRADORES (TODOS LOS ENLACES) */}
                {isAdmin && (
                    <>
                        <nav className="sidebar-menu">
                            <Link to="/dashboard" className="menu-item current">📦 Panel de Control</Link>
                            <Link to="/dashboard/empleados/crear" className="menu-item">👨‍💼 Empleados</Link>
                            <Link to="/roles" className="menu-item">🔑 Roles</Link>
                            <Link to="/products" className="menu-item">🏷️ Productos</Link>
                            <Link to="/incidents" className="menu-item">⚠️ Incidentes</Link>
                        </nav>
                        <div className="sidebar-section">
                            <p className="section-title">Menú de gestión</p>
                            {entityItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="menu-item entity-item"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {/* MENÚ PARA EMPLEADOS (SÓLO CIERTOS ENLACES) */}
                {isEmployee && (
                    <>
                        <nav className="sidebar-menu">
                            <Link to="/dashboard" className="menu-item current">📦 Panel de Control</Link>
                            <Link to="/products" className="menu-item">🏷️ Productos</Link>
                            <Link to="/incidents" className="menu-item">⚠️ Incidentes</Link>
                        </nav>
                        <div className="sidebar-section">
                            <p className="section-title">Menú de gestión</p>
                            <Link to="/rentals" className="menu-item entity-item">Alquileres</Link>
                            <Link to="/orders" className="menu-item entity-item">Pedidos</Link>
                            <Link to="/invoices" className="menu-item entity-item">Facturas</Link>
                            <Link to="/payments" className="menu-item entity-item">Pagos</Link>
                        </div>
                    </>
                )}
                
                {/* Botón de Cerrar Sesión (funcional) */}
                <button onClick={handleLogout} className="logout-button-sidebar">
                    ← Cerrar Sesion
                </button>
            </div>
            
            {/* -------------------- CONTENIDO PRINCIPAL -------------------- */}
            <main className="main-content">
                <header className="dashboard-header">
                    <div className="user-profile">
                        {/* Mostramos el email/username del usuario */}
                        <p className="admin-email">{username} ({isAdmin ? 'Admin' : 'Empleado'})</p> 
                        <span className="admin-icon">👤</span>
                    </div>
                </header>
                
                {/* Título Principal y Subtítulo */}
                <h2 className="main-dashboard-title">Panel de control</h2>
                <p className="subtitle">Resumen ejecutivo del estado de su negocio</p>
                
                {/* Resumen de Cajas (KPIs) - Mostramos solo si es Admin */}
                {isAdmin && (
                    <div className="dashboard-summary">
                        {/* 1. INGRESOS DEL MES */}
                        <div className="summary-box ingresos">
                            <span className="icon">$</span>
                            <p>Ingresos del Mes</p>
                            <p className="value">{summaryData.ingresos_mes}</p> 
                        </div>
                        {/* 2. ALQUILERES ACTIVOS */}
                        <div className="summary-box alquileres">
                            <span className="icon">🗓️</span>
                            <p>Alquileres Activos</p>
                            <p className="value">{summaryData.alquileres_activos}</p> 
                        </div>
                        {/* 3. PEDIDOS PENDIENTES */}
                        <div className="summary-box pedidos">
                            <span className="icon">📝</span>
                            <p>Pedidos Pendientes</p>
                            <p className="value">{summaryData.pedidos_pendientes}</p> 
                        </div>
                        {/* 4. INCIDENTES ABIERTOS */}
                        <div className="summary-box incidentes">
                            <span className="icon">⚠️</span>
                            <p>Incidentes Abiertos</p>
                            <p className="value">{summaryData.incidentes_abiertos}</p> 
                        </div>
                    </div>
                )}
                
                {/* Texto corregido para la vista del empleado */}
                {isEmployee && (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mt-4 rounded-lg" role="alert">
                        <p className="font-bold">Vista de Empleado</p>
                        <p>Tu vista está optimizada para la gestión de productos, incidentes, alquileres, pedidos, facturas y pagos. Las métricas financieras y de administración no son visibles.</p>
                    </div>
                )}


                {/* Log de Actividad (Incluye el mensaje de bienvenida) */}
                <h2 className="activity-title">Resumen de Actividad Reciente</h2>
                <div className="activity-log">
                    <div className="welcome-message-box">
                        <p>{message}</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;