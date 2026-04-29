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
              <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-100 border-r border-slate-900 py-4 px-3 md:hidden h-screen overflow-hidden shadow-2xl">
                <div className="flex justify-end mb-4 px-1">
                  <button onClick={() => setSidebarOpen(false)} className="rounded-full bg-white/10 p-2 text-slate-100 hover:bg-white/20">
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