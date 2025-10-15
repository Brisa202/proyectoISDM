import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/employeeForms.css";
import Swal from "sweetalert2";

const EditEmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    group_id: "" 
  });
  
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          api.get(`users/${id}/`),
          api.get("groups/")
        ]);

        console.log("👤 Usuario actual:", userRes.data);
        console.log("🎭 Roles disponibles:", rolesRes.data);

        setRoles(rolesRes.data);

        // ✅ Detectar el formato del group_id
        let groupId = "";
        if (userRes.data.group_id) {
          groupId = userRes.data.group_id;
        } else if (userRes.data.groups && userRes.data.groups.length > 0) {
          groupId = userRes.data.groups[0];
        }

        setFormData({
          username: userRes.data.username || "",
          email: userRes.data.email || "",
          group_id: groupId
        });

        setLoadingData(false);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
        Swal.fire({
          icon: "error",
          title: "Error al cargar empleado",
          text: "No se pudieron obtener los datos del empleado.",
        });
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("📤 Datos a actualizar:", formData);

    try {
      const response = await api.put(`users/${id}/`, formData);

      console.log("✅ Empleado actualizado:", response.data);

      Swal.fire({
        icon: "success",
        title: "¡Empleado actualizado correctamente!",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
        confirmButtonText: "OK",
      });

      navigate("/dashboard/empleados");
    } catch (error) {
      console.error("❌ Error al editar empleado:", error.response?.data);

      let errorMsg = "Por favor, intenta nuevamente.";
      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.username) errorMsg = errors.username[0];
        else if (errors.email) errorMsg = errors.email[0];
        else if (errors.group_id) errorMsg = errors.group_id[0];
        else errorMsg = JSON.stringify(errors);
      }

      Swal.fire({
        icon: "error",
        title: "Error al actualizar empleado",
        text: errorMsg,
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="empleado-form-page">
        <div className="empleado-form-container">
          <p>Cargando datos del empleado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="empleado-form-page">
      <div className="empleado-form-container">
        <h2>Editar Empleado</h2>
        <p className="subtitle">Modifique los datos del empleado y guarde los cambios.</p>

        <form className="empleado-form" onSubmit={handleSubmit}>
          <label>Usuario:</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Rol:</label>
          <select
            name="group_id"
            value={formData.group_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un rol</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeForm;


