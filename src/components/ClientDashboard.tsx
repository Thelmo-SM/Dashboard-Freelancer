'use client';

import { ReactNode, useMemo, useState } from 'react';

type ServicioCategoria = 'Landing Page' | 'E-commerce' | 'Aplicaciones Web';

type Solicitud = {
  id: string;
  nombre: string;
  mensaje: string;
  categoria: ServicioCategoria;
  fecha: string;
};

type Cotizacion = {
  id: string;
  cliente: string;
  servicio: string;
  presupuesto: string;
  fecha: string;
  estado: 'Pendiente' | 'Revisada';
};

type Contacto = {
  id: string;
  nombre: string;
  correo: string;
  asunto: string;
  fecha: string;
};

type ProyectoPendiente = {
  id: number;
  cliente: string;
  proyecto: string;
  estado: string;
  nota: string;
};

const solicitudes: Solicitud[] = [
  {
    id: 'SOL-001',
    nombre: 'María López',
    mensaje: 'Necesito una landing para lanzamiento de curso.',
    categoria: 'Landing Page',
    fecha: '2026-03-01',
  },
  {
    id: 'SOL-002',
    nombre: 'Carlos Pérez',
    mensaje: 'Quiero una tienda online para ropa deportiva.',
    categoria: 'E-commerce',
    fecha: '2026-03-03',
  },
  {
    id: 'SOL-003',
    nombre: 'Sofía Ruiz',
    mensaje: 'Busco app web para gestión de clientes.',
    categoria: 'Aplicaciones Web',
    fecha: '2026-03-04',
  },
  {
    id: 'SOL-004',
    nombre: 'Jorge Díaz',
    mensaje: 'Landing simple para captar leads.',
    categoria: 'Landing Page',
    fecha: '2026-03-06',
  },
];

const cotizaciones: Cotizacion[] = [
  {
    id: 'COT-015',
    cliente: 'Eva Martínez',
    servicio: 'E-commerce',
    presupuesto: '$1,800',
    fecha: '2026-03-02',
    estado: 'Pendiente',
  },
  {
    id: 'COT-016',
    cliente: 'Luis Herrera',
    servicio: 'Landing Page',
    presupuesto: '$750',
    fecha: '2026-03-05',
    estado: 'Revisada',
  },
];

const contactos: Contacto[] = [
  {
    id: 'CON-001',
    nombre: 'Ana Torres',
    correo: 'ana@email.com',
    asunto: 'Información de servicios',
    fecha: '2026-03-03',
  },
  {
    id: 'CON-002',
    nombre: 'Miguel Gómez',
    correo: 'miguel@email.com',
    asunto: 'Reunión para proyecto',
    fecha: '2026-03-06',
  },
];

type Seccion = 'Resumen' | 'Servicios' | 'Cotizaciones' | 'Proyectos' | 'Contactos' | 'Configuración';

const secciones: Seccion[] = ['Resumen', 'Servicios', 'Cotizaciones', 'Proyectos', 'Contactos', 'Configuración'];

export default function ClientDashboard() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('Resumen');
  const [categoriaActiva, setCategoriaActiva] = useState<ServicioCategoria>('Landing Page');
  const [proyectos, setProyectos] = useState<ProyectoPendiente[]>([
    { id: 1, cliente: 'Carla Méndez', proyecto: 'Portal corporativo', estado: 'En revisión', nota: 'Enviar propuesta final.' },
    { id: 2, cliente: 'Studio Fit', proyecto: 'Dashboard interno', estado: 'Pendiente', nota: 'Falta definir accesos.' },
  ]);

  const solicitudesFiltradas = useMemo(
    () => solicitudes.filter((solicitud) => solicitud.categoria === categoriaActiva),
    [categoriaActiva],
  );

  const agregarProyecto = () => {
    setProyectos((prev) => [
      ...prev,
      {
        id: Date.now(),
        cliente: '',
        proyecto: '',
        estado: 'Pendiente',
        nota: '',
      },
    ]);
  };

  const actualizarProyecto = (id: number, campo: keyof ProyectoPendiente, valor: string) => {
    setProyectos((prev) =>
      prev.map((proyecto) => (proyecto.id === id ? { ...proyecto, [campo]: valor } : proyecto)),
    );
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-72 bg-black text-gray-100 p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">Thelmo SM</h2>
        <nav className="space-y-2">
          {secciones.map((seccion) => (
            <button
              key={seccion}
              className={`w-full text-left px-4 py-2 rounded transition ${
                seccionActiva === seccion ? 'bg-indigo-600 text-white' : 'hover:bg-zinc-800'
              }`}
              onClick={() => setSeccionActiva(seccion)}
            >
              {seccion === 'Servicios' ? 'Solicitud de servicios' : seccion === 'Proyectos' ? 'Proyectos pendientes' : seccion}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 text-slate-900">
        {seccionActiva === 'Resumen' && (
          <section>
            <h1 className="text-2xl font-bold mb-4">Resumen</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card title="Solicitudes" value={String(solicitudes.length)} />
              <Card title="Cotizaciones" value={String(cotizaciones.length)} />
              <Card title="Contactos" value={String(contactos.length)} />
            </div>
            <p className="mt-6 text-sm text-slate-600">
              Panel listo para conectar con Firebase y empezar a leer datos reales.
            </p>
          </section>
        )}

        {seccionActiva === 'Servicios' && (
          <section>
            <h1 className="text-2xl font-bold mb-4">Solicitud de servicios</h1>
            <div className="flex gap-2 mb-4">
              {(['Landing Page', 'E-commerce', 'Aplicaciones Web'] as ServicioCategoria[]).map((categoria) => (
                <button
                  key={categoria}
                  className={`px-4 py-2 rounded border ${
                    categoriaActiva === categoria
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => setCategoriaActiva(categoria)}
                >
                  {categoria}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {solicitudesFiltradas.map((solicitud) => (
                <article key={solicitud.id} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                  <div className="flex justify-between">
                    <p className="font-semibold">{solicitud.nombre}</p>
                    <p className="text-sm text-slate-500">{solicitud.fecha}</p>
                  </div>
                  <p className="text-sm text-slate-700 mt-2">{solicitud.mensaje}</p>
                </article>
              ))}
              {solicitudesFiltradas.length === 0 && <p>No hay mensajes en esta categoría.</p>}
            </div>
          </section>
        )}

        {seccionActiva === 'Cotizaciones' && (
          <section>
            <h1 className="text-2xl font-bold mb-4">Cotizaciones</h1>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <Th>ID</Th>
                    <Th>Cliente</Th>
                    <Th>Servicio</Th>
                    <Th>Presupuesto</Th>
                    <Th>Estado</Th>
                  </tr>
                </thead>
                <tbody>
                  {cotizaciones.map((cotizacion) => (
                    <tr key={cotizacion.id} className="border-t border-slate-100">
                      <Td>{cotizacion.id}</Td>
                      <Td>{cotizacion.cliente}</Td>
                      <Td>{cotizacion.servicio}</Td>
                      <Td>{cotizacion.presupuesto}</Td>
                      <Td>{cotizacion.estado}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {seccionActiva === 'Proyectos' && (
          <section>
            <h1 className="text-2xl font-bold mb-4">Proyectos pendientes</h1>
            <p className="mb-4 text-sm text-slate-600">
              Espacio personalizable tipo apuntes/Excel para que gestiones tus pendientes por cliente.
            </p>
            <div className="bg-white rounded-lg border border-slate-200 p-3 overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-200">
                    <Th>Cliente</Th>
                    <Th>Proyecto</Th>
                    <Th>Estado</Th>
                    <Th>Nota</Th>
                  </tr>
                </thead>
                <tbody>
                  {proyectos.map((proyecto) => (
                    <tr key={proyecto.id} className="border-b border-slate-100">
                      <Td>
                        <input
                          value={proyecto.cliente}
                          onChange={(e) => actualizarProyecto(proyecto.id, 'cliente', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                          placeholder="Cliente"
                        />
                      </Td>
                      <Td>
                        <input
                          value={proyecto.proyecto}
                          onChange={(e) => actualizarProyecto(proyecto.id, 'proyecto', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                          placeholder="Proyecto"
                        />
                      </Td>
                      <Td>
                        <input
                          value={proyecto.estado}
                          onChange={(e) => actualizarProyecto(proyecto.id, 'estado', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                          placeholder="Estado"
                        />
                      </Td>
                      <Td>
                        <input
                          value={proyecto.nota}
                          onChange={(e) => actualizarProyecto(proyecto.id, 'nota', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                          placeholder="Nota"
                        />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={agregarProyecto}
              className="mt-4 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500"
            >
              + Agregar fila
            </button>
          </section>
        )}

        {seccionActiva === 'Contactos' && (
          <section>
            <h1 className="text-2xl font-bold mb-4">Contactos</h1>
            <div className="space-y-3">
              {contactos.map((contacto) => (
                <article key={contacto.id} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                  <div className="flex justify-between flex-wrap gap-2">
                    <p className="font-semibold">{contacto.nombre}</p>
                    <p className="text-sm text-slate-500">{contacto.fecha}</p>
                  </div>
                  <p className="text-sm">{contacto.correo}</p>
                  <p className="text-sm text-slate-700 mt-2">{contacto.asunto}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {seccionActiva === 'Configuración' && (
          <section>
            <h1 className="text-2xl font-bold mb-4">Configuración</h1>
            <p className="text-sm text-slate-600">
              Aquí puedes añadir después las credenciales y colecciones para Firebase.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-500">{children}</th>;
}

function Td({ children }: { children: ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}
