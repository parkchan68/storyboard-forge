import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createCharacter, createScene, createShot, updateProjectStatus, updateShotStatus } from '@/lib/actions';
import { labelFor, projectStatusLabels, shotStatusLabels, shotTypeLabels } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { StoryboardEditor } from './storyboard-editor';

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      characters: { orderBy: { createdAt: 'asc' } },
      scenes: {
        orderBy: { sequence: 'asc' },
        include: { shots: { orderBy: { sequence: 'asc' } } }
      }
    }
  });

  if (!project) {
    notFound();
  }

  const shotCount = project.scenes.reduce((total, scene) => total + scene.shots.length, 0);
  const readyShots = project.scenes.reduce(
    (total, scene) => total + scene.shots.filter((shot) => shot.status === 'READY' || shot.status === 'SHOT').length,
    0
  );

  const editorProject = {
    id: project.id,
    title: project.title,
    logline: project.logline,
    characters: project.characters.map((character) => ({ id: character.id, name: character.name, role: character.role })),
    scenes: project.scenes.map((scene) => ({
      id: scene.id,
      sequence: scene.sequence,
      title: scene.title,
      location: scene.location,
      beat: scene.beat
    }))
  };

  return (
    <main>
      <Link href="/" className="back-link">← 프로젝트로 돌아가기</Link>
      <section className="project-hero panel">
        <div>
          <p className="eyebrow">{labelFor(projectStatusLabels, project.status)}</p>
          <h1>{project.title}</h1>
          <p className="hero-copy">{project.logline}</p>
          <dl className="detail-list">
            <div>
              <dt>대상 관객</dt>
              <dd>{project.audience || '정의되지 않음'}</dd>
            </div>
            <div>
              <dt>스타일 가이드</dt>
              <dd>{project.styleGuide || '카메라, 조명, 색감, 레퍼런스 가이드를 추가하세요.'}</dd>
            </div>
          </dl>
        </div>
        <div className="status-panel">
          <div className="metrics stacked">
            <span><strong>{project.scenes.length}</strong> 장면</span>
            <span><strong>{shotCount}</strong> 샷</span>
            <span><strong>{readyShots}</strong> 준비/촬영 완료</span>
          </div>
          <form action={updateProjectStatus} className="inline-form">
            <input type="hidden" name="projectId" value={project.id} />
            <label>
              프로젝트 상태
              <select name="status" defaultValue={project.status}>
                {Object.entries(projectStatusLabels).map(([value, label]) => (
                  <option value={value} key={value}>{label}</option>
                ))}
              </select>
            </label>
            <button type="submit">업데이트</button>
          </form>
        </div>
      </section>

      <StoryboardEditor project={editorProject} />

      <section className="two-column">
        <form action={createScene} className="panel form-card">
          <h2>장면 추가</h2>
          <input type="hidden" name="projectId" value={project.id} />
          <label>
            장면 제목
            <input name="title" placeholder="오프닝 훅" required />
          </label>
          <div className="form-row">
            <label>
              장소
              <input name="location" placeholder="교실, 복도, 외부..." />
            </label>
            <label>
              시간대
              <input name="timeOfDay" placeholder="아침, 밤, 방과 후..." />
            </label>
          </div>
          <label>
            스토리 비트
            <textarea name="beat" rows={3} placeholder="이 장면에서 무엇이 바뀌나요?" required />
          </label>
          <label>
            노트
            <textarea name="notes" rows={3} placeholder="제작 제약, 소품, 사운드, 전환" />
          </label>
          <button type="submit">장면 추가</button>
        </form>

        <form action={createCharacter} className="panel form-card">
          <h2>캐릭터 추가</h2>
          <input type="hidden" name="projectId" value={project.id} />
          <label>
            이름
            <input name="name" placeholder="강재훈, 핵심 소품, 장소..." required />
          </label>
          <label>
            역할
            <input name="role" placeholder="주인공, 시각 모티프, 소품" required />
          </label>
          <label>
            동기
            <textarea name="motivation" rows={2} placeholder="이 인물 또는 요소가 전달하려는 것" />
          </label>
          <label>
            의상 / 디자인 노트
            <textarea name="wardrobe" rows={2} placeholder="색상, 소재, 소품, 시각 디테일" />
          </label>
          <button type="submit">캐릭터 추가</button>
        </form>
      </section>

      <section className="section-heading">
        <p className="eyebrow">샷 플래닝</p>
        <h2>장면 및 샷 리스트</h2>
      </section>

      <section className="scene-stack">
        {project.scenes.map((scene) => (
          <article className="panel scene-card" key={scene.id}>
            <header className="scene-header">
              <div>
                <p className="eyebrow">장면 {scene.sequence}</p>
                <h3>{scene.title}</h3>
                <p>{scene.beat}</p>
              </div>
              <div className="scene-meta">
                <span>{scene.location || '장소 미정'}</span>
                <span>{scene.timeOfDay || '시간 미정'}</span>
              </div>
            </header>
            {scene.notes ? <p className="note"><strong>노트:</strong> {scene.notes}</p> : null}

            <div className="shot-list">
              {scene.shots.map((shot) => (
                <div className="shot-card" key={shot.id}>
                  <div>
                    <p className="eyebrow">샷 {scene.sequence}.{shot.sequence} · {labelFor(shotTypeLabels, shot.shotType)}</p>
                    <h4>{shot.title}</h4>
                    <p>{shot.description}</p>
                    <div className="card-meta">
                      <span>렌즈: {shot.lens || '미정'}</span>
                      <span>움직임: {shot.movement || '미정'}</span>
                      <span>길이: {shot.duration || '미정'}</span>
                    </div>
                  </div>
                  <form action={updateShotStatus} className="status-form">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="shotId" value={shot.id} />
                    <label>
                      상태
                      <select name="status" defaultValue={shot.status}>
                        {Object.entries(shotStatusLabels).map(([value, label]) => (
                          <option value={value} key={value}>{label}</option>
                        ))}
                      </select>
                    </label>
                    <button type="submit">저장</button>
                  </form>
                </div>
              ))}
              {scene.shots.length === 0 ? <p className="empty-copy">아직 샷이 없습니다. 아래에서 첫 샷을 추가하세요.</p> : null}
            </div>

            <form action={createShot} className="add-shot-form">
              <h4>샷 추가</h4>
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="sceneId" value={scene.id} />
              <div className="form-row three">
                <label>
                  샷 제목
                  <input name="title" placeholder="위협적인 복도" required />
                </label>
                <label>
                  샷 타입
                  <select name="shotType" defaultValue="WIDE">
                    {Object.entries(shotTypeLabels).map(([value, label]) => (
                      <option value={value} key={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  상태
                  <select name="status" defaultValue="TODO">
                    {Object.entries(shotStatusLabels).map(([value, label]) => (
                      <option value={value} key={value}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                설명
                <textarea name="description" rows={2} placeholder="프레이밍, 액션, 의도를 설명하세요." required />
              </label>
              <div className="form-row three">
                <label>
                  렌즈
                  <input name="lens" placeholder="35mm, 85mm 매크로" />
                </label>
                <label>
                  움직임
                  <input name="movement" placeholder="고정, 푸시 인, 핸드헬드" />
                </label>
                <label>
                  길이
                  <input name="duration" placeholder="예: 0.625초" />
                </label>
              </div>
              <button type="submit">샷 추가</button>
            </form>
          </article>
        ))}
      </section>

      <section className="section-heading">
        <p className="eyebrow">캐릭터 및 에셋</p>
        <h2>프로젝트 에셋</h2>
      </section>
      <section className="character-grid">
        {project.characters.map((character) => (
          <article className="panel mini-card" key={character.id}>
            <h3>{character.name}</h3>
            <p><strong>역할:</strong> {character.role}</p>
            <p><strong>동기:</strong> {character.motivation || '미정'}</p>
            <p><strong>의상 / 디자인:</strong> {character.wardrobe || '미정'}</p>
          </article>
        ))}
        {project.characters.length === 0 ? <p className="empty-copy">아직 캐릭터가 없습니다.</p> : null}
      </section>
    </main>
  );
}
