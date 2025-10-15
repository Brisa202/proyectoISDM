import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import "../../styles/employees.css";
import Swal from "sweetalert2";

const EmpleadosListPage = () => {
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // ✅ Cargar empleados y roles en paralelo
      const [empleadosRes, rolesRes] = await Promise.all([
        api.get("employees/"),
        api.get("groups/")
      ]);

      console.log("👥 Empleados recibidos:", empleadosRes.data);
      console.log("🎭 Roles recibidos:", rolesRes.data);

      setEmpleados(empleadosRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      console.error("❌ Error al cargar datos:", err);
      console.error("❌ URL que falló:", err.config?.url);
      console.error("❌ Código de error:", err.response?.status);
      console.error("❌ Mensaje:", err.response?.data);
    }
  };

  // ✅ Función para obtener el nombre del rol
  const getRoleName = (empleado) => {
    // Opción 1: Ya viene el campo "role" directamente
    if (empleado.role) {
      return empleado.role;
    }

    // Opción 2: Buscar en el array de roles usando group_id
    if (empleado.group_id) {
      const rol = roles.find(r => r.id === empleado.group_id);
      return rol?.name || "Sin rol";
    }

    // Opción 3: Si tiene groups array
    if (empleado.groups && empleado.groups.length > 0) {
      const groupId = empleado.groups[0];
      const rol = roles.find(r => r.id === groupId);
      return rol?.name || "Sin rol";
    }

    return "Sin rol";
  };

  const handleDelete = async (id, username) => {
    const result = await Swal.fire({
      title: `¿Eliminar a ${username}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fddb3a",
      cancelButtonColor: "#d33",
      background: "#141414",
      color: "#fff",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`users/delete/${id}/`);
        
        // ✅ Recargar la lista después de eliminar
        fetchData();

        Swal.fire({
          icon: "success",
          title: "Empleado eliminado correctamente",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });
      } catch (error) {
        console.error("❌ Error al eliminar:", error.response?.data);
        Swal.fire({
          icon: "error",
          title: "Error al eliminar empleado",
          text: error.response?.data?.detail || "Por favor, intenta nuevamente.",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/empleados/editar/${id}`);
  };

  return (
    <DashboardLayout>
      <div className="empleados-container">
        <div className="empleados-header">
          <div>
            <h2>Gestión de Empleados</h2>
            <p className="subtitle">
              Desde aquí podrás visualizar, editar y eliminar los datos de tus empleados.
            </p>
          </div>
          <Link to="/dashboard/empleados/crear" className="btn-agregar">
            <UserPlus size={18} /> Agregar un nuevo empleado
          </Link>
        </div>

        <div className="empleados-table-container">
          <table className="empleados-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.length > 0 ? (
                empleados.map((e) => (
                  <tr key={e.id}>
                    <td>{e.username}</td>
                    <td>{e.email}</td>
                    <td>{getRoleName(e)}</td>
                    <td className="acciones">
                      <button
                        className="btn-icon editar"
                        onClick={() => handleEdit(e.id)}
                        title="Editar empleado"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="btn-icon eliminar"
                        onClick={() => handleDelete(e.id, e.username)}
                        title="Eliminar empleado"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                    No hay empleados registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmpleadosListPage;