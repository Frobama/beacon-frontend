import { gql } from '@apollo/client';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus =
  | 'TRIGGERED'
  | 'ACKNOWLEDGED'
  | 'MITIGATING'
  | 'RESOLVED'
  | 'POSTMORTEM';

export const SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const STATUSES: IncidentStatus[] = [
  'TRIGGERED',
  'ACKNOWLEDGED',
  'MITIGATING',
  'RESOLVED',
  'POSTMORTEM',
];

export interface IncidentSummary {
  id: string;
  title: string;
  service: string;
  status: IncidentStatus;
  severity: Severity;
  assigneeId: string | null;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  kind: string;
  message: string;
  actor: string;
  createdAt: string;
}

export interface IncidentDetail extends IncidentSummary {
  alertIds: string[];
  updatedAt: string;
  resolvedAt: string | null;
  timeline: TimelineEvent[];
  alerts: IncidentAlert[] | null;
}

export interface AlertLabel {
  key: string;
  value: string;
}

export interface IncidentAlert {
  id: string;
  source: string;
  title: string;
  severity: Severity;
  occurrences: number;
  labels: AlertLabel[];
  firstReceivedAt: string;
  lastReceivedAt: string;
}

export interface Team {
  id: string;
  name: string;
  services: string[];
}

export interface OnCallUser {
  userId: string;
  name: string;
  email: string;
  level: number;
}

export interface EscalationLevel {
  level: number;
  waitMinutes: number;
  userIds: string[];
}

export interface EscalationPolicy {
  id: string;
  teamId: string;
  name: string;
  levels: EscalationLevel[];
}

export interface ScheduleShift {
  userId: string;
  startsAt: string;
  endsAt: string;
}

export interface Schedule {
  id: string;
  teamId: string;
  name: string;
  shifts: ScheduleShift[];
}

export interface OnCallOverview {
  onCall: OnCallUser[];
  escalationPolicies: EscalationPolicy[];
  schedules: Schedule[];
}

export const LIST_INCIDENTS = gql`
  query Incidents($status: IncidentStatus, $severity: Severity) {
    incidents(status: $status, severity: $severity) {
      id
      title
      service
      status
      severity
      assigneeId
      createdAt
    }
  }
`;

export const GET_INCIDENT = gql`
  query Incident($id: ID!) {
    incident(id: $id) {
      id
      title
      service
      status
      severity
      assigneeId
      alertIds
      createdAt
      updatedAt
      resolvedAt
      timeline {
        id
        kind
        message
        actor
        createdAt
      }
      alerts {
        id
        source
        title
        severity
        occurrences
        labels {
          key
          value
        }
        firstReceivedAt
        lastReceivedAt
      }
    }
  }
`;

export const LIST_TEAMS = gql`
  query Teams {
    teams {
      id
      name
      services
    }
  }
`;

export const ONCALL_OVERVIEW = gql`
  query OnCallOverview($teamId: ID!) {
    onCall(teamId: $teamId) {
      userId
      name
      email
      level
    }
    escalationPolicies(teamId: $teamId) {
      id
      teamId
      name
      levels {
        level
        waitMinutes
        userIds
      }
    }
    schedules(teamId: $teamId) {
      id
      teamId
      name
      shifts {
        userId
        startsAt
        endsAt
      }
    }
  }
`;

export const CREATE_INCIDENT = gql`
  mutation CreateIncident($input: CreateIncidentInput!) {
    createIncident(input: $input) {
      id
    }
  }
`;

export const ACKNOWLEDGE_INCIDENT = gql`
  mutation AcknowledgeIncident($id: ID!) {
    acknowledgeIncident(id: $id) {
      id
    }
  }
`;

export const RESOLVE_INCIDENT = gql`
  mutation ResolveIncident($id: ID!) {
    resolveIncident(id: $id) {
      id
    }
  }
`;
