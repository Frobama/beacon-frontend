'use client';

import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useState } from 'react';
import { SeverityBadge, SEVERITY_LABEL, STATUS_LABEL, StatusBadge } from '@/components/Badges';
import { CreateIncidentForm } from '@/components/CreateIncidentForm';
import {
  LIST_INCIDENTS,
  SEVERITIES,
  STATUSES,
  type IncidentStatus,
  type IncidentSummary,
  type Severity,
} from '@/graphql/operations';
import { formatDate } from '@/lib/format';

export default function IncidentsPage() {
  const [status, setStatus] = useState<IncidentStatus | ''>('');
  const [severity, setSeverity] = useState<Severity | ''>('');

  const { data, loading, error } = useQuery<{ incidents: IncidentSummary[] }>(LIST_INCIDENTS, {
    variables: { status: status || null, severity: severity || null },
    pollInterval: 5000, // hasta tener subscriptions (Fase 3)
  });

  return (
    <>
      <CreateIncidentForm />

      <section className="card">
        <div className="toolbar">
          <h2>Incidentes</h2>
          <div className="filters">
            <select value={status} onChange={(e) => setStatus(e.target.value as IncidentStatus | '')}>
              <option value="">Todos los estados</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity | '')}>
              <option value="">Todas las severidades</option>
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {SEVERITY_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && !data && <p className="muted">Cargando…</p>}
        {error && <p className="error">No se pudo cargar: {error.message}</p>}
        {data && data.incidents.length === 0 && <p className="muted">No hay incidentes.</p>}

        {data && data.incidents.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Servicio</th>
                  <th>Severidad</th>
                  <th>Estado</th>
                  <th>Responsable</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {data.incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>
                      <Link href={`/incidents/${incident.id}`}>{incident.title}</Link>
                    </td>
                    <td>{incident.service}</td>
                    <td>
                      <SeverityBadge severity={incident.severity} />
                    </td>
                    <td>
                      <StatusBadge status={incident.status} />
                    </td>
                    <td>{incident.assigneeId ?? '-'}</td>
                    <td>{formatDate(incident.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
