
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
  const capitalDisponible = resumenTrabajos.totalVentas - totalGastadoCompras;
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
        <div className="neon-spinner h-14 w-14"></div>
      </div>
    );
  }

  const gridColor = 'rgba(255,255,255,0.05)';
  const tickColor = '#a0a0c8';

  const chartScaleY = {
    beginAtZero: true,
    grid: { color: gridColor },
    ticks: { color: tickColor, callback: (value: string | number) => `Q${value}` },
  };
  const chartScaleX = {
    grid: { color: gridColor },
    ticks: { color: tickColor },
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">ImpresoGT // Panel</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Bienvenido, <span className="neon-text-cyan">{usuario?.nombre}</span>
              </h1>
            </div>
            <div className="rounded-xl border border-[rgba(0,240,255,0.3)] bg-[var(--bg-card)] px-4 py-2 text-[var(--text-secondary)] text-sm font-medium shadow-[0_0_16px_rgba(0,240,255,0.1)]">
              Resumen general
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Productos registrados" value={String(productos.length)} accent="cyan" />
          <StatCard label="Valor del inventario" value={`Q${valorTotal.toFixed(2)}`} accent="cyan" />
          <StatCard
            label="Capital disponible"
            value={`Q${capitalDisponible.toFixed(2)}`}
            accent={capitalDisponible < 0 ? "red" : "magenta"}
          />
          <StatCard label="Margen promedio" value={`${resumenTrabajos.margenPromedio.toFixed(1)}%`} accent="cyan" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Ventas por mes" subtitle="Tendencia mensual" icon={<TrendingUp className="text-[var(--neon-cyan)]" size={28} />}>
            <Bar
              data={{
                labels: meses,
                datasets: [{
                  label: 'Ventas',
                  data: ventasPorMes,
                  backgroundColor: 'rgba(0,240,255,0.6)',
                  borderColor: '#00f0ff',
                  borderWidth: 1.5,
                  borderRadius: 6,
                }],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: chartScaleY, x: chartScaleX },
              }}
              height={260}
            />
          </ChartCard>

          <ChartCard title="Ventas por producto" subtitle="Distribución" icon={<DollarSign className="text-[var(--neon-magenta)]" size={28} />}>
            <Pie
              data={{
                labels: productosVenta,
                datasets: [{
                  data: montosVenta,
                  backgroundColor: ['#00f0ff', '#ff00aa', '#39ff88', '#ffd60a', '#8b5cf6', '#ff4060', '#0080ff', '#aa0080'],
                  borderColor: '#0a0a1a',
                  borderWidth: 2,
                }],
              }}
              options={{
                responsive: true,
                plugins: { legend: { position: 'bottom' as const, labels: { color: tickColor } } },
              }}
              height={260}
            />
          </ChartCard>

          <ChartCard title="Margen por producto" subtitle="Ganancia por unidad" icon={<TrendingUp className="text-[var(--neon-green)]" size={28} />}>
            <Bar
              data={{
                labels: productoMargenLabels,
                datasets: [{
                  label: 'Margen',
                  data: productoMargenValores,
                  backgroundColor: 'rgba(57,255,136,0.55)',
                  borderColor: '#39ff88',
                  borderWidth: 1.5,
                  borderRadius: 6,
                }],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: chartScaleY, x: chartScaleX },
              }}
              height={260}
            />
          </ChartCard>

          <ChartCard title="Productos en inventario" subtitle="Stock actual" icon={<Package className="text-[var(--neon-cyan)]" size={28} />}>
            <Bar
              data={{
                labels: productoStockLabels,
                datasets: [{
                  label: 'Cantidad',
                  data: productoStockValores,
                  backgroundColor: 'rgba(255,0,170,0.55)',
                  borderColor: '#ff00aa',
                  borderWidth: 1.5,
                  borderRadius: 6,
                }],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor } },
                  x: chartScaleX,
                },
              }}
              height={260}
            />
          </ChartCard>
        </div>

        <div className="neon-card neon-card-magenta p-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">Alertas</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Productos con bajo stock</p>
            <p className="mt-2 text-3xl font-bold neon-text-magenta">{lowStockCount}</p>
          </div>
          <Package className="text-[var(--neon-magenta)] animate-float" size={56} />
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: "cyan" | "magenta" | "red" }) {
  const textCls = accent === "cyan" ? "neon-text-cyan" : accent === "magenta" ? "neon-text-magenta" : "neon-text-red";
  const cardCls = accent === "magenta" || accent === "red" ? "neon-card neon-card-magenta" : "neon-card neon-card-cyan";
  return (
    <div className={`${cardCls} p-5`}>
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-muted)]">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${textCls}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="neon-card neon-card-cyan p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">{subtitle}</p>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
        </div>
        {icon}
      </div>
      {children}
    </div>
  );
}
