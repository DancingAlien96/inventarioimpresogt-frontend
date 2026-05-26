"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { Plus, Edit, Trash2, X, ShoppingCart, TrendingDown } from "lucide-react";

interface Compra {
  _id: string;
  descripcion: string;
  totalGastado: number;
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
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ descripcion: "", totalGastado: "" });
  const [formError, setFormError] = useState("");

  async function cargarDatos() {
    try {
      const res = await api.get("/compras");
      setCompras(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const totalAcumulado = compras.reduce((sum, c) => sum + (c.totalGastado || 0), 0);

  function abrirNuevo() {
    setSelectedCompra(null);
    setForm({ descripcion: "", totalGastado: "" });
    setFormError("");
    setShowModal(true);
  }

  function abrirEditar(compra: Compra) {
    setSelectedCompra(compra);
    setForm({ descripcion: compra.descripcion, totalGastado: String(compra.totalGastado) });
    setFormError("");
    setShowModal(true);
  }

  async function handleEliminar(id: string) {
    if (!confirm("¿Eliminar esta compra?")) return;
    try {
      await api.delete(`/compras/${id}`);
      const res = await api.get("/compras");
      setCompras(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.descripcion || !form.totalGastado) {
      setFormError("Todos los campos son obligatorios");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        descripcion: form.descripcion,
        totalGastado: Number(form.totalGastado),
      };
      if (selectedCompra) {
        await api.put(`/compras/${selectedCompra._id}`, payload);
      } else {
        await api.post("/compras", payload);
      }
      const res = await api.get("/compras");
      setCompras(res.data);
      setShowModal(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setFormError(e.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between relative">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">ImpresoGT // Compras</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Compras</h1>
          </div>
          <button
            onClick={abrirNuevo}
            className="neon-btn-cyan flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Plus size={16} /> Nueva compra
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="neon-card neon-card-cyan p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">Total de compras registradas</p>
                <p className="mt-2 text-3xl font-bold neon-text-cyan">{compras.length}</p>
              </div>
              <ShoppingCart size={36} className="text-[var(--neon-cyan)] animate-float" />
            </div>
          </div>
          <div className="neon-card neon-card-magenta p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">Total gastado</p>
                <p className="mt-2 text-3xl font-bold neon-text-magenta">Q{totalAcumulado.toFixed(2)}</p>
              </div>
              <TrendingDown size={36} className="text-[var(--neon-magenta)]" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="neon-spinner h-14 w-14"></div>
          </div>
        ) : (
          <div className="neon-card neon-card-cyan overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-[var(--bg-surface)]/70 border-b border-[var(--border-subtle)]">
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Descripción</th>
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Total gastado</th>
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Fecha</th>
                    <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {compras.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-[var(--text-muted)]">
                        <ShoppingCart size={36} className="mx-auto mb-3 text-[var(--neon-cyan)] opacity-50" />
                        No hay compras registradas aún.
                      </td>
                    </tr>
                  ) : (
                    compras.map((c) => (
                      <tr key={c._id} className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]/40 transition">
                        <td className="px-4 py-3 text-[var(--text-primary)]">{c.descripcion}</td>
                        <td className="px-4 py-3 font-semibold neon-text-magenta">Q{c.totalGastado.toFixed(2)}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 flex gap-1">
                          <button
                            onClick={() => abrirEditar(c)}
                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--neon-cyan)] hover:bg-[var(--bg-surface)] transition"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleEliminar(c._id)}
                            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--neon-red)] hover:bg-[var(--bg-surface)] transition"
                            title="Eliminar"
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

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadein"
          onClick={() => setShowModal(false)}
        >
          <div
            className="neon-card neon-card-cyan w-full max-w-md p-6 relative animate-popup mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--neon-red)] transition"
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold neon-text-cyan mb-4">
              {selectedCompra ? "Editar compra" : "Nueva compra"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)] mb-2">Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="neon-input"
                  placeholder="Ej: Compra de papel bond"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)] mb-2">Total gastado (Q)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.totalGastado}
                  onChange={(e) => setForm({ ...form, totalGastado: e.target.value })}
                  className="neon-input"
                  placeholder="0.00"
                  required
                />
              </div>
              {formError && <p className="text-sm neon-text-red">{formError}</p>}
              <button
                type="submit"
                disabled={saving}
                className="neon-btn-cyan w-full py-2.5"
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
