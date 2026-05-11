export const projectStatusLabels = {
  IDEA: '아이디어',
  DRAFTING: '작성 중',
  READY_TO_SHOOT: '촬영 준비 완료',
  IN_PRODUCTION: '제작 중',
  COMPLETE: '완료'
} as const;

export const shotStatusLabels = {
  TODO: '할 일',
  BLOCKED: '차단됨',
  READY: '준비 완료',
  SHOT: '촬영 완료'
} as const;

export const shotTypeLabels = {
  WIDE: '와이드',
  MEDIUM: '미디엄',
  CLOSE_UP: '클로즈업',
  INSERT: '인서트',
  POV: 'POV',
  AERIAL: '항공',
  OTHER: '기타'
} as const;

export type ProjectStatus = keyof typeof projectStatusLabels;
export type ShotStatus = keyof typeof shotStatusLabels;
export type ShotType = keyof typeof shotTypeLabels;

export function labelFor<T extends Record<string, string>>(labels: T, value: string) {
  return labels[value as keyof T] ?? value;
}
