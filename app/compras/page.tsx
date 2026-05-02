"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { Plus, Edit, Trash2, X } from "lucide-react";

interface Producto {
  _id: string;
  nombre: string;
  precioCompra: number;
}

interface Compra {
  _id: string;
  tipo: string;
  producto: { _id: string; nombre: string; precioCompra: number };
  cantidad: number;
  nota: string;
  createdAt: string;
}

export default function ComprasPage() {
  return (
    <ProtectedRoute>
      <ComprasContent />
    </ProtectedRoute>
  );
}

function ComprasContent() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ productoId: "", cantidad: 1, nota: "" });
  const [formError, setFormError] = useState("");

  async function cargarDatos() {
    try {
      const [resCompras, resProd] = await Promise.all([
        api.get("/compras"),
        api.get("/productos"),
      ]);
      setCompras((resCompras.data as Compra[]).filter((m) => m.tipo === "Entrada"));
      setProductos(resProd.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const totalGastado = compras.reduce(
    (sum, c) => sum + (c.producto?.precioCompra || 0) * c.cantidad,
    0
  );

  function abrirNuevo() {
    setSelectedCompra(null);
    setForm({ productoId: productos[0]?._id || "", cantidad: 1, nota: "" });
    setFormError("");
    setShowModal(true);
  }

  function abrirEditar(compra: Compra) {
    setSelectedCompra(compra);
    setForm({
      productoId: compra.producto._id,
      cantidad: compra.cantidad,
      nota: compra.nota || "",
    });
    setFormError("");
    setShowModal(true);
  }

  async function handleEliminar(id: string) {
    if (!confirm("¿Eliminar esta compra?")) return;
    await api.delete(`/compras/${id}`);
    cargarDatos();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.productoId || !form.cantidad) {
      setFormError("Todos los campos son obligatorios");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        tipo: "Entrada",
        producto: form.productoId,
        cantidad: Number(form.cantidad),
        nota: form.nota,
      };
      if (selectedCompra) {
        await api.put(`/compras/${selectedCompra._id}`, payload);
      } else {
        await api.post("/compras", payload);
      }
      setShowModal(false);
      cargarDatos();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setFormError(e.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">ImpresoGT</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Compras</h1>
          </div>
          <button
            onClick={abrirNuevo}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={18} /> Nueva compra
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-sm text-gray-500">Total de compras registradas</p>
            <p className="text-3xl font-bold text-slate-900">{compras.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-sm text-gray-500">Total gastado en compras</p>
            <p className="text-3xl font-bold text-red-600">Q{totalGastado.toFixed(2)}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-gray-900 font-bold">Producto</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-bold">Cantidad</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-bold">Costo unitario</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-bold">Total</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-bold">Nota</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-bold">Fecha</th>
                    <th className="px-4 py-3 text-left text-gray-900 font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {compras.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No hay compras registradas aún.
                      </td>
                    </tr>
                  ) : (
                    compras.map((c) => (
                      <tr key={c._id} className="border-t">
                        <td className="px-4 py-3 text-gray-900">{c.producto?.nombre || "-"}</td>
                        <td className="px-4 py-3 text-gray-900">{c.cantidad}</td>
                        <td className="px-4 py-3 text-gray-900">
                          Q{(c.producto?.precioCompra || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-red-600">
                          Q{((c.producto?.precioCompra || 0) * c.cantidad).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-sm">{c.nota || "-"}</td>
                        <td className="px-4 py-3 text-gray-900">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <button
                            onClick={() => abrirEditar(c)}
                            className="p-2 rounded hover:bg-blue-50"
                            title="Editar"
                          >
                            <Edit size={16} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleEliminar(c._id)}
                            className="p-2 rounded hover:bg-red-50"
                            title="Eliminar"
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
          </div>
        )}
      </main>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-900"
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold mb-4 text-gray-900">
              {selectedCompra ? "Editar compra" : "Nueva compra"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Producto</label>
                <select
                  value={form.productoId}
                  onChange={(e) => setForm({ ...form, productoId: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-black"
                  required
                >
                  {productos.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nombre} — Q{p.precioCompra.toFixed(2)}/u
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={form.cantidad}
                  onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })}
                  className="w-full border rounded px-3 py-2 text-black"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Nota (opcional)</label>
                <input
                  type="text"
                  value={form.nota}
                  onChange={(e) => setForm({ ...form, nota: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-black"
                  placeholder="Ej: Reposición de stock"
                />
              </div>
              {formError && <p className="text-red-600 text-sm">{formError}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold transition-colors"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
