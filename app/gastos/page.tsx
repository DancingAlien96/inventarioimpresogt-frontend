"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import api from "@/lib/api";


interface Movimiento {
  _id: string;
  tipo: string;
  cantidad: number;
  producto: { _id: string; nombre: string };
  fecha: string;
}

interface Producto {
  _id: string;
  nombre: string;
}

export default function GastosPage() {
  const [gastos, setGastos] = useState<Movimiento[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    tipo: "Entrada",
    productoId: "",
    cantidad: 1,
  });
  const [selectedMovimiento, setSelectedMovimiento] = useState<Movimiento | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [movRes, prodRes] = await Promise.all([
          api.get("/compras"),
          api.get("/productos")
        ]);
        setGastos(movRes.data);
        setProductos(prodRes.data);
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || "Error al cargar gastos o productos";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleOpenModal = () => {
    setSelectedMovimiento(null);
    setForm({ tipo: "Entrada", productoId: productos[0]?._id || "", cantidad: 1 });
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMovimiento(null);
    setFormError("");
  };

  const handleEditMovimiento = (movimiento: Movimiento) => {
    setSelectedMovimiento(movimiento);
    setForm({
      tipo: movimiento.tipo,
      productoId: movimiento.producto?._id || "",
      cantidad: movimiento.cantidad,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleDeleteMovimiento = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
    try {
      setLoading(true);
      await api.delete(`/compras/${id}`);
      const movRes = await api.get('/compras');
      setGastos(movRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar movimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'cantidad' ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productoId || !form.cantidad) {
      setFormError("Todos los campos son obligatorios");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (selectedMovimiento) {
        await api.put(`/compras/${selectedMovimiento._id}`, {
          tipo: form.tipo,
          producto: form.productoId,
          cantidad: Number(form.cantidad),
        });
      } else {
        await api.post("/compras", {
          tipo: form.tipo,
          producto: form.productoId,
          cantidad: Number(form.cantidad),
        });
      }
      setShowModal(false);
      setSelectedMovimiento(null);
      setSaving(false);
      setLoading(true);
      const movRes = await api.get("/compras");
      setGastos(movRes.data);
      setLoading(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Error al guardar movimiento");
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gastos</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={handleOpenModal}
        >
          <Plus size={18} /> Nuevo gasto
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
            <h2 className="text-lg font-bold mb-4 text-gray-900">
              {selectedMovimiento ? 'Editar gasto' : 'Nuevo gasto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Producto</label>
                <select
                  name="productoId"
                  value={form.productoId}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-black"
                  required
                >
                  <option value="">Seleccione un producto</option>
                  {productos.map(p => (
                    <option key={p._id} value={p._id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Tipo</label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-black"
                  required
                >
                  <option value="Entrada">Entrada</option>
                  <option value="Salida">Salida</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  min={1}
                  value={form.cantidad}
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

      {loading ? (
        <div className="text-gray-700">Cargando gastos...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-gray-900 font-bold">Producto</th>
                <th className="px-4 py-2 text-left text-gray-900 font-bold">Tipo</th>
                <th className="px-4 py-2 text-left text-gray-900 font-bold">Cantidad</th>
                <th className="px-4 py-2 text-left text-gray-900 font-bold">Fecha</th>
                <th className="px-4 py-2 text-left text-gray-900 font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {gastos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-700">No hay gastos registrados.</td>
                </tr>
              ) : (
                gastos.map(mov => (
                  <tr key={mov._id} className="border-t">
                    <td className="px-4 py-2 text-gray-900">{mov.producto?.nombre || "-"}</td>
                    <td className="px-4 py-2 text-gray-900">{mov.tipo}</td>
                    <td className="px-4 py-2 text-gray-900">{mov.cantidad}</td>
                    <td className="px-4 py-2 text-gray-900">{new Date(mov.fecha).toLocaleDateString()}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                      className="p-2 rounded hover:bg-blue-50"
                      title="Editar gasto"
                      onClick={() => handleEditMovimiento(mov)}
                    >
                        <Edit size={16} className="text-blue-600" />
                      </button>
                      <button
                        className="p-2 rounded hover:bg-red-50"
                        title="Eliminar"
                        onClick={() => handleDeleteMovimiento(mov._id)}
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
