"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import api from "@/lib/api";

interface Producto {
  _id: string;
  nombre: string;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    precioCompra: 0,
    precioVenta: 0,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    api.get("/productos")
      .then(res => setProductos(res.data))
      .catch(() => setError("Error al cargar productos"))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenModal = () => {
    setProductoSeleccionado(null);
    setForm({ nombre: "", precioCompra: 0, precioVenta: 0 });
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEdit = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setForm({
      nombre: producto.nombre,
      precioCompra: producto.precioCompra,
      precioVenta: producto.precioVenta,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.precioCompra || !form.precioVenta) {
      setFormError("Todos los campos son obligatorios");
      return;
    }
    setSaving(true);
    setFormError("");

    const payload = {
      nombre: form.nombre,
      cantidad: productoSeleccionado ? productoSeleccionado.cantidad : 0,
      precioCompra: Number(form.precioCompra),
      precioVenta: Number(form.precioVenta),
    };

    try {
      if (productoSeleccionado) {
        await api.put(`/productos/${productoSeleccionado._id}`, payload);
      } else {
        await api.post("/productos", payload);
      }
      setShowModal(false);
      setSaving(false);
      setLoading(true);
      const res = await api.get("/productos");
      setProductos(res.data);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Error al guardar producto");
      }
      setSaving(false);
    }
  };

  const handleDeleteProducto = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      setLoading(true);
      const res = await api.get('/productos');
      setProductos(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={handleOpenModal}
        >
          <Plus size={18} /> Nuevo producto
        </button>
      </div>

      {/* Popup Modal animado */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity animate-fadein"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-popup"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-900"
              onClick={handleCloseModal}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold mb-4 text-gray-900">{productoSeleccionado ? 'Editar producto' : 'Nuevo producto'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Animaciones para popup */}
              <style jsx global>{`
                @keyframes fadein {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                .animate-fadein {
                  animation: fadein 0.2s;
                }
                @keyframes popup {
                  from { transform: scale(0.95); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
                }
                .animate-popup {
                  animation: popup 0.2s;
                }
              `}</style>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Precio Compra</label>
                <input
                  type="number"
                  name="precioCompra"
                  min={0}
                  step={0.01}
                  value={form.precioCompra}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Precio Venta</label>
                <input
                  type="number"
                  name="precioVenta"
                  min={0}
                  step={0.01}
                  value={form.precioVenta}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-black"
                  required
                />
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-bold"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-700">Cargando productos...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-gray-900 font-bold">Nombre</th>
                <th className="px-4 py-2 text-left text-gray-900 font-bold">Precio Compra</th>
                <th className="px-4 py-2 text-left text-gray-900 font-bold">Precio Venta</th>
                <th className="px-4 py-2 text-left text-gray-900 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-700">No hay productos registrados.</td>
                </tr>
              ) : (
                productos.map(producto => (
                  <tr key={producto._id} className="border-t">
                    <td className="px-4 py-2 text-gray-900">{producto.nombre}</td>
                    <td className="px-4 py-2 text-gray-900">Q{producto.precioCompra.toFixed(2)}</td>
                    <td className="px-4 py-2 text-gray-900">Q{producto.precioVenta.toFixed(2)}</td>
                    <td className="px-4 py-2 flex gap-2">
                        <button
                        className="p-2 rounded hover:bg-blue-50"
                        title="Editar"
                        onClick={() => handleOpenEdit(producto)}
                      >
                        <Edit size={16} className="text-blue-600" />
                      </button>
                      <button
                        className="p-2 rounded hover:bg-red-50"
                        title="Eliminar"
                        onClick={() => handleDeleteProducto(producto._id)}
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
