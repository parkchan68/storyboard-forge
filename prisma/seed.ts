import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.project.findFirst({ where: { title: '새 학년, 첫날' } });

  if (existing) {
    console.log('시드 데이터가 이미 있습니다.');
    return;
  }

  await prisma.project.create({
    data: {
      title: '새 학년, 첫날',
      logline: '새 학년 첫날, 조용한 고등학생 강재훈은 교실 안에 숨겨진 경고와 자신을 지켜보는 흔적을 발견한다.',
      audience: '한국 학원 스릴러와 현실적인 라이브 액션 숏폼을 좋아하는 관객',
      styleGuide: '차가운 형광등, 현실적인 한국 고등학교, 남학생 교실, 절제된 카메라 움직임, 애니메이션/카툰/3D 렌더 금지.',
      status: 'DRAFTING',
      characters: {
        create: [
          {
            name: '강재훈',
            role: '주인공',
            motivation: '새 학년 첫날 자신을 향한 경고의 정체를 알아내려 한다.',
            wardrobe: '남색 교복 블레이저, 흰 셔츠, 줄무늬 넥타이, 이름표 강재훈, 안경 없음'
          },
          {
            name: '검은 우산',
            role: '불길한 시각 모티프',
            motivation: '재훈을 감시하는 보이지 않는 존재의 흔적을 암시한다.',
            wardrobe: '비 오는 날이 아닌데 운동장 끝에 놓인 검은 우산'
          }
        ]
      },
      scenes: {
        create: [
          {
            title: '첫 조회',
            sequence: 1,
            location: '2학년 교실',
            timeOfDay: '아침',
            beat: '재훈은 평범한 첫 조회 중 자신의 이름이 표시된 쪽지와 좌석표를 발견한다.',
            notes: '15초 고정 스토리보드 에디터에서 SCENE 01 목업을 생성해 세부 패널을 확인한다.',
            shots: {
              create: [
                {
                  sequence: 1,
                  title: '교실 와이드',
                  shotType: 'WIDE',
                  description: '새 학년 첫날 남학생들이 교실에 들어와 시끄럽게 자리를 잡는다.',
                  lens: '35mm',
                  movement: '고정',
                  duration: '0.625초',
                  status: 'READY'
                },
                {
                  sequence: 2,
                  title: '재훈 소개',
                  shotType: 'MEDIUM',
                  description: '창가 자리의 강재훈이 책을 펼쳐놓고 조용히 앉아 있다.',
                  lens: '50mm',
                  movement: '고정',
                  duration: '0.625초',
                  status: 'TODO'
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Storyboard Forge 한국어 데모 프로젝트를 생성했습니다.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
