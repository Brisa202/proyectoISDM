// ============================================
// 2️⃣ ProductsListPage.jsx - CORREGIDO
// ============================================

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api";
import DashboardLayout from "../../../components/DashboardLayout";
import { Pencil, Trash2, Plus } from "lucide-react";
import "../../../styles/employees.css";
import Swal from "sweetalert2";

const ProductsListPage = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productosRes, categoriasRes] = await Promise.all([
        api.get("productos/"),
        api.get("categorias/")
      ]);

      console.log("📦 Productos:", productosRes.data);
      console.log("📂 Categorías:", categoriasRes.data);

      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      Swal.fire({
        icon: "error",
        title: "Error al cargar datos",
        text: "No se pudieron obtener los datos del servidor.",
      });
    }
  };

  // ✅ Función para obtener nombre de categoría
  const getCategoriaName = (producto) => {
    if (producto.categoria_nombre) return producto.categoria_nombre;
    
    if (producto.categoria && typeof producto.categoria === 'object') {
      return producto.categoria.nombre_categoria || producto.categoria.nombre || "Sin categoría";
    }

    if (producto.categoria && typeof producto.categoria === 'number') {
      const cat = categorias.find(c => c.id_categoria === producto.categoria);
      return cat?.nombre_categoria || "Sin categoría";
    }

    if (producto.id_categoria) {
      const cat = categorias.find(c => c.id_categoria === producto.id_categoria);
      return cat?.nombre_categoria || "Sin categoría";
    }

    return "Sin categoría";
  };

  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      title: `¿Eliminar "${nombre}"?`,
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
        await api.delete(`productos/${id}/`);
        
        // ✅ Recargar la lista después de eliminar
        fetchData();

        Swal.fire({
          icon: "success",
          title: "Producto eliminado correctamente",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });
      } catch (error) {
        console.error("Error al eliminar:", error.response?.data);
        Swal.fire({
          icon: "error",
          title: "Error al eliminar producto",
          text: error.response?.data?.detail || "Por favor, intenta nuevamente.",
          confirmButtonColor: "#fddb3a",
          background: "#141414",
          color: "#fff",
        });
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/productos/editar/${id}`);
  };

  return (
    <DashboardLayout>
      <div className="empleados-container">
        <div className="empleados-header">
          <div>
            <h2>Gestión de Productos</h2>
            <p className="subtitle">
              Aquí puedes ver, editar o eliminar los productos disponibles.
            </p>
          </div>
          <Link to="/dashboard/productos/crear" className="btn-agregar">
            <Plus size={18} /> Agregar producto
          </Link>
        </div>

        <div className="empleados-table-container">
          <table className="empleados-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length > 0 ? (
                productos.map((p) => (
                  <tr key={p.id_productos}>
                    <td>{p.nombre_prod}</td>
                    <td>{getCategoriaName(p)}</td>
                    <td>${p.precio}</td>
                    <td>{p.stock}</td>
                    <td className="acciones">
                      <button
                        className="btn-icon editar"
                        onClick={() => handleEdit(p.id_productos)}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="btn-icon eliminar"
                        onClick={() => handleDelete(p.id_productos, p.nombre_prod)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                    No hay productos registrados.
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

export default ProductsListPage;
