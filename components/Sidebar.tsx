"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Box, Briefcase, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/productos", label: "Productos", icon: Box },
  { href: "/ventas", label: "Ventas", icon: Briefcase },
  { href: "/compras", label: "Compras", icon: ShoppingCart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="flex h-full flex-col bg-[var(--bg-surface)] text-[var(--text-primary)] border-r border-[var(--border-subtle)]">
      <div className="px-5 py-5 border-b border-[var(--border-subtle)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 cyber-grid pointer-events-none" />
        <div className="flex items-center gap-3 relative">
          <div className="grid place-items-center h-12 w-12 rounded-2xl bg-[var(--bg-card)] border border-[rgba(0,240,255,0.4)] shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <Image src="/logo.png" alt="Logo ImpresoGT" width={30} height={30} className="rounded-xl" />
          </div>
          <div>
            <p className="text-lg font-bold neon-text-cyan tracking-wide">ImpresoGT</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">Gestiona tu negocio</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="mb-4 px-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)]">
          Navegación
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border ${
                  active
                    ? "bg-gradient-to-r from-[rgba(0,240,255,0.15)] to-[rgba(255,0,170,0.1)] border-[rgba(0,240,255,0.4)] text-white shadow-[0_0_16px_rgba(0,240,255,0.2)]"
                    : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)]"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className={`grid place-items-center h-9 w-9 rounded-lg transition ${
                  active
                    ? 'bg-[var(--neon-cyan)] text-[#001020] shadow-[0_0_12px_rgba(0,240,255,0.6)]'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] group-hover:text-[var(--neon-cyan)]'
                }`}>
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[var(--border-subtle)] px-4 py-4">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(255,64,96,0.3)] bg-[rgba(255,64,96,0.05)] px-4 py-2.5 text-sm font-semibold text-[var(--neon-red)] transition-all duration-200 hover:bg-[rgba(255,64,96,0.15)] hover:shadow-[0_0_16px_rgba(255,64,96,0.3)]"
        >
          <LogOut size={16} />
          Salir
        </button>
      </div>
    </aside>
  );
}
