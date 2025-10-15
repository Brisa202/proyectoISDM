// ============================================
// 3️⃣ EditProductForm.jsx - CORREGIDO
// ============================================

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api";
import "../../../styles/employeeForms.css";
import Swal from "sweetalert2";

const EditProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_prod: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria: "", // ✅ CAMBIO: categoria en lugar de id_categoria
    foto_producto: null,
  });

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get("categorias/"),
          api.get(`productos/${id}/`),
        ]);

        console.log("📂 Categorías:", catRes.data);
        console.log("📦 Producto actual:", prodRes.data);

        setCategorias(catRes.data);

        // ✅ Detectar el formato de categoría que devuelve el backend
        let categoriaId = "";
        if (prodRes.data.categoria) {
          if (typeof prodRes.data.categoria === 'object') {
            categoriaId = prodRes.data.categoria.id_categoria || prodRes.data.categoria.id;
          } else {
            categoriaId = prodRes.data.categoria;
          }
        } else if (prodRes.data.id_categoria) {
          categoriaId = prodRes.data.id_categoria;
        }

        setFormData({
          nombre_prod: prodRes.data.nombre_prod || "",
          descripcion: prodRes.data.descripcion || "",
          precio: prodRes.data.precio || "",
          stock: prodRes.data.stock || "",
          categoria: categoriaId,
          foto_producto: null,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos:", error);
        Swal.fire({
          icon: "error",
          title: "Error al cargar el producto",
          text: "No se pudieron obtener los datos del producto.",
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    
    data.append("nombre_prod", formData.nombre_prod);
    data.append("descripcion", formData.descripcion);
    data.append("precio", formData.precio);
    data.append("stock", formData.stock);
    data.append("categoria", formData.categoria); // ✅ Enviar como "categoria"
    
    if (formData.foto_producto) {
      data.append("foto_producto", formData.foto_producto);
    }

    console.log("📤 Datos a actualizar:");
    for (let [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await api.put(`productos/${id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Producto actualizado:", response.data);

      Swal.fire({
        icon: "success",
        title: "Producto actualizado correctamente",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });

      navigate("/dashboard/productos");
    } catch (error) {
      console.error("❌ Error al actualizar producto:", error.response?.data);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar producto",
        text: JSON.stringify(error.response?.data) || "Verifica los datos ingresados.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
    }
  };

  if (loading) {
    return (
      <div className="empleado-form-page">
        <div className="empleado-form-container">
          <p>Cargando producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="empleado-form-page">
      <div className="empleado-form-container">
        <h2>Editar Producto</h2>
        <p className="subtitle">Modifique los campos del producto.</p>

        <form className="empleado-form" onSubmit={handleSubmit}>
          <label>Nombre:</label>
          <input
            name="nombre_prod"
            value={formData.nombre_prod}
            onChange={handleChange}
            required
          />

          <label>Descripción:</label>
          <input
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
          />

          <label>Precio:</label>
          <input
            type="number"
            step="0.01"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            required
          />

          <label>Stock:</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />

          <label>Categoría:</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre_categoria}
              </option>
            ))}
          </select>

          <label>Foto del producto (opcional):</label>
          <input type="file" name="foto_producto" onChange={handleChange} />

          <button type="submit" className="btn-submit">
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProductForm;