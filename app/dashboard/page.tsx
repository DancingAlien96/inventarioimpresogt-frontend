
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { Package, TrendingUp, DollarSign } from "lucide-react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

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

interface Compra {
  _id: string;
  descripcion: string;
  totalGastado: number;
  createdAt: string;
}

interface MaterialVenta {
  nombreProducto: string;
  cantidad: number;
  precioVentaUnitario: number;
}

interface Trabajo {
  _id: string;
  precioVenta: number;
  estado: string;
  materiales: MaterialVenta[];
  createdAt: string;
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
  const [compras, setCompras] = useState<Compra[]>([]);
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [resumenTrabajos, setResumenTrabajos] = useState({
    totalTrabajos: 0,
    totalVentas: 0,
    totalCostos: 0,
    totalGanancias: 0,
    margenPromedio: 0,
  });
  const [cargando, setCargando] = useState(true);

  const valorTotal = productos.reduce((sum, producto) => sum + producto.cantidad * producto.precioVenta, 0);
  const totalGastadoCompras = compras.reduce((sum, c) => sum + (c.totalGastado || 0), 0);
  const capitalDisponible = resumenTrabajos.totalGanancias - totalGastadoCompras;
  const lowStockCount = productos.filter(producto => producto.cantidad <= producto.stockMinimo).length;

  const trabajosFinalizados = trabajos.filter(t => ['Completado', 'Entregado'].includes(t.estado));

  const ventasPorMesMap = new Map<string, number>();
  for (const t of trabajosFinalizados) {
    const fecha = new Date(t.createdAt);
    if (Number.isNaN(fecha.getTime())) continue;
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    ventasPorMesMap.set(clave, (ventasPorMesMap.get(clave) || 0) + t.precioVenta);
  }
  const clavesMesesOrdenadas = Array.from(ventasPorMesMap.keys()).sort();
  const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const meses = clavesMesesOrdenadas.map(clave => {
    const [anio, mes] = clave.split('-');
    return `${nombresMeses[Number(mes) - 1]} ${anio}`;
  });
  const ventasPorMes = clavesMesesOrdenadas.map(clave => ventasPorMesMap.get(clave) || 0);

  const ventasPorProducto = new Map<string, number>();
  for (const t of trabajosFinalizados) {
    for (const m of t.materiales || []) {
      const monto = (m.precioVentaUnitario || 0) * (m.cantidad || 0);
      if (monto <= 0) continue;
      ventasPorProducto.set(m.nombreProducto, (ventasPorProducto.get(m.nombreProducto) || 0) + monto);
    }
  }
  const productosVenta = Array.from(ventasPorProducto.keys());
  const montosVenta = productosVenta.map(nombre => ventasPorProducto.get(nombre) || 0);

  const productoMargenLabels = productos.map(producto => producto.nombre);
  const productoMargenValores = productos.map(producto => producto.precioVenta - producto.precioCompra);
  const productoStockLabels = productos.map(producto => producto.nombre);
  const productoStockValores = productos.map(producto => producto.cantidad);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [resProductos, resCompras, resResumen, resTrabajos] = await Promise.all([
          api.get("/productos"),
          api.get("/compras"),
          api.get("/ventas/estadisticas/resumen"),
          api.get("/ventas"),
        ]);
        setProductos(resProductos.data);
        setCompras(resCompras.data);
        setResumenTrabajos(resResumen.data);
        setTrabajos(resTrabajos.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">ImpresoGT</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Bienvenido, {usuario?.nombre}</h1>
            </div>
            <div className="rounded-3xl bg-slate-100 px-4 py-3 text-slate-700 text-sm sm:text-base font-medium">
              Dashboard simplificado
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-sm text-gray-500">Productos registrados</p>
            <p className="text-3xl font-bold text-slate-900">{productos.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-sm text-gray-500">Valor del inventario</p>
            <p className="text-3xl font-bold text-slate-900">Q{valorTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-sm text-gray-500">Capital disponible</p>
            <p className={`text-3xl font-bold ${capitalDisponible < 0 ? 'text-red-600' : 'text-slate-900'}`}>Q{capitalDisponible.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-sm text-gray-500">Margen promedio</p>
            <p className="text-3xl font-bold text-slate-900">{resumenTrabajos.margenPromedio.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Tendencia mensual</p>
                <h2 className="text-xl font-semibold text-slate-900">Ventas por mes</h2>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
            <Bar
              data={{
                labels: meses,
                datasets: [
                  {
                    label: 'Ventas',
                    data: ventasPorMes,
                    backgroundColor: 'rgba(59,130,246,0.75)',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, ticks: { callback: (value: string | number) => `Q${value}` } },
                },
              }}
              height={260}
            />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Distribución de ventas</p>
                <h2 className="text-xl font-semibold text-slate-900">Ventas por producto</h2>
              </div>
              <DollarSign className="text-indigo-600" size={32} />
            </div>
            <Pie
              data={{
                labels: productosVenta,
                datasets: [
                  {
                    data: montosVenta,
                    backgroundColor: [
                      'rgba(59,130,246,0.75)',
                      'rgba(16,185,129,0.75)',
                      'rgba(239,68,68,0.75)',
                      'rgba(245,158,11,0.75)',
                      'rgba(168,85,247,0.75)',
                    ],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { position: 'bottom' as const } },
              }}
              height={260}
            />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Ganancia por unidad</p>
              <h2 className="text-xl font-semibold text-slate-900">Margen por producto</h2>
            </div>
            <Bar
              data={{
                labels: productoMargenLabels,
                datasets: [
                  {
                    label: 'Margen',
                    data: productoMargenValores,
                    backgroundColor: 'rgba(34,197,94,0.75)',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, ticks: { callback: (value: string | number) => `Q${value}` } },
                },
              }}
              height={260}
            />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Stock actual</p>
              <h2 className="text-xl font-semibold text-slate-900">Productos en inventario</h2>
            </div>
            <Bar
              data={{
                labels: productoStockLabels,
                datasets: [
                  {
                    label: 'Cantidad',
                    data: productoStockValores,
                    backgroundColor: 'rgba(59,130,246,0.75)',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } },
              }}
              height={260}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow">
          <p className="text-sm text-gray-500">Productos con bajo stock</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{lowStockCount}</p>
        </div>
      </main>
    </div>
  );
}
