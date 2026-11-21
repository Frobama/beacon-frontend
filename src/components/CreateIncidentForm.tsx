'use client';

import { useMutation } from '@apollo/client';
import { useState, type FormEvent } from 'react';
import { CREATE_INCIDENT, LIST_INCIDENTS, SEVERITIES, type Severity } from '@/graphql/operations';
import { SEVERITY_LABEL } from './Badges';

export function CreateIncidentForm() {
  const [title, setTitle] = useState('');
  const [service, setService] = useState('');
  const [severity, setSeverity] = useState<Severity>('MEDIUM');

  const [createIncident, { loading, error }] = useMutation(CREATE_INCIDENT, {
    refetchQueries: [LIST_INCIDENTS],
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await createIncident({ variables: { input: { title, service, severity } } });
      setTitle('');
      setService('');
    } catch {
      // El error se muestra abajo mediante el estado `error`.
    }
  }

  return (
    <form className="card form" onSubmit={onSubmit}>
      <h2>Nuevo incidente</h2>
      <div className="form-row">
        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          placeholder="Servicio (ej. checkout-api)"
          value={service}
          onChange={(e) => setService(e.target.value)}
          required
        />
        <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {SEVERITY_LABEL[s]}
            </option>
          ))}
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Creando…' : 'Crear'}
        </button>
      </div>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
