import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-gray-200 flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8">Thelmo SM</h2>
        <nav className="flex flex-col gap-4 text-sm font-medium">
          <a href="#" className="hover:bg-gray-900 rounded px-4 py-2 transition">Resumen</a>
          <a href="#" className="hover:bg-gray-900 rounded px-4 py-2 transition">Solicitud de servicios</a>
          <a href="#" className="hover:bg-gray-900 rounded px-4 py-2 transition">Cotizaciones</a>
          <a href="#" className="hover:bg-gray-900 rounded px-4 py-2 transition">Proyectos Pendientes</a>
          <a href="#" className="hover:bg-gray-900 rounded px-4 py-2 transition">Reseñas</a>
          <a href="#" className="hover:bg-gray-900 rounded px-4 py-2 transition">Configuración</a>
        </nav>
        <div className="mt-auto pt-6 border-t border-b-gray-400">
          <a href="#" className="text-sm hover:text-gray-300">Cerrar sesión</a>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <header className="bg-gray-200 shadow px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">Panel de control</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
