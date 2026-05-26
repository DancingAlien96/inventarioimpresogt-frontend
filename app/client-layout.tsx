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
        <main className="min-h-screen">
          {children}
        </main>
      ) : (
      <div className="min-h-screen">
        <div className="md:flex md:items-stretch h-full">
          <aside className="hidden md:flex md:flex-col md:w-60 min-h-screen border-r border-[var(--border-subtle)]">
            <Sidebar />
          </aside>

          {sidebarOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
              <aside className="fixed inset-y-0 left-0 z-50 w-72 md:hidden h-screen overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.2)]">
                <div className="absolute top-3 right-3 z-10">
                  <button onClick={() => setSidebarOpen(false)} className="rounded-full bg-white/5 p-2 text-[var(--text-primary)] hover:bg-white/10 border border-[var(--border-subtle)]">
                    <X size={20} />
                  </button>
                </div>
                <Sidebar />
              </aside>
            </>
          )}

          <main className="flex-1 min-h-screen">
            <div className="md:hidden p-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--neon-cyan)] transition"
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
