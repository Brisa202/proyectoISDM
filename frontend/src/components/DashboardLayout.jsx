import React from "react";
import { Link, useLocation } from "react-router-dom";
import logoImage from "../assets/logo.jpg"; // ✅ esta sí está bien

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={logoImage} alt="HP Logo" className="sidebar-logo" />
        </div>
        <nav className="sidebar-menu">
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? "menu-item current" : "menu-item"}
          >
            📦 Panel de Control
          </Link>
          <Link to="/dashboard/empleados" className="menu-item">
            👨‍💼 Empleados
          </Link>
          <Link to="/products" className="menu-item">
            🏷️ Productos
          </Link>
          <Link to="/incidents" className="menu-item">
            ⚠️ Incidentes
          </Link>
        </nav>

        <div className="sidebar-section">
          <p className="section-title">Gestión de Entidades</p>
          <Link to="/rentals" className="menu-item entity-item">
            Alquileres
          </Link>
          <Link to="/orders" className="menu-item entity-item">
            Pedidos
          </Link>
          <Link to="/invoices" className="menu-item entity-item">
            Facturas
          </Link>
          <Link to="/payments" className="menu-item entity-item">
            Pagos
          </Link>
        </div>

        <button className="logout-button-sidebar">← Cerrar Sesión</button>
      </div>

      {/* Contenido principal */}
      <main className="main-content">{children}</main>
    </div>
  );
};

export default DashboardLayout;
