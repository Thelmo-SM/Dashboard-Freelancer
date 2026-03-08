'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { collection, FirestoreError, getDocs, Timestamp } from 'firebase/firestore';
import { db, getMissingFirebaseEnvVars } from '@/utils/firebase';

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

type Seccion = 'Resumen' | 'Servicios' | 'Cotizaciones' | 'Proyectos' | 'Contactos' | 'Configuración';

type MessageRecord = Record<string, unknown>;

const secciones: Seccion[] = ['Resumen', 'Servicios', 'Cotizaciones', 'Proyectos', 'Contactos', 'Configuración'];
const categorias: ServicioCategoria[] = ['Landing Page', 'E-commerce', 'Aplicaciones Web'];

export default function ClientDashboard() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('Resumen');
  const [categoriaActiva, setCategoriaActiva] = useState<ServicioCategoria>('Landing Page');
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proyectos, setProyectos] = useState<ProyectoPendiente[]>([
    { id: 1, cliente: 'Carla Méndez', proyecto: 'Portal corporativo', estado: 'En revisión', nota: 'Enviar propuesta final.' },
    { id: 2, cliente: 'Studio Fit', proyecto: 'Dashboard interno', estado: 'Pendiente', nota: 'Falta definir accesos.' },
  ]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const missingVars = getMissingFirebaseEnvVars();
        if (missingVars.length > 0) {
          setError(`Faltan variables de entorno de Firebase: ${missingVars.join(', ')}`);
          setLoading(false);
          return;
        }

        const [messagesSnapshot, quotationsSnapshot] = await Promise.all([
          getDocs(collection(db, 'messages')),
          getDocs(collection(db, 'quotations')),
        ]);

        const loadedSolicitudes: Solicitud[] = [];
        const loadedCotizaciones: Cotizacion[] = [];
        const loadedContactos: Contacto[] = [];

        messagesSnapshot.forEach((docSnap) => {
          const data = docSnap.data() as MessageRecord;
          const tipo = detectMessageType(data);

          if (tipo === 'servicio') {
            const categoria = normalizeCategoria(data);
            if (!categoria) {
              return;
            }

            loadedSolicitudes.push({
              id: docSnap.id,
              nombre: readText(data, ['name', 'nombre', 'fullName'], 'Sin nombre'),
              mensaje: readText(data, ['message', 'mensaje', 'description'], 'Sin mensaje'),
              categoria,
              fecha: formatDate(data),
            });
          }

          if (tipo === 'cotizacion') {
            loadedCotizaciones.push({
              id: docSnap.id,
              cliente: readText(data, ['name', 'nombre', 'cliente'], 'Sin cliente'),
              servicio: readText(data, ['service', 'servicio', 'category', 'selectedService'], 'No especificado'),
              presupuesto: readText(data, ['budget', 'presupuesto', 'quoteAmount'], 'No especificado'),
              fecha: formatDate(data),
              estado: normalizeEstado(data),
            });
          }

          if (tipo === 'contacto') {
            loadedContactos.push({
              id: docSnap.id,
              nombre: readText(data, ['name', 'nombre'], 'Sin nombre'),
              correo: readText(data, ['email', 'correo'], 'Sin correo'),
              asunto: readText(data, ['subject', 'asunto', 'message', 'mensaje'], 'Sin asunto'),
              fecha: formatDate(data),
            });
          }
        });

        quotationsSnapshot.forEach((docSnap) => {
          const data = docSnap.data() as MessageRecord;

          loadedCotizaciones.push({
            id: docSnap.id,
            cliente: readText(data, ['name', 'nombre', 'cliente'], 'Sin cliente'),
            servicio: normalizeCategoria(data) ?? readText(data, ['service', 'servicio', 'category', 'selectedService'], 'No especificado'),
            presupuesto: readText(data, ['budget', 'presupuesto', 'quoteAmount'], 'No especificado'),
            fecha: formatDate(data),
            estado: normalizeEstado(data),
          });
        });

        setSolicitudes(loadedSolicitudes);
        setCotizaciones(loadedCotizaciones);
        setContactos(loadedContactos);
        setError(null);
      } catch (error: unknown) {
        setError(buildFirebaseErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  const solicitudesFiltradas = useMemo(
    () => solicitudes.filter((solicitud) => solicitud.categoria === categoriaActiva),
    [categoriaActiva, solicitudes],
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
        <h2 className="text-2xl font-bold mb-2">Thelmo SM</h2>
        <p className="text-xs text-gray-400 mb-6">Conectado a Firebase / collections: messages y quotations</p>
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
        {error && <Banner>{error}</Banner>}

        {seccionActiva === 'Resumen' && (
          <section>
            <h1 className="text-2xl font-bold mb-4">Resumen</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card title="Solicitudes" value={loading ? '...' : String(solicitudes.length)} />
              <Card title="Cotizaciones" value={loading ? '...' : String(cotizaciones.length)} />
              <Card title="Contactos" value={loading ? '...' : String(contactos.length)} />
            </div>
            <p className="mt-6 text-sm text-slate-600">Este panel ya usa Firebase para leer mensajes reales.</p>
          </section>
        )}

        {seccionActiva === 'Servicios' && (
          <section>
            <h1 className="text-2xl font-bold mb-4">Solicitud de servicios</h1>
            <div className="flex gap-2 mb-4">
              {categorias.map((categoria) => (
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

            {loading ? (
              <p>Cargando mensajes...</p>
            ) : (
              <div className="space-y-3">
                {solicitudesFiltradas.map((solicitud) => (
                  <article key={solicitud.id} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                    <div className="flex justify-between gap-2 flex-wrap">
                      <p className="font-semibold">{solicitud.nombre}</p>
                      <p className="text-sm text-slate-500">{solicitud.fecha}</p>
                    </div>
                    <p className="text-sm text-slate-700 mt-2">{solicitud.mensaje}</p>
                  </article>
                ))}
                {solicitudesFiltradas.length === 0 && <p>No hay mensajes en esta categoría.</p>}
              </div>
            )}
          </section>
        )}

        {seccionActiva === 'Cotizaciones' && (
          <section>
            <h1 className="text-2xl font-bold mb-4">Cotizaciones</h1>
            {loading ? (
              <p>Cargando cotizaciones...</p>
            ) : (
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
                        <Td>{cotizacion.id.slice(0, 8)}</Td>
                        <Td>{cotizacion.cliente}</Td>
                        <Td>{cotizacion.servicio}</Td>
                        <Td>{cotizacion.presupuesto}</Td>
                        <Td>{cotizacion.estado}</Td>
                      </tr>
                    ))}
                    {cotizaciones.length === 0 && (
                      <tr>
                        <Td>No hay cotizaciones registradas.</Td>
                        <Td>-</Td>
                        <Td>-</Td>
                        <Td>-</Td>
                        <Td>-</Td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
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
            {loading ? (
              <p>Cargando contactos...</p>
            ) : (
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
                {contactos.length === 0 && <p>No hay contactos registrados todavía.</p>}
              </div>
            )}
          </section>
        )}

        {seccionActiva === 'Configuración' && (
          <section>
            <h1 className="text-2xl font-bold mb-4">Configuración</h1>
            <p className="text-sm text-slate-600">
              Asegúrate de tener un archivo <code>.env.local</code> con las variables <code>NEXT_PUBLIC_FIREBASE_*</code>
              para leer datos en cliente.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}


function buildFirebaseErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error && 'code' in error) {
    const firebaseError = error as FirestoreError;

    if (firebaseError.code === 'permission-denied') {
      return 'Firestore bloqueó la lectura (permission-denied). Revisa las reglas de las colecciones messages y quotations.';
    }

    if (firebaseError.code === 'unauthenticated') {
      return 'Firestore requiere autenticación para leer messages/quotations (unauthenticated).';
    }

    if (firebaseError.code === 'unavailable') {
      return 'No hubo conexión con Firestore (unavailable). Revisa internet o configuración del proyecto.';
    }

    return `No se pudo leer Firestore (${firebaseError.code}). ${firebaseError.message}`;
  }

  return 'No se pudo leer Firestore. Verifica reglas y variables de Firebase.';
}

function detectMessageType(data: MessageRecord): 'servicio' | 'cotizacion' | 'contacto' | 'desconocido' {
  const value = readText(data, ['type', 'tipo', 'formType', 'source'], '').toLowerCase();
  const template = readText(data, ['template', 'templateId'], '').toLowerCase();

  if (value.includes('quotation') || value.includes('cotizacion') || value.includes('quote')) {
    return 'cotizacion';
  }

  if (template.includes('quote') || template.includes('cotiz')) {
    return 'cotizacion';
  }

  if (value.includes('service') || value.includes('servicio')) {
    return 'servicio';
  }

  if (template.includes('app') || template.includes('land') || template.includes('ecom') || template.includes('serv')) {
    return 'servicio';
  }

  if (value.includes('contact') || value.includes('contacto')) {
    return 'contacto';
  }

  if (hasAny(data, ['budget', 'presupuesto', 'quoteAmount'])) {
    return 'cotizacion';
  }

  if (hasAny(data, ['service', 'servicio', 'category', 'selectedService'])) {
    return 'servicio';
  }

  if (hasAny(data, ['email', 'correo']) && !hasAny(data, ['service', 'servicio', 'category', 'selectedService'])) {
    return 'contacto';
  }

  return 'desconocido';
}

function normalizeCategoria(data: MessageRecord): ServicioCategoria | null {
  const raw = readText(data, ['service', 'servicio', 'category', 'selectedService'], '').toLowerCase();

  if (raw.includes('landing')) {
    return 'Landing Page';
  }

  if (raw.includes('e-commerce') || raw.includes('ecommerce') || raw.includes('tienda')) {
    return 'E-commerce';
  }

  if (raw.includes('web app') || raw.includes('aplicaciones web') || raw.includes('aplicacion') || raw.includes('app')) {
    return 'Aplicaciones Web';
  }

  return null;
}

function normalizeEstado(data: MessageRecord): 'Pendiente' | 'Revisada' {
  const raw = readText(data, ['status', 'estado'], '').toLowerCase();
  return raw.includes('revis') ? 'Revisada' : 'Pendiente';
}

function readText(data: MessageRecord, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return fallback;
}

function hasAny(data: MessageRecord, keys: string[]): boolean {
  return keys.some((key) => {
    const value = data[key];
    return typeof value === 'string' ? value.trim().length > 0 : value !== undefined && value !== null;
  });
}

function formatDate(data: MessageRecord): string {
  const directDate = data.date;
  const createdAt = data.createdAt;
  const timestamp = directDate ?? createdAt;

  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleDateString('es-ES');
  }

  if (typeof timestamp === 'string') {
    const parsed = new Date(timestamp);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('es-ES');
    }
  }

  return 'Sin fecha';
}

function Banner({ children }: { children: ReactNode }) {
  return <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{children}</div>;
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
