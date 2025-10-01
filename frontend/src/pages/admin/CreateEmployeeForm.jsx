import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api"; 

function EmpleadoCreationForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
     group_id: 3,
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token"); // el que guardaste al login
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const headers = getAuthHeaders();
      const response = await axios.post(
        `${API_BASE_URL}/users/create/employee/`,
        formData,
        { headers }
      );

      if (response.status === 201) {
        setMessage(`✅ Empleado ${formData.username} creado con éxito`);
        setFormData({ username: "", email: "", password: "" });
      }
    } catch (error) {
      console.error("Error al crear empleado:", error.response?.data);
      let errorMsg = "Error desconocido";

      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.username) errorMsg = errors.username[0];
        else if (errors.email) errorMsg = errors.email[0];
        else if (errors.password) errorMsg = errors.password[0];
        else errorMsg = JSON.stringify(errors);
      }
      setMessage("❌ " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="empleado-creation-container">
      <h2>Crear nuevo Empleado</h2>
      <p className={message.includes("❌") ? "text-danger" : "text-success"}>
        {message}
      </p>

      <form onSubmit={handleSubmit} className="form-group-spaced">
        <div>
          <label>Usuario:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear Empleado"}
        </button>
      </form>

      <style jsx>{`
        .empleado-creation-container {
          max-width: 500px;
          margin: 20px auto;
          padding: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          background-color: #ffffff;
        }
        .form-group-spaced div {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
        }
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .text-danger {
          color: #d9534f;
          font-weight: bold;
        }
        .text-success {
          color: #5cb85c;
          font-weight: bold;
        }
        button {
          background-color: #fddb3a;
          color: black;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
          font-weight: bold;
        }
        button:hover:not(:disabled) {
          background-color: #e6c434;
        }
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default EmpleadoCreationForm;
