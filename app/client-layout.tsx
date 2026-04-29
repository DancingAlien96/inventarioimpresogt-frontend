"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <AuthProvider>
      {isLoginPage ? (
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      ) : (
      <div className="min-h-screen bg-gray-50">
        <div className="md:flex md:items-stretch h-full">
          <aside className="hidden md:flex md:flex-col md:w-56 min-h-screen bg-white border-r">
            <Sidebar />
          </aside>

          {sidebarOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
              <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-100 border-r border-slate-900 py-6 px-4 md:hidden h-screen overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="grid place-items-center h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400">
                      <span className="text-white font-bold">I</span>
                    </div>
                    <div>
                      <p className="text-base font-semibold">ImpresoGT</p>
                      <p className="text-xs uppercase text-slate-400">Gestiona tu negocio</p>
                    </div>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="text-slate-200 hover:text-white">
                    <X size={22} />
                  </button>
                </div>
                <Sidebar />
              </aside>
            </>
          )}

          <main className="flex-1 min-h-screen bg-gray-50">
            <div className="md:hidden p-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Menu size={18} />
                Menú
              </button>
            </div>
            {children}
          </main>
        </div>
      </div>
      )}
    </AuthProvider>
  );
}