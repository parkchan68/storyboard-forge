# Storyboard Forge

Storyboard Forge is a local-first pre-production workspace for turning a video idea into a shootable storyboard. It helps creators and small production teams organize projects, scenes, shot lists, character or prop notes, style direction, and readiness status before production starts.

This repository contains a complete Next.js app with Prisma and SQLite so another developer can clone it, run one setup command, inspect the data model, and keep building.

## What is included

- **Next.js App Router UI** for project dashboards and detail pages.
- **Server Actions** for creating projects, scenes, shots, characters, and updating statuses.
- **Prisma + SQLite** local database setup.
- **Seed data** for a demo launch-film storyboard.
- **Developer handoff notes**, known limitations, and a TODO list.
- **npm scripts** for setup, local development, Prisma workflows, type checking, linting, and builds.

## Core product requirements implemented

Storyboard Forge currently supports the core storyboard planning workflow:

1. Create a storyboard project with title, logline, audience, visual style guide, and lifecycle status.
2. View all projects with scene, shot, and character counts.
3. Open a project workspace with production metadata and readiness metrics.
4. Add ordered scenes with location, time of day, story beat, and notes.
5. Add ordered shots inside scenes with shot type, description, lens, movement, duration, and shot status.
6. Update project and shot status from the UI.
7. Add characters, products, props, or visual anchors with role, motivation, and wardrobe/design notes.
8. Store all data locally in SQLite through Prisma.

## Tech stack

- [Next.js](https://nextjs.org/) with the App Router
- React
- TypeScript
- Prisma ORM
- SQLite
- CSS Modules are not used; styling is centralized in `src/app/globals.css` for fast handoff.

## Repository structure

```text
.
├── prisma/
│   ├── schema.prisma      # SQLite datasource, enums, and relational data model
│   └── seed.ts            # Demo project, scenes, shots, and characters
├── src/
│   ├── app/
│   │   ├── globals.css    # Global app styles
│   │   ├── layout.tsx     # Root layout and metadata
│   │   ├── page.tsx       # Project dashboard and creation form
│   │   └── projects/[id]/page.tsx # Project workspace
│   └── lib/
│       ├── actions.ts     # Server Actions for mutations
│       └── prisma.ts      # Prisma client singleton
├── .env.example           # Local environment template
├── package.json           # npm scripts and dependencies
└── README.md              # Setup, handoff, limitations, TODO
```

## Prerequisites

- Node.js 20 or newer is recommended.
- npm 10 or newer is recommended.

## Environment setup

Copy the example environment file:

```bash
cp .env.example .env
```

Default local configuration:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_NAME="Storyboard Forge"
```

Prisma resolves the SQLite path relative to the `prisma/` directory, so the default database file is created at `prisma/dev.db`.

## Quick start

From the repository root:

```bash
npm run setup
npm run dev
```

Then open <http://localhost:3000>.

`npm run setup` installs dependencies, creates `.env` if it does not exist, generates the Prisma client, pushes the schema to SQLite, and seeds demo data.

## Manual setup

Use these commands if you prefer to run each step yourself:

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

## npm scripts

| Script | Purpose |
| --- | --- |
| `npm run setup` | One-command local bootstrap. |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Build the production Next.js app. |
| `npm run start` | Start the production server after a build. |
| `npm run lint` | Run ESLint with the Next.js core web vitals configuration. |
| `npm run typecheck` | Run TypeScript without emitting files. |
| `npm run prisma:generate` | Generate Prisma Client. |
| `npm run prisma:migrate` | Create and apply a development migration. |
| `npm run prisma:studio` | Open Prisma Studio for inspecting local data. |
| `npm run db:push` | Push the current Prisma schema to SQLite without creating a migration. |
| `npm run db:seed` | Seed demo Storyboard Forge data. |

## Prisma SQLite workflow

### Local schema updates

For quick prototyping:

```bash
npm run db:push
npm run prisma:generate
```

For durable changes that should be reviewed and versioned:

```bash
npm run prisma:migrate
```

### Reset local demo data

If you want to rebuild the local SQLite database from scratch:

```bash
rm -f prisma/dev.db
npm run db:push
npm run db:seed
```

## Developer handoff notes

- `src/lib/actions.ts` contains all write operations. Start here when adding validation, permissions, delete flows, or drag-and-drop reordering.
- `src/lib/prisma.ts` uses a singleton pattern to avoid exhausting database connections during hot reloads.
- The dashboard query in `src/app/page.tsx` loads projects and counts for a compact overview.
- The project workspace in `src/app/projects/[id]/page.tsx` intentionally keeps forms colocated with the UI so a new developer can understand the mutation flow quickly.
- The app is currently optimized for local development and a single-user workflow.
- The seed script is idempotent for the included demo project title; it exits early if that project already exists.
- SQLite is the default to reduce onboarding friction. If deploying to a multi-user production environment, plan a migration to Postgres or another server database.

## Known limitations

- No authentication or authorization yet.
- No image upload, AI image generation, or visual storyboard frame canvas yet.
- No drag-and-drop ordering; scenes and shots are appended with the next sequence number.
- No edit or delete UI for existing records.
- No automated test suite yet beyond type checking, linting, and build verification.
- SQLite is suitable for local use and demos, but not ideal for concurrent multi-user production editing.
- Server Action form validation is intentionally lightweight; production use should add stronger schema validation and user-facing error states.

## TODO

- Add authentication and per-user workspaces.
- Add edit and delete flows for projects, scenes, shots, and characters.
- Add drag-and-drop scene and shot reordering.
- Add storyboard frame image upload and thumbnail galleries.
- Add export to PDF, CSV shot list, and production call-sheet formats.
- Add richer validation with Zod or a similar schema library.
- Add unit tests for helper functions and integration tests for Server Actions.
- Add Playwright coverage for the project creation and shot planning flows.
- Add production database support and migration documentation.
- Add accessibility pass for focus states, form errors, and keyboard-only workflows.

## Troubleshooting

### Prisma cannot find `DATABASE_URL`

Make sure `.env` exists in the repository root and contains:

```env
DATABASE_URL="file:./dev.db"
```

Then rerun:

```bash
npm run prisma:generate
npm run db:push
```

### The app starts but has no data

Seed the database:

```bash
npm run db:seed
```

### TypeScript cannot find Prisma enums

Regenerate the Prisma client:

```bash
npm run prisma:generate
```
