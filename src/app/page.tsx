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
          <p className="eyebrow">Local-first pre-production workspace</p>
          <h1>Storyboard Forge</h1>
          <p className="hero-copy">
            Turn an idea into a shootable storyboard with projects, scenes, shot lists, characters, style notes,
            and production status in one SQLite-backed Next.js app.
          </p>
          <div className="metrics" aria-label="Workspace summary">
            <span><strong>{projects.length}</strong> projects</span>
            <span><strong>{projects.reduce((total, project) => total + project._count.scenes, 0)}</strong> scenes</span>
            <span><strong>{shotCount}</strong> shots</span>
          </div>
        </div>
        <form action={createProject} className="panel form-card">
          <h2>Create a project</h2>
          <label>
            Title
            <input name="title" placeholder="Brand film, short, launch video..." required />
          </label>
          <label>
            Logline
            <textarea name="logline" placeholder="A one-sentence promise for the story." required rows={3} />
          </label>
          <label>
            Audience
            <input name="audience" placeholder="Who this is for" />
          </label>
          <label>
            Visual style guide
            <textarea name="styleGuide" placeholder="Lighting, palette, camera language, references" rows={3} />
          </label>
          <label>
            Status
            <select name="status" defaultValue="IDEA">
              {Object.entries(projectStatusLabels).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
          </label>
          <button type="submit">Forge storyboard</button>
        </form>
      </section>

      <section className="section-heading">
        <p className="eyebrow">Workspace</p>
        <h2>Projects</h2>
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
                <span>{project._count.scenes} scenes</span>
                <span>{projectShotCount} shots</span>
                <span>{project._count.characters} characters</span>
              </div>
            </Link>
          );
        })}
        {projects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p>Create your first storyboard project to start mapping scenes and shots.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
