import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/employeeForms.css";
import Swal from "sweetalert2";

const API_BASE_URL = "http://localhost:8000/api";

function CreateEmployeeForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    group_id: "",
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const headers = getAuthHeaders();
        const response = await axios.get(`${API_BASE_URL}/groups/`, { headers });
        console.log("🎭 Roles cargados:", response.data);
        setRoles(response.data);
      } catch (error) {
        console.error("❌ Error al cargar roles:", error);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("📤 Datos a enviar:", formData);

    try {
      const headers = getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/users/create/employee/`,
        formData,
        { headers }
      );

      console.log("✅ Empleado creado:", response.data);

      if (response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "¡Empleado registrado exitosamente!",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
          confirmButtonText: "OK",
        });

        // Resetear formulario
        setFormData({ username: "", email: "", password: "", group_id: "" });
        e.target.reset();
      }
    } catch (error) {
      console.error("❌ Error al crear empleado:", error.response?.data);
      let errorMsg = "Error desconocido";

      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.username) errorMsg = errors.username[0];
        else if (errors.email) errorMsg = errors.email[0];
        else if (errors.password) errorMsg = errors.password[0];
        else if (errors.group_id) errorMsg = errors.group_id[0];
        else errorMsg = JSON.stringify(errors);
      }

      Swal.fire({
        icon: "error",
        title: "Error al crear empleado",
        text: errorMsg,
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="empleado-form-page">
      <div className="empleado-form-container">
        <h2>Crear nuevo Empleado</h2>
        <p className="subtitle">Complete los datos para registrar un nuevo empleado.</p>

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

          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
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
            {loading ? "Creando..." : "Crear Empleado"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEmployeeForm;
