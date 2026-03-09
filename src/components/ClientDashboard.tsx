'use client';

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { collection, deleteDoc, doc, FirestoreError, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/utils/firebase';

type ServicioCategoria = 'Landing Page' | 'E-commerce' | 'Aplicaciones Web';

type Solicitud = {
  id: string;
  nombre: string;
  mensaje: string;
  categoria: ServicioCategoria;
  fecha: string;
  sourceCollection: 'messages';
};

type Cotizacion = {
  id: string;
  cliente: string;
  correo: string;
  servicio: string;
  presupuesto: string;
  fecha: string;
  estado: 'Pendiente' | 'Revisada';
  projectType: string;
  functionalities: string[];
  designPreferences: string;
  deadline: string;
  references: string;
  additionalDetails: string;
  sourceCollection: 'messages' | 'quotations';
};

type Contacto = {
  id: string;
  nombre: string;
  correo: string;
  asunto: string;
  fecha: string;
  sourceCollection: 'messages';
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

type AppNotification = {
  id: string;
  text: string;
  createdAt: string;
};

const secciones: Seccion[] = ['Resumen', 'Servicios', 'Cotizaciones', 'Proyectos', 'Contactos', 'Configuración'];
const categorias: ServicioCategoria[] = ['Landing Page', 'E-commerce', 'Aplicaciones Web'];

export default function ClientDashboard() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('Resumen');
  const [categoriaActiva, setCategoriaActiva] = useState<ServicioCategoria>('Landing Page');
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<Cotizacion | null>(null);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [verNotificaciones, setVerNotificaciones] = useState(false);
  const [notificaciones, setNotificaciones] = useState<AppNotification[]>([]);
  const knownRecordIdsRef = useRef<Set<string>>(new Set());
  const [proyectos, setProyectos] = useState<ProyectoPendiente[]>([
    { id: 1, cliente: 'Carla Méndez', proyecto: 'Portal corporativo', estado: 'En revisión', nota: 'Enviar propuesta final.' },
    { id: 2, cliente: 'Studio Fit', proyecto: 'Dashboard interno', estado: 'Pendiente', nota: 'Falta definir accesos.' },
  ]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
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
              sourceCollection: 'messages',
            });
          }

          if (tipo === 'cotizacion') {
            loadedCotizaciones.push({
              id: docSnap.id,
              cliente: readText(data, ['name', 'nombre', 'cliente'], 'Sin cliente'),
              correo: readText(data, ['email', 'correo'], 'Sin correo'),
              servicio: readText(data, ['service', 'servicio', 'category', 'selectedService'], 'No especificado'),
              presupuesto: readText(data, ['budget', 'presupuesto', 'quoteAmount'], 'No especificado'),
              fecha: formatDate(data),
              estado: normalizeEstado(data),
              projectType: normalizeProjectType(data),
              functionalities: readArray(data, ['functionalities', 'funcionalidades']),
              designPreferences: readText(data, ['designPreferences', 'preferenciasDiseno'], 'Sin especificar'),
              deadline: readText(data, ['deadline', 'plazo'], 'Sin especificar'),
              references: readText(data, ['references', 'referencias'], 'Sin especificar'),
              additionalDetails: readText(data, ['additionalDetails', 'detallesAdicionales'], 'Sin especificar'),
              sourceCollection: 'messages',
            });
          }

          if (tipo === 'contacto') {
            loadedContactos.push({
              id: docSnap.id,
              nombre: readText(data, ['name', 'nombre'], 'Sin nombre'),
              correo: readText(data, ['email', 'correo'], 'Sin correo'),
              asunto: readText(data, ['subject', 'asunto', 'message', 'mensaje'], 'Sin asunto'),
              fecha: formatDate(data),
              sourceCollection: 'messages',
            });
          }
        });

        quotationsSnapshot.forEach((docSnap) => {
          const data = docSnap.data() as MessageRecord;

          loadedCotizaciones.push({
            id: docSnap.id,
            cliente: readText(data, ['name', 'nombre', 'cliente'], 'Sin cliente'),
            correo: readText(data, ['email', 'correo'], 'Sin correo'),
            servicio: normalizeCategoria(data) ?? readText(data, ['service', 'servicio', 'category', 'selectedService'], 'No especificado'),
            presupuesto: readText(data, ['budget', 'presupuesto', 'quoteAmount'], 'No especificado'),
            fecha: formatDate(data),
            estado: normalizeEstado(data),
            projectType: normalizeProjectType(data),
            functionalities: readArray(data, ['functionalities', 'funcionalidades']),
            designPreferences: readText(data, ['designPreferences', 'preferenciasDiseno'], 'Sin especificar'),
            deadline: readText(data, ['deadline', 'plazo'], 'Sin especificar'),
            references: readText(data, ['references', 'referencias'], 'Sin especificar'),
            additionalDetails: readText(data, ['additionalDetails', 'detallesAdicionales'], 'Sin especificar'),
            sourceCollection: 'quotations',
          });
        });

        const currentIds = new Set<string>([
          ...loadedSolicitudes.map((item) => `messages:${item.id}`),
          ...loadedCotizaciones.map((item) => `${item.sourceCollection}:${item.id}`),
          ...loadedContactos.map((item) => `messages:${item.id}`),
        ]);

        if (knownRecordIdsRef.current.size > 0) {
          const nuevas: AppNotification[] = [];

          loadedSolicitudes.forEach((item) => {
            const key = `messages:${item.id}`;
            if (!knownRecordIdsRef.current.has(key)) {
              nuevas.push({ id: key, text: `Nueva solicitud de servicio de ${item.nombre}`, createdAt: new Date().toLocaleTimeString('es-ES') });
            }
          });

          loadedCotizaciones.forEach((item) => {
            const key = `${item.sourceCollection}:${item.id}`;
            if (!knownRecordIdsRef.current.has(key)) {
              nuevas.push({ id: key, text: `Nueva cotización de ${item.cliente}`, createdAt: new Date().toLocaleTimeString('es-ES') });
            }
          });

          loadedContactos.forEach((item) => {
            const key = `messages:${item.id}`;
            if (!knownRecordIdsRef.current.has(key)) {
              nuevas.push({ id: key, text: `Nuevo contacto de ${item.nombre}`, createdAt: new Date().toLocaleTimeString('es-ES') });
            }
          });

          if (nuevas.length > 0) {
            setNotificaciones((prev) => [...nuevas, ...prev].slice(0, 12));
          }
        }

        knownRecordIdsRef.current = currentIds;

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

    void loadMessages();
    const intervalId = setInterval(() => {
      void loadMessages();
    }, 30000);

    return () => clearInterval(intervalId);
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


  const eliminarSolicitud = async (solicitud: Solicitud) => {
    try {
      await deleteDoc(doc(db, solicitud.sourceCollection, solicitud.id));
      setSolicitudes((prev) => prev.filter((item) => item.id !== solicitud.id));
    } catch (err: unknown) {
      setError(buildFirebaseErrorMessage(err));
    }
  };

  const eliminarCotizacion = async (cotizacion: Cotizacion) => {
    try {
      await deleteDoc(doc(db, cotizacion.sourceCollection, cotizacion.id));
      setCotizaciones((prev) => prev.filter((item) => item.id !== cotizacion.id));
      setCotizacionSeleccionada((actual) => (actual?.id === cotizacion.id ? null : actual));
    } catch (err: unknown) {
      setError(buildFirebaseErrorMessage(err));
    }
  };

  const eliminarContacto = async (contacto: Contacto) => {
    try {
      await deleteDoc(doc(db, contacto.sourceCollection, contacto.id));
      setContactos((prev) => prev.filter((item) => item.id !== contacto.id));
    } catch (err: unknown) {
      setError(buildFirebaseErrorMessage(err));
    }
  };

  const eliminarProyecto = (id: number) => {
    setProyectos((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {menuMovilAbierto && (
        <button
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMenuMovilAbierto(false)}
          aria-label="Cerrar menú"
        />
      )}

      <aside className={`fixed left-0 top-0 z-40 h-full w-72 transform bg-black p-6 text-gray-100 transition-transform md:static md:z-auto md:translate-x-0 ${menuMovilAbierto ? "translate-x-0" : "-translate-x-full"}`}>
        <h2 className="text-2xl font-bold mb-2">Thelmo SM</h2>
        <p className="text-xs text-gray-400 mb-6">Conectado a Firebase / collections: messages y quotations</p>
        <nav className="space-y-2">
          {secciones.map((seccion) => (
            <button
              key={seccion}
              className={`w-full text-left px-4 py-2 rounded transition ${
                seccionActiva === seccion ? 'bg-indigo-600 text-white' : 'hover:bg-zinc-800'
              }`}
              onClick={() => { setSeccionActiva(seccion); setMenuMovilAbierto(false); }}
            >
              {seccion === 'Servicios' ? 'Solicitud de servicios' : seccion === 'Proyectos' ? 'Proyectos pendientes' : seccion}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 text-slate-900 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm md:hidden"
            onClick={() => setMenuMovilAbierto((prev) => !prev)}
          >
            ☰ Menú
          </button>
          <div className="relative ml-auto">
            <button
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
              onClick={() => setVerNotificaciones((prev) => !prev)}
            >
              🔔 Notificaciones ({notificaciones.length})
            </button>
            {verNotificaciones && (
              <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Alertas recientes</p>
                  <button className="text-xs text-indigo-600" onClick={() => setNotificaciones([])}>Limpiar</button>
                </div>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {notificaciones.length === 0 && <p className="text-sm text-slate-500">Sin notificaciones nuevas.</p>}
                  {notificaciones.map((item) => (
                    <div key={item.id} className="rounded border border-slate-100 bg-slate-50 p-2">
                      <p className="text-sm">{item.text}</p>
                      <p className="text-xs text-slate-500">{item.createdAt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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
                    <button
                      onClick={() => eliminarSolicitud(solicitud)}
                      className="mt-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500"
                    >
                      Eliminar
                    </button>
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
                      <Th>Detalle</Th>
                      <Th>Acciones</Th>
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
                        <Td>
                          <button
                            className="rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-500"
                            onClick={() => setCotizacionSeleccionada(cotizacion)}
                          >
                            Ver detalle
                          </button>
                        </Td>
                        <Td>
                          <button
                            className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-500"
                            onClick={() => eliminarCotizacion(cotizacion)}
                          >
                            Eliminar
                          </button>
                        </Td>
                      </tr>
                    ))}
                    {cotizaciones.length === 0 && (
                      <tr>
                        <Td>No hay cotizaciones registradas.</Td>
                        <Td>-</Td>
                        <Td>-</Td>
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

            {cotizacionSeleccionada && (
              <article className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Detalle completo de cotización</h2>
                  <button
                    className="rounded bg-slate-200 px-3 py-1 text-sm hover:bg-slate-300"
                    onClick={() => setCotizacionSeleccionada(null)}
                  >
                    Cerrar
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
                  <p><strong>ID:</strong> {cotizacionSeleccionada.id}</p>
                  <p><strong>Fecha:</strong> {cotizacionSeleccionada.fecha}</p>
                  <p><strong>Cliente:</strong> {cotizacionSeleccionada.cliente}</p>
                  <p><strong>Correo:</strong> {cotizacionSeleccionada.correo}</p>
                  <p><strong>Servicio:</strong> {cotizacionSeleccionada.servicio}</p>
                  <p><strong>Tipo de proyecto:</strong> {cotizacionSeleccionada.projectType}</p>
                  <p><strong>Presupuesto:</strong> {cotizacionSeleccionada.presupuesto}</p>
                  <p><strong>Plazo:</strong> {cotizacionSeleccionada.deadline}</p>
                  <p><strong>Estado:</strong> {cotizacionSeleccionada.estado}</p>
                </div>
                <div className="mt-3 text-sm">
                  <p><strong>Funcionalidades:</strong> {cotizacionSeleccionada.functionalities.length > 0 ? cotizacionSeleccionada.functionalities.join(', ') : 'Sin especificar'}</p>
                  <p className="mt-2"><strong>Preferencias de diseño:</strong> {cotizacionSeleccionada.designPreferences}</p>
                  <p className="mt-2"><strong>Referencias:</strong> {cotizacionSeleccionada.references}</p>
                  <p className="mt-2"><strong>Detalles adicionales:</strong> {cotizacionSeleccionada.additionalDetails}</p>
                </div>
              </article>
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
                    <Th>Acciones</Th>
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
                      <Td>
                        <button
                          onClick={() => eliminarProyecto(proyecto.id)}
                          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-500"
                        >
                          Eliminar
                        </button>
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
                    <button
                      onClick={() => eliminarContacto(contacto)}
                      className="mt-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500"
                    >
                      Eliminar
                    </button>
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


function readArray(data: MessageRecord, keys: string[]): string[] {
  for (const key of keys) {
    const value = data[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
  }
  return [];
}

function normalizeProjectType(data: MessageRecord): string {
  const raw = readText(data, ['projectType', 'tipoProyecto'], '').toLowerCase();

  if (raw.includes('landing')) return 'Landing Page';
  if (raw.includes('corporativo')) return 'Página Corporativa';
  if (raw.includes('ecommerce') || raw.includes('e-commerce')) return 'E-commerce';
  if (raw.includes('blog')) return 'Blog';
  if (raw.includes('portafolio')) return 'Portafolio';
  if (raw.includes('otro')) return 'Otro';

  return raw ? raw : 'Sin especificar';
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
