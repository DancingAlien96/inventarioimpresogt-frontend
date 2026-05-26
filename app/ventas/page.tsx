'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  TrendingDown
} from 'lucide-react';

interface Producto {
  _id: string;
  nombre: string;
  precioCompra: number;
  precioVenta: number;
}

interface Material {
  producto: string;
  nombreProducto: string;
  cantidad: number;
  costoUnitario: number;
  precioVentaUnitario: number;
  costoTotal: number;
}

interface Trabajo {
  _id: string;
  nombre: string;
  descripcion: string;
  cliente: string;
  materiales: Material[];
  costosAdicionales: number;
  notaCostos: string;
  costoProduccion: number;
  precioVenta: number;
  estado: string;
  fechaEntrega?: string;
  ganancia: number;
  porcentajeGanancia: number;
  createdAt: string;
}

export default function VentasPage() {
  return (
    <ProtectedRoute>
      <VentasContent />
    </ProtectedRoute>
  );
}

function VentasContent() {
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [trabajoSeleccionado, setTrabajoSeleccionado] = useState<Trabajo | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    cliente: '',
    materiales: [] as Material[],
    costosAdicionales: 0,
    notaCostos: '',
    costoProduccion: 0,
    precioVenta: 0,
    estado: 'Cotizado',
    fechaEntrega: '',
  });

  async function cargarDatos() {
    try {
      const [resTrabajos, resProductos] = await Promise.all([
        api.get('/ventas'),
        api.get('/productos'),
      ]);
      setTrabajos(resTrabajos.data);
      setProductos(resProductos.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);


  const calcularCostoProduccion = (materiales: Material[], costosAdicionales: number) => {
    const costoMateriales = materiales.reduce((sum, m) => sum + m.costoTotal, 0);
    return costoMateriales + costosAdicionales;
  };

  const agregarMaterial = () => {
    setFormData({
      ...formData,
      materiales: [
        ...formData.materiales,
        {
          producto: '',
          nombreProducto: '',
          cantidad: 0,
          costoUnitario: 0,
          precioVentaUnitario: 0,
          costoTotal: 0,
        },
      ],
    });
  };

  const actualizarMaterial = (index: number, campo: string, valor: string | number) => {
    const nuevosMateriales = [...formData.materiales];

    if (campo === 'producto') {
      const productoSeleccionado = productos.find(p => p._id === valor);
      if (productoSeleccionado) {
        nuevosMateriales[index].producto = String(valor);
        nuevosMateriales[index].nombreProducto = productoSeleccionado.nombre;
        nuevosMateriales[index].costoUnitario = productoSeleccionado.precioCompra;
        nuevosMateriales[index].precioVentaUnitario = productoSeleccionado.precioVenta;
        nuevosMateriales[index].costoTotal = productoSeleccionado.precioCompra * nuevosMateriales[index].cantidad;
      }
    } else if (campo === 'cantidad') {
      let cantidad = valor === '' ? 0 : Number(valor);
      if (cantidad < 0) cantidad = 0;
      nuevosMateriales[index].cantidad = cantidad;
      nuevosMateriales[index].costoTotal = nuevosMateriales[index].costoUnitario * cantidad;
    } else if (campo === 'costoUnitario') {
      nuevosMateriales[index].costoUnitario = Number(valor);
      nuevosMateriales[index].costoTotal = Number(valor) * nuevosMateriales[index].cantidad;
    }

    const costoProduccion = calcularCostoProduccion(nuevosMateriales, formData.costosAdicionales);
    const ingresoVentas = nuevosMateriales.reduce((sum, m) => sum + (m.precioVentaUnitario * m.cantidad), 0);
    setFormData({ ...formData, materiales: nuevosMateriales, costoProduccion, precioVenta: ingresoVentas });
  };

  const eliminarMaterial = (index: number) => {
    const nuevosMateriales = [...formData.materiales];
    nuevosMateriales.splice(index, 1);
    const costoProduccion = calcularCostoProduccion(nuevosMateriales, formData.costosAdicionales);
    setFormData({ ...formData, materiales: nuevosMateriales, costoProduccion });
  };

  const actualizarCostosAdicionales = (valor: number) => {
    const costoProduccion = calcularCostoProduccion(formData.materiales, valor);
    setFormData({ ...formData, costosAdicionales: valor, costoProduccion });
  };

  const abrirModalNuevo = () => {
    setTrabajoSeleccionado(null);
    setFormData({
      nombre: '',
      descripcion: '',
      cliente: '',
      materiales: [],
      costosAdicionales: 0,
      notaCostos: '',
      costoProduccion: 0,
      precioVenta: 0,
      estado: 'Cotizado',
      fechaEntrega: '',
    });
    setMostrarModal(true);
  };

  const editarTrabajo = (trabajo: Trabajo) => {
    setTrabajoSeleccionado(trabajo);
    setFormData({
      nombre: trabajo.nombre,
      descripcion: trabajo.descripcion,
      cliente: trabajo.cliente,
      materiales: trabajo.materiales,
      costosAdicionales: trabajo.costosAdicionales,
      notaCostos: trabajo.notaCostos,
      costoProduccion: trabajo.costoProduccion,
      precioVenta: trabajo.precioVenta,
      estado: trabajo.estado,
      fechaEntrega: trabajo.fechaEntrega || '',
    });
    setMostrarModal(true);
  };

  const guardarTrabajo = async () => {
    const materialesValidos = formData.materiales
      .filter((m) => m.producto && m.producto !== '')
      .map((m) => ({
        ...m,
        cantidad: Number(m.cantidad),
        costoUnitario: Number(m.costoUnitario),
        costoTotal: Number(m.costoTotal) || Number(m.cantidad) * Number(m.costoUnitario)
      }));

    const costoProduccion = calcularCostoProduccion(materialesValidos, formData.costosAdicionales);
    const payload = {
      ...formData,
      materiales: materialesValidos,
      costoProduccion,
      fechaEntrega: formData.fechaEntrega || undefined,
    };

    if (!payload.nombre || payload.nombre.trim() === '') {
      alert('El nombre del trabajo es obligatorio.');
      return;
    }

    if (!payload.precioVenta || payload.precioVenta <= 0) {
      alert('Debe seleccionar un producto con precio de venta válido.');
      return;
    }

    try {
      if (trabajoSeleccionado) {
        await api.put(`/ventas/${trabajoSeleccionado._id}`, payload);
      } else {
        await api.post('/ventas', payload);
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar trabajo:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Error al guardar trabajo. Revisa la consola para más detalles.');
      }
    }
  };

  const eliminarTrabajo = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este trabajo?')) {
      try {
        await api.delete(`/ventas/${id}`);
        cargarDatos();
      } catch (error) {
        console.error('Error al eliminar trabajo:', error);
      }
    }
  };

  const toggleExpandir = (id: string) => {
    setExpandido(expandido === id ? null : id);
  };

  // Estadísticas
  const trabajosFinalizados = trabajos.filter(t => ['Completado', 'Entregado'].includes(t.estado));
  const totalVentas = trabajosFinalizados.reduce((sum, t) => sum + t.precioVenta, 0);
  const totalCostos = trabajosFinalizados.reduce((sum, t) => sum + t.costoProduccion, 0);
  const totalGanancias = totalVentas - totalCostos;
  const margenPromedio = totalCostos > 0 ? (totalGanancias / totalCostos) * 100 : 0;

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="neon-spinner h-14 w-14"></div>
      </div>
    );
  }

  const estadoBadge = (estado: string) => {
    if (estado === 'Completado') return 'border-[rgba(57,255,136,0.4)] bg-[rgba(57,255,136,0.1)] text-[var(--neon-green)]';
    if (estado === 'En Proceso') return 'border-[rgba(0,240,255,0.4)] bg-[rgba(0,240,255,0.1)] text-[var(--neon-cyan)]';
    if (estado === 'Entregado') return 'border-[rgba(255,0,170,0.4)] bg-[rgba(255,0,170,0.1)] text-[var(--neon-magenta)]';
    return 'border-[rgba(255,214,10,0.4)] bg-[rgba(255,214,10,0.1)] text-[var(--neon-yellow)]';
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 relative">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">ImpresoGT // Ventas</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Ventas</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Control de costos y ganancias</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Ventas" value={`Q${totalVentas.toFixed(2)}`} icon={<DollarSign size={28} className="text-[var(--neon-cyan)]" />} accent="cyan" />
          <StatCard label="Total Costos" value={`Q${totalCostos.toFixed(2)}`} icon={<TrendingDown size={28} className="text-[var(--neon-red)]" />} accent="red" />
          <StatCard label="Ganancia Total" value={`Q${totalGanancias.toFixed(2)}`} icon={<TrendingUp size={28} className="text-[var(--neon-green)]" />} accent="green" />
          <StatCard label="Margen Promedio" value={`${margenPromedio.toFixed(1)}%`} icon={<Briefcase size={28} className="text-[var(--neon-magenta)]" />} accent="magenta" />
        </div>

        <div className="neon-card neon-card-cyan">
          <div className="p-5 border-b border-[var(--border-subtle)] flex justify-between items-center">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Todas las Ventas</h2>
            <button
              onClick={abrirModalNuevo}
              className="neon-btn-cyan flex items-center gap-2 px-4 py-2 text-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nueva Venta</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {trabajos.map(trabajo => (
              <div key={trabajo._id} className="p-4 sm:p-5 hover:bg-[var(--bg-surface)]/40 transition">
                <div className="flex flex-col gap-3 mb-2 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] break-words">{trabajo.nombre}</h3>
                      <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${estadoBadge(trabajo.estado)}`}>
                        {trabajo.estado}
                      </span>
                    </div>
                    {trabajo.cliente && (
                      <p className="text-sm text-[var(--text-secondary)] mt-1">Cliente: {trabajo.cliente}</p>
                    )}
                    {trabajo.descripcion && (
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 break-words">{trabajo.descripcion}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:flex lg:items-center">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Costo</p>
                      <p className="font-semibold neon-text-red text-sm sm:text-base">Q{trabajo.costoProduccion.toFixed(2)}</p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Venta</p>
                      <p className="font-semibold neon-text-cyan text-sm sm:text-base">Q{trabajo.precioVenta.toFixed(2)}</p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Ganancia</p>
                      <p className="font-bold neon-text-green text-sm sm:text-base">Q{trabajo.ganancia.toFixed(2)}</p>
                      <p className="text-xs text-[var(--neon-green)] opacity-70">({trabajo.porcentajeGanancia.toFixed(1)}%)</p>
                    </div>
                  </div>

                  <div className="flex gap-1 justify-end lg:ml-2">
                    <button
                      onClick={() => toggleExpandir(trabajo._id)}
                      className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--neon-cyan)] hover:bg-[var(--bg-surface)] transition"
                      title="Ver detalles"
                    >
                      {expandido === trabajo._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button
                      onClick={() => editarTrabajo(trabajo)}
                      className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--neon-yellow)] hover:bg-[var(--bg-surface)] transition"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => eliminarTrabajo(trabajo._id)}
                      className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--neon-red)] hover:bg-[var(--bg-surface)] transition"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {expandido === trabajo._id && (
                  <div className="mt-4 p-4 rounded-lg bg-[var(--bg-base)]/60 border border-[var(--border-subtle)]">
                    <h4 className="font-semibold mb-2 text-[var(--text-primary)]">Ventas Declaradas:</h4>
                    <div className="overflow-x-auto -mx-2 px-2">
                      <table className="w-full text-sm mb-4 min-w-[480px]">
                        <thead>
                          <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-wider">
                            <th className="pb-2 pr-3">Producto</th>
                            <th className="pb-2 pr-3">Cant.</th>
                            <th className="pb-2 pr-3">C. Compra</th>
                            <th className="pb-2 pr-3">P. Venta</th>
                            <th className="pb-2">C. Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trabajo.materiales.map((mat, idx) => (
                            <tr key={idx} className="border-t border-[var(--border-subtle)] text-[var(--text-secondary)]">
                              <td className="py-2 pr-3">{mat.nombreProducto ?? '-'}</td>
                              <td className="pr-3">{mat.cantidad ?? 0}</td>
                              <td className="pr-3">Q{(mat.costoUnitario ?? 0).toFixed(2)}</td>
                              <td className="pr-3">Q{(mat.precioVentaUnitario ?? 0).toFixed(2)}</td>
                              <td>Q{(mat.costoTotal ?? 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {trabajo.costosAdicionales > 0 && (
                      <div className="mb-2">
                        <p className="text-sm text-[var(--text-secondary)]"><span className="font-semibold text-[var(--text-primary)]">Costos Adicionales:</span> Q{trabajo.costosAdicionales.toFixed(2)}</p>
                        {trabajo.notaCostos && <p className="text-sm text-[var(--text-muted)]">{trabajo.notaCostos}</p>}
                      </div>
                    )}

                    <p className="text-xs text-[var(--text-muted)]">Creado: {new Date(trabajo.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            ))}

            {trabajos.length === 0 && (
              <div className="p-12 text-center text-[var(--text-muted)]">
                <Briefcase size={48} className="mx-auto mb-4 text-[var(--neon-cyan)] opacity-50" />
                <p className="text-[var(--text-secondary)]">No hay ventas registradas aún</p>
                <p className="text-sm">Crea tu primer registro para empezar a controlar ventas y ganancias</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadein">
          <div className="neon-card neon-card-cyan max-w-3xl w-full p-5 sm:p-6 my-8 max-h-[90vh] overflow-y-auto animate-popup">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold neon-text-cyan">
                {trabajoSeleccionado ? 'Editar Venta' : 'Nueva Venta'}
              </h3>
              <button onClick={() => setMostrarModal(false)} className="text-[var(--text-muted)] hover:text-[var(--neon-red)] transition">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)] mb-2">Nombre del Trabajo *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="neon-input"
                    placeholder="Ej: 1000 volantes full color"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)] mb-2">Cliente</label>
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    className="neon-input"
                    placeholder="Nombre del cliente"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)] mb-2">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="neon-input"
                  rows={2}
                  placeholder="Detalles del trabajo"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)]">Ventas Declaradas</label>
                  <button
                    type="button"
                    onClick={agregarMaterial}
                    className="text-sm text-[var(--neon-cyan)] hover:text-white flex items-center gap-1 transition"
                  >
                    <Plus size={14} />
                    Agregar
                  </button>
                </div>

                <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-2">
                  <div className="col-span-7">Producto</div>
                  <div className="col-span-2">Cant.</div>
                  <div className="col-span-2">Venta total</div>
                  <div className="col-span-1"></div>
                </div>
                {formData.materiales.map((material, index) => (
                  <div key={index} className="flex flex-col gap-2 mb-2 p-3 bg-[var(--bg-base)]/60 rounded-lg border border-[var(--border-subtle)] sm:grid sm:grid-cols-12 sm:p-2">
                    <div className="sm:col-span-7">
                      <label className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1 sm:hidden">Producto</label>
                      <select
                        value={material.producto}
                        onChange={(e) => actualizarMaterial(index, 'producto', e.target.value)}
                        className="neon-input text-sm py-1.5"
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map(p => (
                          <option key={p._id} value={p._id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:col-span-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1 sm:hidden">Cantidad</label>
                        <input
                          type="number"
                          min={0}
                          value={material.cantidad === 0 ? '' : material.cantidad}
                          onChange={(e) => actualizarMaterial(index, 'cantidad', e.target.value)}
                          onFocus={(e) => {
                            if (e.currentTarget.value === '0') {
                              actualizarMaterial(index, 'cantidad', '');
                            }
                          }}
                          className="neon-input text-sm py-1.5"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1 sm:hidden">Venta total</label>
                        <input
                          type="text"
                          value={`Q${(material.precioVentaUnitario * material.cantidad).toFixed(2)}`}
                          disabled
                          className="neon-input text-sm py-1.5 opacity-70"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end sm:col-span-1 sm:items-center sm:justify-center">
                      <button
                        type="button"
                        onClick={() => eliminarMaterial(index)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--neon-red)] hover:bg-[var(--bg-surface)] transition"
                        aria-label="Quitar material"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)] mb-2">Costos Adicionales</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costosAdicionales}
                    onChange={(e) => actualizarCostosAdicionales(Number(e.target.value))}
                    className="neon-input"
                    placeholder="Mano de obra, electricidad, etc."
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)] mb-2">Nota de Costos</label>
                  <input
                    type="text"
                    value={formData.notaCostos}
                    onChange={(e) => setFormData({ ...formData, notaCostos: e.target.value })}
                    className="neon-input"
                    placeholder="Descripción costos adicionales"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-[var(--border-subtle)] bg-gradient-to-br from-[rgba(0,240,255,0.06)] to-[rgba(255,0,170,0.06)]">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Costo de Producción</p>
                  <p className="text-xl font-bold neon-text-red">Q{formData.costoProduccion.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Total Ingresos</p>
                  <p className="text-xl font-bold neon-text-cyan">Q{formData.precioVenta.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Ganancia</p>
                  <p className="text-xl font-bold neon-text-green">
                    Q{(formData.precioVenta - formData.costoProduccion).toFixed(2)}
                  </p>
                  <p className="text-xs text-[var(--neon-green)] opacity-70">
                    ({formData.costoProduccion > 0
                      ? (((formData.precioVenta - formData.costoProduccion) / formData.costoProduccion) * 100).toFixed(1)
                      : '0'}%)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)] mb-2">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="neon-input"
                  >
                    <option value="Cotizado">Cotizado</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Completado">Completado</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)] mb-2">Fecha de Entrega</label>
                  <input
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                    className="neon-input"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={guardarTrabajo}
                  className="neon-btn-cyan flex-1 py-2.5"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: "cyan" | "magenta" | "green" | "red" }) {
  const textCls = {
    cyan: "neon-text-cyan",
    magenta: "neon-text-magenta",
    green: "neon-text-green",
    red: "neon-text-red",
  }[accent];
  const cardCls = accent === "cyan" || accent === "green" ? "neon-card neon-card-cyan" : "neon-card neon-card-magenta";
  return (
    <div className={`${cardCls} p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">{label}</p>
          <p className={`mt-2 text-2xl font-bold ${textCls}`}>{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

