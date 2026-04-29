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
    <aside className="flex flex-col min-h-screen bg-slate-950 text-slate-100 shadow-lg border-r border-slate-800">
      <div className="px-6 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 shadow-lg shadow-cyan-500/20">
            <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-xl" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">ImpresoGT</p>
            <p className="text-xs text-slate-400">Control de ventas</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-slate-800 text-white shadow-inner shadow-slate-900/40"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="grid place-items-center h-10 w-10 rounded-2xl bg-slate-900 text-slate-300 group-hover:text-white transition">
                <Icon size={18} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-6">
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-white"
        >
          <LogOut size={18} />
          Salir
        </button>
      </div>
    </aside>
  );
}
