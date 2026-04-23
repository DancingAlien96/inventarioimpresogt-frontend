"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { Menu } from "lucide-react";

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
              <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r py-6 px-4 md:hidden h-screen">
                <Sidebar />
              </aside>
            </>
          )}

          <main className="flex-1 min-h-screen bg-gray-50">
            <div className="md:hidden p-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm text-gray-800"
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