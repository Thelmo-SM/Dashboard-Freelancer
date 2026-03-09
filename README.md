# Dashboard Freelancer (Next.js)

Panel administrativo para revisar solicitudes, cotizaciones, contactos y gestionar proyectos pendientes.

## Ejecutar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Variables de entorno

1. Copia `.env.example` a `.env.local`.
2. Rellena tus variables de Firebase y servicios externos.

```bash
cp .env.example .env.local
```

> `RECAPTCHA_SECRET_KEY` es una variable **privada**: úsala solo en backend/server actions, nunca en componentes cliente.

## Firebase

El dashboard lee la colección `messages` desde Firestore en cliente usando `NEXT_PUBLIC_FIREBASE_*`.

La UI detecta automáticamente registros de:
- **servicios**
- **cotizaciones**
- **contactos**

Según campos comunes como `type/tipo`, `service/servicio`, `budget/presupuesto`, `email/correo`, etc.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```
