"use client";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-full">
        <Sidebar />
        <main className="flex-1 ml-56 bg-gray-50 min-h-screen">{children}</main>
      </div>
    </AuthProvider>
  );
}