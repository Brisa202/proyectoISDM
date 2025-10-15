// ============================================
// 1️⃣ CreateProductForm.jsx - CORREGIDO
// ============================================

import React, { useEffect, useState } from "react";
import api from "../../../api";
import "../../../styles/employeeForms.css";
import Swal from "sweetalert2";

const CreateProductForm = () => {
  const [formData, setFormData] = useState({
    nombre_prod: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria: "", // ✅ CAMBIO: categoria en lugar de id_categoria
    foto_producto: null,
  });

  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    api
      .get("categorias/")
      .then((res) => {
        console.log("📂 Categorías cargadas:", res.data);
        setCategorias(res.data);
      })
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

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
    
    // ✅ Agregar todos los campos
    data.append("nombre_prod", formData.nombre_prod);
    data.append("descripcion", formData.descripcion);
    data.append("precio", formData.precio);
    data.append("stock", formData.stock);
    data.append("categoria", formData.categoria); // ✅ Enviar como "categoria"
    
    if (formData.foto_producto) {
      data.append("foto_producto", formData.foto_producto);
    }

    console.log("📤 Datos a enviar:");
    for (let [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await api.post("productos/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Producto creado:", response.data);

      Swal.fire({
        icon: "success",
        title: "¡Producto creado exitosamente!",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });

      // ✅ Resetear formulario
      setFormData({
        nombre_prod: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoria: "",
        foto_producto: null,
      });
      
      e.target.reset();
      
    } catch (error) {
      console.error("❌ Error completo:", error.response?.data);
      
      Swal.fire({
        icon: "error",
        title: "Error al crear producto",
        text: JSON.stringify(error.response?.data) || "Por favor, intenta nuevamente.",
        confirmButtonColor: "#fddb3a",
        background: "#141414",
        color: "#fff",
      });
    }
  };

  return (
    <div className="empleado-form-page">
      <div className="empleado-form-container">
        <h2>Crear nuevo Producto</h2>
        <p className="subtitle">Complete los datos para registrar un producto.</p>

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

          <label>Foto del producto:</label>
          <input type="file" name="foto_producto" onChange={handleChange} />

          <button type="submit" className="btn-submit">
            Crear Producto
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProductForm;