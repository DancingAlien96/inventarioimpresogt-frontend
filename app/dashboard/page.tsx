'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit, 
  Trash2,
  X,
  DollarSign,
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface Producto {
  _id: string;
  nombre: string;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
  categoria: string;
  stockMinimo: number;
  createdAt: string;
}

interface Movimiento {
  _id: string;
  tipo: 'Entrada' | 'Salida';
  producto: { _id: string; nombre: string };
  cantidad: number;
  nota: string;
  createdAt: string;
}

interface Gasto {
  id: string;
  categoria: string;
  monto: number;
  nota: string;
  fecha: string;
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  // --- Lógica de gráficas ---
  // Ventas por producto (sumatoria de precioVenta * cantidad por producto, solo salidas)
  let productosVenta: string[] = [];
  let montosVenta: number[] = [];
  // Ventas por mes (sumatoria de precioVenta * cantidad por mes, solo salidas)
  let meses: string[] = [];
  let ventasPorMes: number[] = [];
  if (Array.isArray(movimientos) && movimientos.length > 0 && Array.isArray(productos) && productos.length > 0) {
    // Ventas por producto
    const ventasPorProducto: { [nombre: string]: number } = {};
    movimientos.forEach(mov => {
      if (mov.tipo === 'Salida') {
        const nombre = mov.producto?.nombre || 'Desconocido';
        // Buscar el precioVenta actual del producto
        const prod = productos.find(p => p._id === mov.producto?._id);
        const precioVenta = prod?.precioVenta || 0;
        ventasPorProducto[nombre] = (ventasPorProducto[nombre] || 0) + (precioVenta * mov.cantidad);
      }
    });
    productosVenta = Object.keys(ventasPorProducto);
    montosVenta = productosVenta.map(n => ventasPorProducto[n]);

    // Ventas por mes
    const ventasMes: { [mes: string]: number } = {};
    movimientos.forEach(mov => {
      if (mov.tipo === 'Salida') {
        const fecha = new Date(mov.createdAt);
        const mes = fecha.toLocaleString('default', { month: 'short', year: '2-digit' });
        const prod = productos.find(p => p._id === mov.producto?._id);
        const precioVenta = prod?.precioVenta || 0;
        ventasMes[mes] = (ventasMes[mes] || 0) + (precioVenta * mov.cantidad);
      }
    });
    meses = Object.keys(ventasMes);
    ventasPorMes = meses.map(m => ventasMes[m]);
  }
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalMovimiento, setMostrarModalMovimiento] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    cantidad: 0,
    precioCompra: 0,
    precioVenta: 0,
    categoria: 'Otros',
    stockMinimo: 5,
  });

  const [movimientoData, setMovimientoData] = useState({
    tipo: 'Entrada' as 'Entrada' | 'Salida',
    productoId: '',
    cantidad: 1,
    nota: '',
  });

  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [resumenTrabajos, setResumenTrabajos] = useState({
    totalTrabajos: 0,
    totalVentas: 0,
    totalCostos: 0,
    totalGanancias: 0,
    margenPromedio: 0,
  });
  const [mostrarModalGasto, setMostrarModalGasto] = useState(false);
  const [gastoData, setGastoData] = useState({
    categoria: 'Otros',
    monto: 0,
    nota: '',
  });

  async function cargarDatos() {
    try {
      const [resProductos, resMovimientos, resResumen] = await Promise.all([
        api.get('/productos'),
        api.get('/compras'),
        api.get('/ventas/estadisticas/resumen'),
      ]);
      setProductos(resProductos.data);
      setMovimientos(resMovimientos.data);
      setResumenTrabajos(resResumen.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  }

  function cargarGastos() {
    if (typeof window === 'undefined') return;
    try {
      const savedGastos = JSON.parse(localStorage.getItem('gastos') || '[]') as Gasto[];
      setGastos(savedGastos);
    } catch (error) {
      console.error('Error al cargar gastos:', error);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      cargarDatos();
      cargarGastos();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const abrirModalGasto = () => {
    setGastoData({
      categoria: 'Otros',
      monto: 0,
      nota: '',
    });
    setMostrarModalGasto(true);
  };

  const guardarGasto = () => {
    if (gastoData.monto <= 0) {
      alert('Ingresa un monto válido para el gasto.');
      return;
    }
    const nuevoGasto: Gasto = {
      id: String(Date.now()),
      categoria: gastoData.categoria,
      monto: Number(gastoData.monto),
      nota: gastoData.nota,
      fecha: new Date().toISOString(),
    };
    const nuevosGastos = [nuevoGasto, ...gastos];
    setGastos(nuevosGastos);
    localStorage.setItem('gastos', JSON.stringify(nuevosGastos));
    setMostrarModalGasto(false);
  };

  const abrirModalNuevo = () => {
    setProductoSeleccionado(null);
    setFormData({
      nombre: '',
      cantidad: 0,
      precioCompra: 0,
      precioVenta: 0,
      categoria: 'Otros',
      stockMinimo: 5,
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setFormData({
      nombre: producto.nombre,
      cantidad: producto.cantidad,
      precioCompra: producto.precioCompra,
      precioVenta: producto.precioVenta,
      categoria: producto.categoria,
      stockMinimo: producto.stockMinimo,
    });
    setMostrarModal(true);
  };

  const guardarProducto = async () => {
    try {
      if (productoSeleccionado) {
        await api.put(`/productos/${productoSeleccionado._id}`, formData);
      } else {
        await api.post('/productos', formData);
      }
      setMostrarModal(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
  };

  const eliminarProducto = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await api.delete(`/productos/${id}`);
        cargarDatos();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  };

  const abrirModalMovimiento = (producto: Producto) => {
    setMovimientoData({
      tipo: 'Entrada',
      productoId: producto._id,
      cantidad: 1,
      nota: '',
    });
    setMostrarModalMovimiento(true);
  };

  const guardarMovimiento = async () => {
    try {
      await api.post('/compras', {
        tipo: movimientoData.tipo,
        producto: movimientoData.productoId,
        cantidad: movimientoData.cantidad,
        nota: movimientoData.nota,
      });
      setMostrarModalMovimiento(false);
      cargarDatos();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Error al crear movimiento');
      }
    }
  };

  const productosBajoStock = productos.filter(p => p.cantidad <= p.stockMinimo);
  const valorTotal = productos.reduce((acc, p) => acc + (p.cantidad * p.precioVenta), 0);
  const gastosCompras = movimientos.reduce((sum, mov) => {
    if (mov.tipo === 'Entrada') {
      const producto = productos.find(p => p._id === mov.producto?._id);
      return sum + (producto?.precioCompra || 0) * mov.cantidad;
    }
    return sum;
  }, 0);
  const totalGastos = gastosCompras + gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  const capitalDisponible = resumenTrabajos.totalGanancias;

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">ImpresoGT</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Bienvenido, {usuario?.nombre}</h1>
            </div>
            <div className="rounded-3xl bg-slate-100 px-4 py-3 text-slate-700 text-sm sm:text-base font-medium">
              Dashboard de gestión
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Productos</p>
                <p className="text-3xl font-bold text-gray-900">{productos.length}</p>
              </div>
              <Package className="text-blue-600" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total Inventario</p>
                <p className="text-3xl font-bold text-gray-900">Q{valorTotal.toFixed(2)}</p>
              </div>
              <TrendingUp className="text-green-600" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Capital Disponible</p>
                <p className={`text-3xl font-bold ${capitalDisponible < 0 ? 'text-red-600' : 'text-gray-900'}`}>Q{capitalDisponible.toFixed(2)}</p>
              </div>
              <DollarSign className="text-indigo-600" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gastos acumulados</p>
                <p className="text-3xl font-bold text-red-600">Q{totalGastos.toFixed(2)}</p>
              </div>
              <TrendingDown className="text-red-600" size={40} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-gray-900">Resumen de ventas</h3>
                <p className="text-sm text-gray-600">El capital proviene de ventas completadas y ganancias del trabajo.</p>
              </div>
              <DollarSign className="text-indigo-600" size={28} />
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-semibold">Total ventas completadas:</span> Q{resumenTrabajos.totalVentas.toFixed(2)}</p>
              <p><span className="font-semibold">Ganancia neta de trabajos:</span> Q{resumenTrabajos.totalGanancias.toFixed(2)}</p>
              <p className="text-sm text-gray-500">El capital disponible se actualiza con la ganancia neta de los trabajos completados.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-gray-900">Registrar gasto</h3>
                <p className="text-sm text-gray-600">Agrega gastos fijos y ajusta el capital disponible.</p>
              </div>
              <button
                type="button"
                onClick={abrirModalGasto}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Nuevo gasto
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-semibold">Gastos totales:</span> Q{totalGastos.toFixed(2)}</p>
              <p><span className="font-semibold">Margen promedio:</span> {resumenTrabajos.margenPromedio.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Gastos adicionales se registran por separado para control, sin cambiar el capital disponible actual.</p>
            </div>
          </div>
        </div>

        {/* Gráficas de análisis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
            <h3 className="font-bold text-gray-900 mb-4">Ventas por mes</h3>
            <Bar
              data={{
                labels: meses,
                datasets: [
                  {
                    label: 'Ventas',
                    data: ventasPorMes,
                    backgroundColor: 'rgba(59,130,246,0.7)',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' as const },
                  title: { display: false },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (v: string | number) => `Q${v}` }
                  }
                }
              }}
              height={260}
            />
          </div>
          <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
            <h3 className="font-bold text-gray-900 mb-4">Ventas por producto</h3>
            <Pie
              data={{
                labels: productosVenta,
                datasets: [
                  {
                    label: 'Ventas',
                    data: montosVenta,
                    backgroundColor: [
                      'rgba(59,130,246,0.7)',
                      'rgba(239,68,68,0.7)',
                      'rgba(16,185,129,0.7)',
                      'rgba(245,158,11,0.7)',
                      'rgba(168,85,247,0.7)',
                      'rgba(251,191,36,0.7)',
                      'rgba(236,72,153,0.7)',
                      'rgba(34,197,94,0.7)',
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' as const },
                  title: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx: { parsed: number }) => `Q${ctx.parsed}`
                    }
                  }
                },
              }}
              height={260}
            />
          </div>
        </div>

        {/* Alertas de bajo stock */}
        {productosBajoStock.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-red-800 mb-2">âš ï¸ Productos con bajo stock:</h3>
            <ul className="list-disc list-inside text-red-700">
              {productosBajoStock.map(p => (
                <li key={p._id}>{p.nombre} - Solo {p.cantidad} unidades</li>
              ))}
            </ul>
          </div>
        )}

        {/* Productos */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 sm:p-6 border-b flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Productos</h2>
            <button
              onClick={abrirModalNuevo}
              className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nuevo Producto</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
          </div>

          {/* Vista Desktop - Tabla */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P. Compra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P. Venta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ganancia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productos.map(producto => (
                  <tr key={producto._id} className={producto.cantidad <= producto.stockMinimo ? 'bg-red-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{producto.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{producto.categoria}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-bold ${producto.cantidad <= producto.stockMinimo ? 'text-red-600' : 'text-gray-900'}`}>{producto.cantidad}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">Q{producto.precioCompra.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">Q{producto.precioVenta.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">Q{(producto.precioVenta - producto.precioCompra).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-bold ${((producto.precioVenta - producto.precioCompra) / producto.precioCompra * 100) > 50 ? 'text-green-600' : 'text-yellow-600'}`}>{producto.precioCompra > 0 ? ((producto.precioVenta - producto.precioCompra) / producto.precioCompra * 100).toFixed(1) : '0'}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => abrirModalMovimiento(producto)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Registrar movimiento"
                        >
                          <TrendingUp size={18} />
                        </button>
                        <button
                          onClick={() => abrirModalEditar(producto)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => eliminarProducto(producto._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista M\u00f3vil - Cards */}
          <div className="lg:hidden divide-y">
            {productos.map(producto => (
              <div 
                key={producto._id} 
                className={`p-4 ${producto.cantidad <= producto.stockMinimo ? 'bg-red-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                    <p className="text-sm text-gray-600">{producto.categoria}</p>
                  </div>
                  <span className={`text-2xl font-bold ${producto.cantidad <= producto.stockMinimo ? 'text-red-600' : 'text-gray-900'}`}>
                    {producto.cantidad}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600">Precio Compra</p>
                    <p className="font-semibold">Q{producto.precioCompra.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Precio Venta</p>
                    <p className="font-semibold">Q{producto.precioVenta.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ganancia</p>
                    <p className="font-semibold text-green-600">Q{(producto.precioVenta - producto.precioCompra).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Margen</p>
                    <p className={`font-semibold ${((producto.precioVenta - producto.precioCompra) / producto.precioCompra * 100) > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {producto.precioCompra > 0 ? ((producto.precioVenta - producto.precioCompra) / producto.precioCompra * 100).toFixed(1) : '0'}%
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t">
                  <button
                    onClick={() => abrirModalMovimiento(producto)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm"
                  >
                    <TrendingUp size={16} />
                    Movimiento
                  </button>
                  <button
                    onClick={() => abrirModalEditar(producto)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-md hover:bg-yellow-100"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => eliminarProducto(producto._id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {productos.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay productos registrados</p>
              </div>
            )}
          </div>
        </div>

        {/* Compras Recientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Compras Recientes</h2>
          </div>
          
          {/* Vista Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {movimientos.slice(0, 10).map(mov => (
                  <tr key={mov._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(mov.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        mov.tipo === 'Entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {mov.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{mov.producto.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{mov.cantidad}</td>
                    <td className="px-6 py-4">{mov.nota}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Vista M\u00f3vil - Cards */}
          <div className="md:hidden divide-y">
            {movimientos.slice(0, 10).map(mov => (
              <div key={mov._id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold">{mov.producto.nombre}</p>
                    <p className="text-xs text-gray-500">{new Date(mov.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    mov.tipo === 'Entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {mov.tipo}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Cantidad:</span>
                  <span className="font-semibold">{mov.cantidad}</span>
                </div>
                {mov.nota && (
                  <p className="text-sm text-gray-600 mt-2">{mov.nota}</p>
                )}
              </div>
            ))}
            
            {movimientos.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>No hay compras registradas</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Gastos recientes */}
      <div className="max-w-7xl mx-auto px-4 pb-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Gastos recientes</h2>
          </div>
          <div className="p-4 sm:p-6">
            {gastos.length === 0 ? (
              <p className="text-gray-600">No hay gastos registrados aún.</p>
            ) : (
              <div className="space-y-3">
                {gastos.slice(0, 8).map(gasto => (
                  <div key={gasto.id} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{gasto.categoria}</p>
                        <p className="text-sm text-gray-600">{new Date(gasto.fecha).toLocaleDateString()}</p>
                      </div>
                      <p className="text-red-600 font-bold">Q{gasto.monto.toFixed(2)}</p>
                    </div>
                    {gasto.nota && <p className="mt-2 text-sm text-gray-700">{gasto.nota}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Producto */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setMostrarModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Papel">Papel</option>
                  <option value="Tinta">Tinta</option>
                  <option value="Material Promocional">Material Promocional</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={formData.stockMinimo}
                    onChange={(e) => setFormData({ ...formData, stockMinimo: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Compra</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precioCompra}
                    onChange={(e) => setFormData({ ...formData, precioCompra: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precioVenta}
                    onChange={(e) => setFormData({ ...formData, precioVenta: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={guardarProducto}
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

      {/* Modal Gasto */}
      {mostrarModalGasto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Registrar Gasto</h3>
              <button onClick={() => setMostrarModalGasto(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input
                  type="text"
                  value={gastoData.categoria}
                  onChange={(e) => setGastoData({ ...gastoData, categoria: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ej. Servicios, Materiales, Administración"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={gastoData.monto}
                  onChange={(e) => setGastoData({ ...gastoData, monto: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Q0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
                <textarea
                  value={gastoData.nota}
                  onChange={(e) => setGastoData({ ...gastoData, nota: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Descripción opcional"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={guardarGasto}
                  className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                >
                  Guardar gasto
                </button>
                <button
                  onClick={() => setMostrarModalGasto(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Movimiento */}
      {mostrarModalMovimiento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 my-8 max-h-[90vh] overflow-y-auto sm:p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Registrar Movimiento</h3>
              <button onClick={() => setMostrarModalMovimiento(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={movimientoData.tipo}
                  onChange={(e) => setMovimientoData({ ...movimientoData, tipo: e.target.value as 'Entrada' | 'Salida' })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Entrada">Entrada</option>
                  <option value="Salida">Salida</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={movimientoData.cantidad}
                  onChange={(e) => setMovimientoData({ ...movimientoData, cantidad: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opcional)</label>
                <textarea
                  value={movimientoData.nota}
                  onChange={(e) => setMovimientoData({ ...movimientoData, nota: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={guardarMovimiento}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setMostrarModalMovimiento(false)}
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

