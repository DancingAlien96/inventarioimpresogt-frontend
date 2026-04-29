"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, List, Briefcase, Box, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/productos", label: "Productos", icon: Box },
  { href: "/gastos", label: "Gastos", icon: CreditCard },
  { href: "/ventas", label: "Ventas", icon: Briefcase },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="flex h-full min-h-screen flex-col bg-slate-950 text-slate-100 shadow-xl border-r border-slate-800">
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 shadow-lg shadow-cyan-500/20">
            <Image src="/logo.png" alt="Logo ImpresoGT" width={28} height={28} className="rounded-xl" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">ImpresoGT</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Gestiona tu negocio</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-5 px-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Navegación
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition duration-200 ${
                  active
                    ? "bg-slate-800 text-white shadow-inner shadow-slate-900/40"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="grid place-items-center h-11 w-11 rounded-3xl bg-slate-900 text-slate-300 transition duration-200 group-hover:text-white">
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 px-6 py-5">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-red-300 transition duration-200 hover:bg-red-500/10 hover:text-white"
        >
          <LogOut size={18} />
          Salir
        </button>
      </div>
    </aside>
  );
}
