export const projectStatusLabels = {
  IDEA: 'Idea',
  DRAFTING: 'Drafting',
  READY_TO_SHOOT: 'Ready to shoot',
  IN_PRODUCTION: 'In production',
  COMPLETE: 'Complete'
} as const;

export const shotStatusLabels = {
  TODO: 'To do',
  BLOCKED: 'Blocked',
  READY: 'Ready',
  SHOT: 'Shot'
} as const;

export const shotTypeLabels = {
  WIDE: 'Wide',
  MEDIUM: 'Medium',
  CLOSE_UP: 'Close-up',
  INSERT: 'Insert',
  POV: 'POV',
  AERIAL: 'Aerial',
  OTHER: 'Other'
} as const;

export type ProjectStatus = keyof typeof projectStatusLabels;
export type ShotStatus = keyof typeof shotStatusLabels;
export type ShotType = keyof typeof shotTypeLabels;

export function labelFor<T extends Record<string, string>>(labels: T, value: string) {
  return labels[value as keyof T] ?? value;
}
