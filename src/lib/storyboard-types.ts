export const validPanelCounts = [6, 9, 12, 15, 24] as const;

export type ValidPanelCount = (typeof validPanelCounts)[number];

export type StoryboardScene = {
  id: string;
  title: string;
  sceneCode: string;
  durationSec: 15;
  panelCount: ValidPanelCount;
  panels: StoryboardPanel[];
};

export type StoryboardPanel = {
  id: string;
  panelNumber: number;
  startSec: number;
  endSec: number;
  timecodeLabel: string;
  imageUrl?: string;
  imagePromptEn: string;
  shotSize: ShotSize;
  cameraAngle: CameraAngle;
  cameraMovement: CameraMovement;
  descriptionKo: string;
  dialogueKo: string;
  sfxKo: string;
  characterRefs: string[];
  locationRef?: string;
  notes?: string;
};

export type ShotSize =
  | 'Extreme Wide Shot'
  | 'Wide Shot'
  | 'Medium Wide Shot'
  | 'Medium Shot'
  | 'Medium Close Up'
  | 'Close Up'
  | 'Extreme Close Up'
  | 'Insert Shot'
  | 'Over The Shoulder'
  | 'POV';

export type CameraAngle =
  | 'Eye Level'
  | 'High Angle'
  | 'Low Angle'
  | 'Dutch Angle'
  | 'Side Angle'
  | 'Overhead Shot'
  | 'Shot From Behind'
  | 'Profile Shot'
  | 'Three Quarter View';

export type CameraMovement =
  | 'Static Locked Shot'
  | 'Handheld'
  | 'Subtle Dolly In'
  | 'Track Out'
  | 'Push In'
  | 'Pull Back'
  | 'Pan'
  | 'Tilt'
  | 'Rack Focus';

export type SceneTimingValidation = {
  valid: boolean;
  warnings: string[];
};

export const shotSizes: ShotSize[] = [
  'Extreme Wide Shot',
  'Wide Shot',
  'Medium Wide Shot',
  'Medium Shot',
  'Medium Close Up',
  'Close Up',
  'Extreme Close Up',
  'Insert Shot',
  'Over The Shoulder',
  'POV'
];

export const cameraAngles: CameraAngle[] = [
  'Eye Level',
  'High Angle',
  'Low Angle',
  'Dutch Angle',
  'Side Angle',
  'Overhead Shot',
  'Shot From Behind',
  'Profile Shot',
  'Three Quarter View'
];

export const cameraMovements: CameraMovement[] = [
  'Static Locked Shot',
  'Handheld',
  'Subtle Dolly In',
  'Track Out',
  'Push In',
  'Pull Back',
  'Pan',
  'Tilt',
  'Rack Focus'
];

export const shotSizeKo: Record<ShotSize, string> = {
  'Extreme Wide Shot': '익스트림 와이드 샷',
  'Wide Shot': '와이드 샷',
  'Medium Wide Shot': '미디엄 와이드 샷',
  'Medium Shot': '미디엄 샷',
  'Medium Close Up': '미디엄 클로즈업',
  'Close Up': '클로즈업',
  'Extreme Close Up': '익스트림 클로즈업',
  'Insert Shot': '인서트 샷',
  'Over The Shoulder': '오버 숄더',
  POV: 'POV'
};

export const cameraAngleKo: Record<CameraAngle, string> = {
  'Eye Level': '아이 레벨',
  'High Angle': '하이 앵글',
  'Low Angle': '로우 앵글',
  'Dutch Angle': '더치 앵글',
  'Side Angle': '사이드 앵글',
  'Overhead Shot': '오버헤드 샷',
  'Shot From Behind': '후면 샷',
  'Profile Shot': '프로필 샷',
  'Three Quarter View': '쓰리쿼터 뷰'
};

export const cameraMovementKo: Record<CameraMovement, string> = {
  'Static Locked Shot': '고정 샷',
  Handheld: '핸드헬드',
  'Subtle Dolly In': '섬세한 돌리 인',
  'Track Out': '트랙 아웃',
  'Push In': '푸시 인',
  'Pull Back': '풀 백',
  Pan: '팬',
  Tilt: '틸트',
  'Rack Focus': '랙 포커스'
};
