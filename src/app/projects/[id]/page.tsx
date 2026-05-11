import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createCharacter, createScene, createShot, updateProjectStatus, updateShotStatus } from '@/lib/actions';
import { labelFor, projectStatusLabels, shotStatusLabels, shotTypeLabels } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

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

  return (
    <main>
      <Link href="/" className="back-link">← Back to projects</Link>
      <section className="project-hero panel">
        <div>
          <p className="eyebrow">{labelFor(projectStatusLabels, project.status)}</p>
          <h1>{project.title}</h1>
          <p className="hero-copy">{project.logline}</p>
          <dl className="detail-list">
            <div>
              <dt>Audience</dt>
              <dd>{project.audience || 'Not defined'}</dd>
            </div>
            <div>
              <dt>Style guide</dt>
              <dd>{project.styleGuide || 'Add camera, lighting, palette, and reference guidance.'}</dd>
            </div>
          </dl>
        </div>
        <div className="status-panel">
          <div className="metrics stacked">
            <span><strong>{project.scenes.length}</strong> scenes</span>
            <span><strong>{shotCount}</strong> shots</span>
            <span><strong>{readyShots}</strong> ready/shot</span>
          </div>
          <form action={updateProjectStatus} className="inline-form">
            <input type="hidden" name="projectId" value={project.id} />
            <label>
              Project status
              <select name="status" defaultValue={project.status}>
                {Object.entries(projectStatusLabels).map(([value, label]) => (
                  <option value={value} key={value}>{label}</option>
                ))}
              </select>
            </label>
            <button type="submit">Update</button>
          </form>
        </div>
      </section>

      <section className="two-column">
        <form action={createScene} className="panel form-card">
          <h2>Add scene</h2>
          <input type="hidden" name="projectId" value={project.id} />
          <label>
            Scene title
            <input name="title" placeholder="Opening hook" required />
          </label>
          <div className="form-row">
            <label>
              Location
              <input name="location" placeholder="Studio, exterior..." />
            </label>
            <label>
              Time of day
              <input name="timeOfDay" placeholder="Dawn, night..." />
            </label>
          </div>
          <label>
            Story beat
            <textarea name="beat" rows={3} placeholder="What changes in this scene?" required />
          </label>
          <label>
            Notes
            <textarea name="notes" rows={3} placeholder="Production constraints, props, sound, transitions" />
          </label>
          <button type="submit">Add scene</button>
        </form>

        <form action={createCharacter} className="panel form-card">
          <h2>Add character or key element</h2>
          <input type="hidden" name="projectId" value={project.id} />
          <label>
            Name
            <input name="name" placeholder="Maya, Product, City..." required />
          </label>
          <label>
            Role
            <input name="role" placeholder="Protagonist, visual motif, prop" required />
          </label>
          <label>
            Motivation
            <textarea name="motivation" rows={2} placeholder="What this person or element is trying to communicate" />
          </label>
          <label>
            Wardrobe / design notes
            <textarea name="wardrobe" rows={2} placeholder="Color, materials, props, visual details" />
          </label>
          <button type="submit">Add character</button>
        </form>
      </section>

      <section className="section-heading">
        <p className="eyebrow">Shot planning</p>
        <h2>Scenes and shot list</h2>
      </section>

      <section className="scene-stack">
        {project.scenes.map((scene) => (
          <article className="panel scene-card" key={scene.id}>
            <header className="scene-header">
              <div>
                <p className="eyebrow">Scene {scene.sequence}</p>
                <h3>{scene.title}</h3>
                <p>{scene.beat}</p>
              </div>
              <div className="scene-meta">
                <span>{scene.location || 'Location TBD'}</span>
                <span>{scene.timeOfDay || 'Time TBD'}</span>
              </div>
            </header>
            {scene.notes ? <p className="note"><strong>Notes:</strong> {scene.notes}</p> : null}

            <div className="shot-list">
              {scene.shots.map((shot) => (
                <div className="shot-card" key={shot.id}>
                  <div>
                    <p className="eyebrow">Shot {scene.sequence}.{shot.sequence} · {labelFor(shotTypeLabels, shot.shotType)}</p>
                    <h4>{shot.title}</h4>
                    <p>{shot.description}</p>
                    <div className="card-meta">
                      {shot.lens ? <span>{shot.lens}</span> : null}
                      {shot.movement ? <span>{shot.movement}</span> : null}
                      {shot.duration ? <span>{shot.duration}</span> : null}
                    </div>
                  </div>
                  <form action={updateShotStatus} className="status-form">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="shotId" value={shot.id} />
                    <select name="status" defaultValue={shot.status} aria-label={`Status for ${shot.title}`}>
                      {Object.entries(shotStatusLabels).map(([value, label]) => (
                        <option value={value} key={value}>{label}</option>
                      ))}
                    </select>
                    <button type="submit">Save</button>
                  </form>
                </div>
              ))}
            </div>

            <form action={createShot} className="add-shot-form">
              <input type="hidden" name="projectId" value={project.id} />
              <input type="hidden" name="sceneId" value={scene.id} />
              <h4>Add shot</h4>
              <div className="form-row three">
                <label>
                  Title
                  <input name="title" placeholder="Hero push-in" required />
                </label>
                <label>
                  Type
                  <select name="shotType" defaultValue="WIDE">
                    {Object.entries(shotTypeLabels).map(([value, label]) => (
                      <option value={value} key={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select name="status" defaultValue="TODO">
                    {Object.entries(shotStatusLabels).map(([value, label]) => (
                      <option value={value} key={value}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Description
                <textarea name="description" rows={2} placeholder="Frame, action, camera intent, transition" required />
              </label>
              <div className="form-row three">
                <label>
                  Lens
                  <input name="lens" placeholder="35mm" />
                </label>
                <label>
                  Movement
                  <input name="movement" placeholder="Handheld drift" />
                </label>
                <label>
                  Duration
                  <input name="duration" placeholder="4s" />
                </label>
              </div>
              <button type="submit">Add shot</button>
            </form>
          </article>
        ))}
        {project.scenes.length === 0 ? (
          <div className="empty-state">
            <h3>No scenes yet</h3>
            <p>Add a scene above, then build a shot list inside it.</p>
          </div>
        ) : null}
      </section>

      <section className="section-heading">
        <p className="eyebrow">Cast and visual anchors</p>
        <h2>Characters / elements</h2>
      </section>
      <section className="character-grid">
        {project.characters.map((character) => (
          <article className="panel mini-card" key={character.id}>
            <h3>{character.name}</h3>
            <p className="badge">{character.role}</p>
            <p>{character.motivation || 'Motivation not defined.'}</p>
            <p className="note">{character.wardrobe || 'No wardrobe or design notes yet.'}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
