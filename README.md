# beacon-frontend

Dashboard web de **Beacon**.

| | |
|---|---|
| Framework | Next.js (React) |
| Cliente GraphQL | Apollo Client |
| Backend | `beacon-backend` (GraphQL, incluye subscriptions por WebSocket) |

## Pantallas previstas

- Dashboard: incidentes activos por severidad y quién está de turno.
- Detalle de incidente: timeline en vivo, alertas asociadas, acciones.
- On-call: turnos y políticas de escalamiento.
- Postmortems y aprobación de runbooks (fases 4 y 5).

## Cómo ejecutar

```bash
npm install
npm run dev
```

Necesita el backend GraphQL en `NEXT_PUBLIC_GRAPHQL_URL` (por defecto `http://localhost:3001/graphql`). Copia `.env.example` a `.env.local` para cambiarla.

## Pantallas (Fase 1)

- `/`: lista de incidentes con filtros, y formulario para crear uno.
- `/incidents/[id]`: detalle, timeline y acciones (reconocer y resolver).

Mientras no existan subscriptions (Fase 3), las pantallas se actualizan cada 5 segundos.

## Estado

Fase 1: lista, detalle y acciones básicas. Pendiente: on-call, postmortems y aprobaciones.
