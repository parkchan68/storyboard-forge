import Link from 'next/link';
import { createProject } from '@/lib/actions';
import { labelFor, projectStatusLabels } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { scenes: true, characters: true }
      },
      scenes: {
        include: { _count: { select: { shots: true } } }
      }
    }
  });

  const shotCount = projects.reduce(
    (total, project) => total + project.scenes.reduce((sceneTotal, scene) => sceneTotal + scene._count.shots, 0),
    0
  );

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">로컬 우선 프리프로덕션 작업 공간</p>
          <h1>Storyboard Forge</h1>
          <p className="hero-copy">
            아이디어를 프로젝트, 장면, 샷 리스트, 캐릭터, 스타일 노트, 15초 고정 스토리보드로 정리하는 한국어 Next.js 앱입니다.
          </p>
          <div className="metrics" aria-label="작업 공간 요약">
            <span><strong>{projects.length}</strong> 프로젝트</span>
            <span><strong>{projects.reduce((total, project) => total + project._count.scenes, 0)}</strong> 장면</span>
            <span><strong>{shotCount}</strong> 샷</span>
          </div>
        </div>
        <form action={createProject} className="panel form-card">
          <h2>프로젝트 만들기</h2>
          <label>
            제목
            <input name="title" placeholder="브랜드 필름, 단편, 런칭 영상..." required />
          </label>
          <label>
            로그라인
            <textarea name="logline" placeholder="이야기를 한 문장으로 설명하세요." required rows={3} />
          </label>
          <label>
            대상 관객
            <input name="audience" placeholder="누구를 위한 영상인가요?" />
          </label>
          <label>
            비주얼 스타일 가이드
            <textarea name="styleGuide" placeholder="조명, 색감, 카메라 언어, 레퍼런스" rows={3} />
          </label>
          <label>
            상태
            <select name="status" defaultValue="IDEA">
              {Object.entries(projectStatusLabels).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
          </label>
          <button type="submit">스토리보드 생성</button>
        </form>
      </section>

      <section className="section-heading">
        <p className="eyebrow">작업 공간</p>
        <h2>프로젝트</h2>
      </section>

      <section className="project-grid">
        {projects.map((project) => {
          const projectShotCount = project.scenes.reduce((total, scene) => total + scene._count.shots, 0);

          return (
            <Link className="project-card" href={`/projects/${project.id}`} key={project.id}>
              <span className="badge">{labelFor(projectStatusLabels, project.status)}</span>
              <h3>{project.title}</h3>
              <p>{project.logline}</p>
              <div className="card-meta">
                <span>{project._count.scenes}개 장면</span>
                <span>{projectShotCount}개 샷</span>
                <span>{project._count.characters}개 캐릭터</span>
              </div>
            </Link>
          );
        })}
        {projects.length === 0 ? (
          <div className="empty-state">
            <h3>아직 프로젝트가 없습니다</h3>
            <p>첫 스토리보드 프로젝트를 만들어 장면과 샷을 정리하세요.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
