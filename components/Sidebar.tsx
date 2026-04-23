"use client";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Home, List, Briefcase, Box } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();
  return (
    <aside className="flex flex-col min-h-screen py-6 px-4">
      <div className="mb-8 flex items-center gap-2">
        <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
        <span className="font-bold text-lg text-gray-900">ImpresoGT</span>
      </div>
      <nav className="flex-1 space-y-2">
        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 text-gray-800 font-medium">
          <Home size={18} /> Dashboard
        </Link>
          <Link href="/productos" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 text-gray-800 font-medium">
            <Box size={18} /> Productos
          </Link>
        <Link href="/movimientos" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 text-gray-800 font-medium">
          <List size={18} /> Movimientos
        </Link>
        <Link href="/trabajos" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-50 text-gray-800 font-medium">
          <Briefcase size={18} /> Trabajos
        </Link>
      </nav>
      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-red-50 text-red-600 font-medium mt-8"
      >
        <LogOut size={18} /> Salir
      </button>
    </aside>
  );
}
