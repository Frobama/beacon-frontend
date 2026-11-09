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
