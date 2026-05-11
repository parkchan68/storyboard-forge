import { generatePanelTimecodes } from './timecode';
import type { CameraAngle, CameraMovement, ShotSize, StoryboardPanel, StoryboardScene } from './storyboard-types';

const baseStyle = 'Realistic Korean live action thriller, no anime, no cartoon, no 3D render, no fantasy. Kang Jaehoon is a 17 year old Korean high school boy, lean athletic build, sharp narrow eyes, neat black hair, quiet intense expression, navy school blazer, white shirt, striped tie, name tag 강재훈, no glasses. Kim Yuseok with glasses must not appear. Male students only, no female students, do not duplicate Kang Jaehoon in the same panel, background students must not look like him.';

type PanelSeed = {
  shotSize: ShotSize;
  cameraAngle: CameraAngle;
  cameraMovement: CameraMovement;
  descriptionKo: string;
  dialogueKo: string;
  sfxKo: string;
  imagePromptEn: string;
};

const panelSeeds: PanelSeed[] = [
  {
    shotSize: 'Wide Shot',
    cameraAngle: 'Eye Level',
    cameraMovement: 'Static Locked Shot',
    descriptionKo: '새 학년 첫날, 학생들이 교실에 들어와 시끄럽게 자리를 잡는다.',
    dialogueKo: '',
    sfxKo: '책상 끄는 소리, 의자 밀리는 소리, 웅성거림.',
    imagePromptEn: 'realistic Korean high school classroom, male students only, cold fluorescent lighting, cinematic live action, ARRI Alexa LF, 35mm lens.'
  },
  {
    shotSize: 'Medium Shot',
    cameraAngle: 'Eye Level',
    cameraMovement: 'Static Locked Shot',
    descriptionKo: '창가 자리, 강재훈이 책을 펼쳐놓고 조용히 앉아 있다.',
    dialogueKo: '',
    sfxKo: '종이 넘기는 소리.',
    imagePromptEn: 'realistic Korean high school boy sitting by the classroom window reading a book, cold Korean classroom, cinematic thriller tone.'
  },
  {
    shotSize: 'Close Up',
    cameraAngle: 'Eye Level',
    cameraMovement: 'Subtle Dolly In',
    descriptionKo: '재훈의 이름표 ‘강재훈’이 형광등 아래 차갑게 반짝인다.',
    dialogueKo: '',
    sfxKo: '멀리서 울리는 웃음소리.',
    imagePromptEn: 'close up of navy school blazer name tag reading 강재훈, Korean high school uniform, cold fluorescent light, realistic live action thriller.'
  },
  {
    shotSize: 'Medium Wide Shot',
    cameraAngle: 'Side Angle',
    cameraMovement: 'Pan',
    descriptionKo: '복도 쪽 문이 열리고 담임 선생님이 출석부를 들고 들어온다.',
    dialogueKo: '담임: 자, 조용히. 새 학년 첫 조회 시작한다.',
    sfxKo: '문 여는 소리, 발걸음.',
    imagePromptEn: 'male homeroom teacher entering Korean high school classroom with attendance book, male students only, realistic cinematic lighting.'
  },
  {
    shotSize: 'Wide Shot',
    cameraAngle: 'High Angle',
    cameraMovement: 'Static Locked Shot',
    descriptionKo: '교실 전체가 서서히 조용해지고, 재훈만 창밖에서 눈을 떼지 않는다.',
    dialogueKo: '',
    sfxKo: '웅성거림이 잦아든다.',
    imagePromptEn: 'high angle view of Korean boys classroom becoming quiet, one boy by window remains still, realistic live action thriller.'
  },
  {
    shotSize: 'POV',
    cameraAngle: 'Eye Level',
    cameraMovement: 'Push In',
    descriptionKo: '재훈의 시선으로 운동장 가장자리의 검은 우산 하나가 보인다.',
    dialogueKo: '',
    sfxKo: '낮은 바람 소리.',
    imagePromptEn: 'POV from classroom window toward Korean schoolyard edge, single black umbrella in distance, overcast morning, thriller mood.'
  },
  {
    shotSize: 'Close Up',
    cameraAngle: 'Low Angle',
    cameraMovement: 'Static Locked Shot',
    descriptionKo: '재훈의 눈매가 좁아지고, 표정이 아주 미세하게 굳는다.',
    dialogueKo: '',
    sfxKo: '심장 박동처럼 낮은 둔탁음.',
    imagePromptEn: 'close up of Kang Jaehoon sharp narrow eyes, quiet intense expression, Korean high school boy, realistic live action, no glasses.'
  },
  {
    shotSize: 'Insert Shot',
    cameraAngle: 'Overhead Shot',
    cameraMovement: 'Static Locked Shot',
    descriptionKo: '재훈의 책 사이에 낡은 종이 쪽지가 끼워져 있다.',
    dialogueKo: '',
    sfxKo: '종이 스치는 소리.',
    imagePromptEn: 'insert shot of old folded note hidden between textbook pages on Korean high school desk, realistic thriller detail.'
  },
  {
    shotSize: 'Extreme Close Up',
    cameraAngle: 'Eye Level',
    cameraMovement: 'Rack Focus',
    descriptionKo: '쪽지에는 ‘첫날부터 기억해’라는 짧은 문장이 적혀 있다.',
    dialogueKo: '',
    sfxKo: '형광등 전기음.',
    imagePromptEn: 'extreme close up of handwritten Korean note on paper, thriller clue, text overlay handled by HTML not image, realistic paper texture.'
  },
  {
    shotSize: 'Medium Shot',
    cameraAngle: 'Three Quarter View',
    cameraMovement: 'Handheld',
    descriptionKo: '재훈은 쪽지를 손바닥으로 덮고 주변 남학생들의 반응을 살핀다.',
    dialogueKo: '',
    sfxKo: '의자 삐걱거림.',
    imagePromptEn: 'Kang Jaehoon discreetly covers a note on his desk and scans male classmates, Korean classroom thriller, handheld realism.'
  },
  {
    shotSize: 'Medium Wide Shot',
    cameraAngle: 'Shot From Behind',
    cameraMovement: 'Track Out',
    descriptionKo: '뒷자리 남학생들이 장난을 치지만 누구도 재훈을 보고 있지 않다.',
    dialogueKo: '학생1: 야, 오늘 급식 뭐냐?',
    sfxKo: '작은 웃음, 필통 닫는 소리.',
    imagePromptEn: 'from behind classroom shot of male Korean high school students joking, none looking at main character, realistic live action.'
  },
  {
    shotSize: 'Close Up',
    cameraAngle: 'Profile Shot',
    cameraMovement: 'Static Locked Shot',
    descriptionKo: '재훈의 옆얼굴 위로 창문 그림자가 감옥살처럼 드리운다.',
    dialogueKo: '',
    sfxKo: '먼 운동장 호루라기 소리.',
    imagePromptEn: 'profile close up of Kang Jaehoon with window shadow bars across face, Korean school uniform, cinematic thriller realism.'
  },
  {
    shotSize: 'Wide Shot',
    cameraAngle: 'Eye Level',
    cameraMovement: 'Pull Back',
    descriptionKo: '담임이 칠판에 좌석표를 붙이자 교실의 공기가 다시 움직인다.',
    dialogueKo: '담임: 오늘 임시 좌석은 이대로 간다.',
    sfxKo: '자석 붙는 소리, 학생들 탄식.',
    imagePromptEn: 'teacher placing seating chart on blackboard in Korean boys classroom, students react, realistic live action, cold light.'
  },
  {
    shotSize: 'Insert Shot',
    cameraAngle: 'Eye Level',
    cameraMovement: 'Push In',
    descriptionKo: '좌석표의 재훈 이름 옆에 빨간 펜으로 작은 표시가 되어 있다.',
    dialogueKo: '',
    sfxKo: '낮은 현악기 긴장음.',
    imagePromptEn: 'insert of Korean classroom seating chart with one marked name 강재훈, red pen mark, thriller prop, realistic.'
  },
  {
    shotSize: 'Medium Close Up',
    cameraAngle: 'Dutch Angle',
    cameraMovement: 'Subtle Dolly In',
    descriptionKo: '재훈은 표시를 확인하고, 쪽지와 좌석표 사이의 연결을 깨닫는다.',
    dialogueKo: '',
    sfxKo: '숨을 짧게 들이마시는 소리.',
    imagePromptEn: 'medium close up dutch angle of Kang Jaehoon realizing a clue, Korean school thriller, navy blazer name tag, no glasses.'
  },
  {
    shotSize: 'POV',
    cameraAngle: 'Eye Level',
    cameraMovement: 'Pan',
    descriptionKo: '재훈의 시선이 교실 안 남학생들의 얼굴을 하나씩 훑는다.',
    dialogueKo: '',
    sfxKo: '교실 소음이 먹먹해진다.',
    imagePromptEn: 'POV scanning faces of Korean male high school students in classroom, no female students, none resembling main character, realistic thriller.'
  },
  {
    shotSize: 'Close Up',
    cameraAngle: 'Eye Level',
    cameraMovement: 'Rack Focus',
    descriptionKo: '한 남학생의 손끝에 재훈의 책과 같은 낡은 종이 섬유가 묻어 있다.',
    dialogueKo: '',
    sfxKo: '연필 굴러가는 소리.',
    imagePromptEn: 'close up of male student fingertips with tiny old paper fibers, Korean classroom desk, realistic thriller clue.'
  },
  {
    shotSize: 'Medium Shot',
    cameraAngle: 'Low Angle',
    cameraMovement: 'Handheld',
    descriptionKo: '그 남학생이 재훈 쪽을 보려는 순간, 담임이 출석을 부른다.',
    dialogueKo: '담임: 강재훈.',
    sfxKo: '출석부 넘기는 소리.',
    imagePromptEn: 'male classmate almost turning toward Kang Jaehoon as teacher calls attendance, Korean boys classroom, handheld live action.'
  },
  {
    shotSize: 'Medium Close Up',
    cameraAngle: 'Eye Level',
    cameraMovement: 'Static Locked Shot',
    descriptionKo: '재훈은 아무 일도 없다는 듯 천천히 손을 든다.',
    dialogueKo: '재훈: 네.',
    sfxKo: '교실이 순간 조용해진다.',
    imagePromptEn: 'Kang Jaehoon calmly raises hand in Korean high school classroom, quiet intense expression, realistic live action thriller.'
  },
  {
    shotSize: 'Wide Shot',
    cameraAngle: 'Overhead Shot',
    cameraMovement: 'Static Locked Shot',
    descriptionKo: '위에서 본 교실, 재훈의 자리만 보이지 않는 선으로 고립된 듯하다.',
    dialogueKo: '',
    sfxKo: '형광등 깜빡임.',
    imagePromptEn: 'overhead wide shot of Korean boys classroom, Kang Jaehoon isolated by composition, realistic cinematic thriller, cold fluorescent lights.'
  },
  {
    shotSize: 'Insert Shot',
    cameraAngle: 'Eye Level',
    cameraMovement: 'Tilt',
    descriptionKo: '재훈이 쪽지를 접어 교과서 안쪽 깊숙이 밀어 넣는다.',
    dialogueKo: '',
    sfxKo: '종이 접히는 소리.',
    imagePromptEn: 'insert shot of hands folding old note and sliding it inside textbook, Korean school desk, realistic live action.'
  },
  {
    shotSize: 'Medium Shot',
    cameraAngle: 'Side Angle',
    cameraMovement: 'Track Out',
    descriptionKo: '창밖의 검은 우산은 이미 사라지고 운동장은 텅 비어 있다.',
    dialogueKo: '',
    sfxKo: '멀어지는 바람 소리.',
    imagePromptEn: 'side angle of Kang Jaehoon looking out classroom window at empty Korean schoolyard, black umbrella gone, realistic thriller tone.'
  },
  {
    shotSize: 'Close Up',
    cameraAngle: 'Eye Level',
    cameraMovement: 'Push In',
    descriptionKo: '재훈의 눈동자에 불안보다 결심에 가까운 빛이 떠오른다.',
    dialogueKo: '',
    sfxKo: '낮은 긴장음 상승.',
    imagePromptEn: 'close up of Kang Jaehoon eyes shifting from unease to resolve, Korean high school thriller, realistic live action, ARRI Alexa LF.'
  },
  {
    shotSize: 'Wide Shot',
    cameraAngle: 'Eye Level',
    cameraMovement: 'Static Locked Shot',
    descriptionKo: '종이 울리고, 새 학년 첫날의 교실은 평범한 소음 속으로 다시 묻힌다.',
    dialogueKo: '',
    sfxKo: '학교 종소리, 의자 움직임, 다시 커지는 웅성거림.',
    imagePromptEn: 'wide shot of Korean boys classroom as school bell rings, ordinary noise returning, Kang Jaehoon alone by window, realistic live action thriller.'
  }
];

export function createMockStoryboardScene(): StoryboardScene {
  const timecodes = generatePanelTimecodes(24, 15);
  const panels: StoryboardPanel[] = panelSeeds.map((seed, index) => ({
    id: `scene-01-panel-${String(index + 1).padStart(2, '0')}`,
    panelNumber: timecodes[index].panelNumber,
    startSec: timecodes[index].startSec,
    endSec: timecodes[index].endSec,
    timecodeLabel: timecodes[index].timecodeLabel,
    imagePromptEn: `${baseStyle} ${seed.imagePromptEn}`,
    shotSize: seed.shotSize,
    cameraAngle: seed.cameraAngle,
    cameraMovement: seed.cameraMovement,
    descriptionKo: seed.descriptionKo,
    dialogueKo: seed.dialogueKo,
    sfxKo: seed.sfxKo,
    characterRefs: ['강재훈'],
    locationRef: '2학년 교실',
    notes: ''
  }));

  return {
    id: 'mock-scene-01',
    title: '새 학년, 첫날',
    sceneCode: 'SCENE 01',
    durationSec: 15,
    panelCount: 24,
    panels
  };
}
