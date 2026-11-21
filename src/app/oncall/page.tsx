'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  LIST_TEAMS,
  ONCALL_OVERVIEW,
  type OnCallOverview,
  type Team,
} from '@/graphql/operations';
import { formatDate } from '@/lib/format';

export default function OnCallPage() {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const teamsQuery = useQuery<{ teams: Team[] }>(LIST_TEAMS);
  const teams = teamsQuery.data?.teams ?? [];
  const activeTeamId = selectedTeamId || teams[0]?.id || '';

  const overviewQuery = useQuery<{ onCall: OnCallOverview['onCall']; escalationPolicies: OnCallOverview['escalationPolicies']; schedules: OnCallOverview['schedules'] }>(
    ONCALL_OVERVIEW,
    {
      variables: { teamId: activeTeamId },
      skip: !activeTeamId,
      pollInterval: 30_000,
    },
  );

  const onCall = overviewQuery.data?.onCall ?? [];
  const policies = overviewQuery.data?.escalationPolicies ?? [];
  const schedules = overviewQuery.data?.schedules ?? [];
  const hasShifts = schedules.some((schedule) => schedule.shifts.length > 0);

  const nameForUser = (userId: string) =>
    onCall.find((person) => person.userId === userId)?.name ?? userId;

  return (
    <>
      <section className="card">
        <div className="toolbar">
          <h2>Guardias</h2>
          {teams.length > 0 && (
            <select
              aria-label="Equipo"
              value={activeTeamId}
              onChange={(event) => setSelectedTeamId(event.target.value)}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {teamsQuery.loading && !teamsQuery.data && <p className="muted">Cargando equipos…</p>}
        {teamsQuery.error && (
          <p className="error">No se pudieron cargar los equipos: {teamsQuery.error.message}</p>
        )}
        {!teamsQuery.loading && !teamsQuery.error && teams.length === 0 && (
          <p className="muted">No hay equipos disponibles.</p>
        )}
      </section>

      {activeTeamId && (
        <>
          {overviewQuery.loading && !overviewQuery.data && (
            <p className="muted">Cargando guardias…</p>
          )}
          {overviewQuery.error && (
            <p className="error">No se pudo cargar la guardia: {overviewQuery.error.message}</p>
          )}

          {overviewQuery.data && (
            <>
              <section className="card">
                <h2>De turno ahora</h2>
                {onCall.length === 0 ? (
                  <p className="muted">No hay personas de turno.</p>
                ) : (
                  <div className="oncall-grid">
                    {[...onCall].sort((a, b) => a.level - b.level).map((person) => (
                      <div className="person" key={person.userId}>
                        <span className="level-tag">Nivel {person.level}</span>
                        <strong>{person.name || person.userId}</strong>
                        <span>{person.email || person.userId}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="card">
                <h2>Política de escalamiento</h2>
                {policies.length === 0 ? (
                  <p className="muted">No hay políticas de escalamiento.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Política</th>
                          <th>Nivel</th>
                          <th>A quién se avisa</th>
                          <th>Minutos de espera</th>
                        </tr>
                      </thead>
                      <tbody>
                        {policies.flatMap((policy) =>
                          [...(policy.levels ?? [])].sort((a, b) => a.level - b.level).map((level) => (
                            <tr key={`${policy.id}-${level.level}`}>
                              <td>{policy.name}</td>
                              <td>{level.level}</td>
                              <td>
                                {(level.userIds ?? []).length === 0
                                  ? 'Quien esté de turno según el calendario'
                                  : (level.userIds ?? [])
                                      .map((userId) => nameForUser(userId))
                                      .join(', ')}
                              </td>
                              <td>{level.waitMinutes}</td>
                            </tr>
                          )),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="card">
                <h2>Turnos</h2>
                {!hasShifts ? (
                  <p className="muted">No hay turnos configurados.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Calendario</th>
                          <th>Persona</th>
                          <th>Desde</th>
                          <th>Hasta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.flatMap((schedule) =>
                          schedule.shifts.map((shift) => {
                            const start = new Date(shift.startsAt).getTime();
                            const end = new Date(shift.endsAt).getTime();
                            const current = now >= start && now <= end;
                            return (
                              <tr className={current ? 'current' : undefined} key={`${schedule.id}-${shift.userId}-${shift.startsAt}`}>
                                <td>{schedule.name}</td>
                                <td>{nameForUser(shift.userId)}</td>
                                <td>{formatDate(shift.startsAt)}</td>
                                <td>{formatDate(shift.endsAt)}</td>
                              </tr>
                            );
                          }),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </>
      )}
    </>
  );
}
