import type { IncidentStatus, Severity } from '@/graphql/operations';

const STATUS_LABEL: Record<IncidentStatus, string> = {
  TRIGGERED: 'Disparado',
  ACKNOWLEDGED: 'Reconocido',
  MITIGATING: 'Mitigando',
  RESOLVED: 'Resuelto',
  POSTMORTEM: 'Postmortem',
};

const SEVERITY_LABEL: Record<Severity, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span className={`badge status-${status.toLowerCase()}`}>{STATUS_LABEL[status]}</span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`badge severity-${severity.toLowerCase()}`}>
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

export { SEVERITY_LABEL, STATUS_LABEL };
