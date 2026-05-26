"use client";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X, Box } from "lucide-react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Producto {
  _id: string;
  nombre: string;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
}

export default function ProductosPage() {
  return (
    <ProtectedRoute>
      <ProductosContent />
    </ProtectedRoute>
  );
}

function ProductosContent() {
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
    if (!form.nombre.trim()) {
      setFormError("El nombre es obligatorio");
      return;
    }
    if (Number(form.precioCompra) < 0 || Number(form.precioVenta) <= 0) {
      setFormError("El precio de venta debe ser mayor a 0 y el costo no puede ser negativo");
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
      const res = await api.get("/productos");
      setProductos(res.data);
      setShowModal(false);
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Error al guardar producto");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProducto = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      const res = await api.get('/productos');
      setProductos(res.data);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between relative">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">ImpresoGT // Catálogo</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Productos</h1>
          </div>
          <button
            className="neon-btn-cyan flex items-center gap-2 px-4 py-2 text-sm"
            onClick={handleOpenModal}
          >
            <Plus size={16} /> Nuevo producto
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadein"
            onClick={handleCloseModal}
          >
            <div
              className="neon-card neon-card-cyan w-full max-w-md p-6 relative animate-popup mx-4"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--neon-red)] transition"
                onClick={handleCloseModal}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-bold neon-text-cyan mb-4">
                {productoSeleccionado ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)] mb-2">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="neon-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)] mb-2">Costo Producción</label>
                  <input
                    type="number"
                    name="precioCompra"
                    min={0}
                    step={0.01}
                    value={form.precioCompra}
                    onChange={handleChange}
                    className="neon-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)] mb-2">Precio Venta</label>
                  <input
                    type="number"
                    name="precioVenta"
                    min={0}
                    step={0.01}
                    value={form.precioVenta}
                    onChange={handleChange}
                    className="neon-input"
                    required
                  />
                </div>
                {formError && <div className="text-sm neon-text-red">{formError}</div>}
                <button
                  type="submit"
                  className="neon-btn-cyan w-full py-2.5"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="neon-spinner h-14 w-14"></div>
          </div>
        ) : error ? (
          <div className="neon-card neon-card-magenta p-5 neon-text-red">{error}</div>
        ) : (
          <div className="neon-card neon-card-cyan overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-[var(--bg-surface)]/70 border-b border-[var(--border-subtle)]">
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Nombre</th>
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Costo Producción</th>
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Precio Venta</th>
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-[var(--text-muted)]">
                        <Box size={36} className="mx-auto mb-3 text-[var(--neon-cyan)] opacity-50" />
                        No hay productos registrados.
                      </td>
                    </tr>
                  ) : (
                    productos.map(producto => (
                      <tr key={producto._id} className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]/40 transition">
                        <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{producto.nombre}</td>
                        <td className="px-4 py-3 neon-text-red">Q{producto.precioCompra.toFixed(2)}</td>
                        <td className="px-4 py-3 neon-text-cyan">Q{producto.precioVenta.toFixed(2)}</td>
                        <td className="px-4 py-3 flex gap-1">
                          <button
                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--neon-cyan)] hover:bg-[var(--bg-surface)] transition"
                            title="Editar"
                            onClick={() => handleOpenEdit(producto)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--neon-red)] hover:bg-[var(--bg-surface)] transition"
                            title="Eliminar"
                            onClick={() => handleDeleteProducto(producto._id)}
                          >
                            <Trash2 size={16} />
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
    </div>
  );
}
