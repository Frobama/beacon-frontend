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
    errorPolicy: 'all',
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
  if (!incident) {
    if (error) {
      return <p className="error">No se pudo cargar: {error.message}</p>;
    }
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
        <h2>Alertas asociadas</h2>
        {incident.alerts == null && (
          <p className="muted">No se pudieron cargar las alertas (servicio no disponible).</p>
        )}
        {incident.alerts != null && incident.alerts.length === 0 && (
          <p className="muted">Sin alertas asociadas.</p>
        )}
        {incident.alerts != null && incident.alerts.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Severidad</th>
                  <th>Veces</th>
                  <th>Etiquetas</th>
                  <th>Última vez</th>
                </tr>
              </thead>
              <tbody>
                {incident.alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>{alert.title}</td>
                    <td>
                      <SeverityBadge severity={alert.severity} />
                    </td>
                    <td>{alert.occurrences}</td>
                    <td className="labels">
                      {alert.labels.map((label) => (
                        <span className="chip" key={`${label.key}-${label.value}`}>
                          {label.key}={label.value}
                        </span>
                      ))}
                    </td>
                    <td>{formatDate(alert.lastReceivedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
