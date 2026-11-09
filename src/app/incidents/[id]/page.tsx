'use client';

import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SeverityBadge, StatusBadge } from '@/components/Badges';
import {
  ACKNOWLEDGE_INCIDENT,
  GET_INCIDENT,
  RESOLVE_INCIDENT,
  type IncidentDetail,
} from '@/graphql/operations';
import { formatDate } from '@/lib/format';

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, loading, error } = useQuery<{ incident: IncidentDetail | null }>(GET_INCIDENT, {
    variables: { id },
    pollInterval: 5000,
  });

  const [acknowledge, acknowledgeState] = useMutation(ACKNOWLEDGE_INCIDENT, {
    variables: { id },
    refetchQueries: ['Incident'],
  });
  const [resolve, resolveState] = useMutation(RESOLVE_INCIDENT, {
    variables: { id },
    refetchQueries: ['Incident'],
  });

  const incident = data?.incident;
  const actionError = acknowledgeState.error ?? resolveState.error;

  if (loading && !data) {
    return <p className="muted">Cargando…</p>;
  }
  if (error) {
    return <p className="error">No se pudo cargar: {error.message}</p>;
  }
  if (!incident) {
    return (
      <section className="card">
        <p>No se encontró el incidente.</p>
        <Link href="/">← Volver</Link>
      </section>
    );
  }

  const canAcknowledge = incident.status === 'TRIGGERED';
  const canResolve = incident.status !== 'RESOLVED' && incident.status !== 'POSTMORTEM';

  return (
    <>
      <Link href="/">← Volver a incidentes</Link>

      <section className="card">
        <div className="toolbar">
          <h2>{incident.title}</h2>
          <div className="actions">
            {canAcknowledge && (
              <button
                onClick={() => acknowledge().catch(() => undefined)}
                disabled={acknowledgeState.loading}
              >
                Reconocer
              </button>
            )}
            {canResolve && (
              <button
                className="secondary"
                onClick={() => resolve().catch(() => undefined)}
                disabled={resolveState.loading}
              >
                Resolver
              </button>
            )}
          </div>
        </div>

        {actionError && <p className="error">{actionError.message}</p>}

        <dl className="details">
          <dt>Servicio</dt>
          <dd>{incident.service}</dd>
          <dt>Severidad</dt>
          <dd>
            <SeverityBadge severity={incident.severity} />
          </dd>
          <dt>Estado</dt>
          <dd>
            <StatusBadge status={incident.status} />
          </dd>
          <dt>Responsable</dt>
          <dd>{incident.assigneeId ?? '-'}</dd>
          <dt>Creado</dt>
          <dd>{formatDate(incident.createdAt)}</dd>
          <dt>Actualizado</dt>
          <dd>{formatDate(incident.updatedAt)}</dd>
          <dt>Resuelto</dt>
          <dd>{formatDate(incident.resolvedAt)}</dd>
        </dl>
      </section>

      <section className="card">
        <h2>Timeline</h2>
        {incident.timeline.length === 0 && <p className="muted">Sin eventos.</p>}
        <ol className="timeline">
          {incident.timeline.map((event) => (
            <li key={event.id}>
              <span className="time">{formatDate(event.createdAt)}</span>
              <span className="msg">{event.message}</span>
              <span className="actor">{event.actor}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
