'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2,
  X,
  ArrowLeft,
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
  const { logout } = useAuth();
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
          cantidad: 1,
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
        nuevosMateriales[index].nombreProducto = productoSeleccionado.nombre;
        nuevosMateriales[index].costoUnitario = productoSeleccionado.precioCompra;
        nuevosMateriales[index].precioVentaUnitario = productoSeleccionado.precioVenta;
        nuevosMateriales[index].costoTotal = productoSeleccionado.precioCompra * nuevosMateriales[index].cantidad;
      }
    } else if (campo === 'cantidad') {
      nuevosMateriales[index].cantidad = Number(valor);
      nuevosMateriales[index].costoTotal = nuevosMateriales[index].costoUnitario * Number(valor);
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
      alert('Debe seleccionar un producto con precio de venta vÃ¡lido.');
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
        alert('Error al guardar trabajo. Revisa la consola para mÃ¡s detalles.');
      }
    }
  };

  const eliminarTrabajo = async (id: string) => {
    if (confirm('Â¿EstÃ¡s seguro de eliminar este trabajo?')) {
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

  // EstadÃ­sticas
  const trabajosCompletados = trabajos.filter(t => t.estado === 'Completado');
  const totalVentas = trabajosCompletados.reduce((sum, t) => sum + t.precioVenta, 0);
  const totalCostos = trabajosCompletados.reduce((sum, t) => sum + t.costoProduccion, 0);
  const totalGanancias = totalVentas - totalCostos;
  const margenPromedio = totalCostos > 0 ? (totalGanancias / totalCostos) * 100 : 0;

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ventas</h1>
                <p className="text-xs sm:text-sm text-gray-600">Control de costos y ganancias</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm sm:text-base"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* EstadÃ­sticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Ventas</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">Q{totalVentas.toFixed(2)}</p>
              </div>
              <DollarSign className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Costos</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">Q{totalCostos.toFixed(2)}</p>
              </div>
              <TrendingDown className="text-red-600" size={32} />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Ganancia Total</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">Q{totalGanancias.toFixed(2)}</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Margen Promedio</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{margenPromedio.toFixed(1)}%</p>
              </div>
              <Briefcase className="text-blue-600" size={32} />
            </div>
          </div>
        </div>

        {/* Lista de Ventas */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Todas las Ventas</h2>
            <button
              onClick={abrirModalNuevo}
              className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nueva Venta</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          </div>

          <div className="divide-y">
            {trabajos.map(trabajo => (
              <div key={trabajo._id} className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">{trabajo.nombre}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        trabajo.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                        trabajo.estado === 'En Proceso' ? 'bg-blue-100 text-blue-800' :
                        trabajo.estado === 'Entregado' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {trabajo.estado}
                      </span>
                    </div>
                    {trabajo.cliente && (
                      <p className="text-sm text-gray-800">Cliente: {trabajo.cliente}</p>
                    )}
                    {trabajo.descripcion && (
                      <p className="text-xs sm:text-sm text-gray-900 mt-1">{trabajo.descripcion}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-3 sm:mt-0">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Costo</p>
                      <p className="font-semibold text-red-600">Q{trabajo.costoProduccion.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Venta</p>
                      <p className="font-semibold text-green-600">Q{trabajo.precioVenta.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Ganancia</p>
                      <p className="font-bold text-blue-600">Q{trabajo.ganancia.toFixed(2)}</p>
                      <p className="text-xs text-blue-600">({trabajo.porcentajeGanancia.toFixed(1)}%)</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleExpandir(trabajo._id)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Ver detalles"
                      >
                        {expandido === trabajo._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      <button
                        onClick={() => editarTrabajo(trabajo)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => eliminarTrabajo(trabajo._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detalles expandidos */}
                {expandido === trabajo._id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Ventas Declaradas:</h4>
                    <table className="w-full text-sm mb-4">
                      <thead>
                        <tr className="text-left text-gray-600">
                          <th className="pb-2">Producto</th>
                          <th className="pb-2">Cantidad</th>
                          <th className="pb-2">Costo Compra</th>
                          <th className="pb-2">Precio Venta</th>
                          <th className="pb-2">Costo Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trabajo.materiales.map((mat, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-2">{mat.nombreProducto}</td>
                            <td>{mat.cantidad}</td>
                            <td>Q{mat.costoUnitario.toFixed(2)}</td>
                            <td>Q{mat.precioVentaUnitario.toFixed(2)}</td>
                            <td>Q{mat.costoTotal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {trabajo.costosAdicionales > 0 && (
                      <div className="mb-2">
                        <p className="text-sm"><span className="font-semibold">Costos Adicionales:</span> Q{trabajo.costosAdicionales.toFixed(2)}</p>
                        {trabajo.notaCostos && <p className="text-sm text-gray-600">{trabajo.notaCostos}</p>}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">Creado: {new Date(trabajo.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            ))}

            {trabajos.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay ventas registradas aÃºn</p>
                <p className="text-sm">Crea tu primer registro para empezar a controlar ventas y ganancias</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Trabajo */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-4 sm:p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {trabajoSeleccionado ? 'Editar Venta' : 'Nueva Venta'}
              </h3>
              <button onClick={() => setMostrarModal(false)} className="text-black hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Nombre del Trabajo *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-black placeholder-black"
                    placeholder="Ej: 1000 volantes full color"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Cliente</label>
                  <input
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-black placeholder-black"
                    placeholder="Nombre del cliente"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">DescripciÃ³n</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-black placeholder-black"
                  rows={2}
                  placeholder="Detalles del trabajo"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-black">Ventas Declaradas</label>
                  <button
                    onClick={agregarMaterial}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Agregar Venta
                  </button>
                </div>

                {formData.materiales.map((material, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2 p-2 bg-gray-50 rounded">
                    <div className="col-span-5">
                      <select
                        value={material.producto}
                        onChange={(e) => actualizarMaterial(index, 'producto', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm text-black"
                      >
                        <option value="">Seleccionar producto</option>
                        {productos.map(p => (
                          <option key={p._id} value={p._id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={material.cantidad}
                        onChange={(e) => actualizarMaterial(index, 'cantidad', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm text-black placeholder-black"
                        placeholder="Cant."
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        value={material.costoUnitario}
                        onChange={(e) => actualizarMaterial(index, 'costoUnitario', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm text-black placeholder-black"
                        placeholder="Costo compra"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={`Q${material.precioVentaUnitario.toFixed(2)}`}
                        disabled
                        className="w-full px-2 py-1 border rounded text-sm bg-gray-100 text-black"
                        placeholder="Precio venta"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={`Q${material.costoTotal.toFixed(2)}`}
                        disabled
                        className="w-full px-2 py-1 border rounded text-sm bg-gray-100 text-black"
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <button
                        onClick={() => eliminarMaterial(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Costos Adicionales</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costosAdicionales}
                    onChange={(e) => actualizarCostosAdicionales(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md text-black placeholder-black"
                    placeholder="Mano de obra, electricidad, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Nota de Costos</label>
                  <input
                    type="text"
                    value={formData.notaCostos}
                    onChange={(e) => setFormData({ ...formData, notaCostos: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-black placeholder-black"
                    placeholder="DescripciÃ³n costos adicionales"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-black mb-1">Costo de ProducciÃ³n</p>
                  <p className="text-xl font-bold text-red-600">Q{formData.costoProduccion.toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-sm text-black mb-1">Total ingresos de ventas</label>
                  <input
                    type="text"
                    value={`Q${formData.precioVenta.toFixed(2)}`}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-100 text-black"
                  />
                </div>

                <div>
                  <p className="text-sm text-black mb-1">Ganancia</p>
                  <p className="text-xl font-bold text-green-600">
                    Q{(formData.precioVenta - formData.costoProduccion).toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">
                    ({formData.costoProduccion > 0
                      ? (((formData.precioVenta - formData.costoProduccion) / formData.costoProduccion) * 100).toFixed(1)
                      : '0'}%)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  >
                    <option value="Cotizado">Cotizado</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Completado">Completado</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Fecha de Entrega</label>
                  <input
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-black"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={guardarTrabajo}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300"
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

