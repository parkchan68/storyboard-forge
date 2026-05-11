import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.project.findFirst({ where: { title: 'Launch Film: Aurora Desk' } });

  if (existing) {
    console.log('Seed data already exists.');
    return;
  }

  await prisma.project.create({
    data: {
      title: 'Launch Film: Aurora Desk',
      logline: 'A focused creator turns a chaotic workspace into a cinematic command center before a deadline hits.',
      audience: 'Independent creators and small production teams',
      styleGuide: 'High contrast desk lighting, macro inserts, restrained camera moves, warm practicals, clean UI overlays.',
      status: 'DRAFTING',
      characters: {
        create: [
          {
            name: 'Maya',
            role: 'Creator protagonist',
            motivation: 'Ship a polished pitch before midnight.',
            wardrobe: 'Neutral hoodie, smartwatch, minimal jewelry'
          },
          {
            name: 'The Workspace',
            role: 'Visual antagonist turned ally',
            motivation: 'Represent clutter, pressure, and eventual clarity.',
            wardrobe: 'Props: sticky notes, cable mess, tablet, coffee mug'
          }
        ]
      },
      scenes: {
        create: [
          {
            title: 'Cold Open: Deadline Pressure',
            sequence: 1,
            location: 'Home studio desk',
            timeOfDay: 'Night',
            beat: 'Maya stares down a countdown timer while unfinished reference frames cover the desk.',
            notes: 'Open on tactile details and rising audio tension.',
            shots: {
              create: [
                {
                  sequence: 1,
                  title: 'Timer macro',
                  shotType: 'INSERT',
                  description: 'Extreme close-up of a ticking launch countdown reflected in Maya’s eye.',
                  lens: '85mm macro',
                  movement: 'Locked off with subtle screen flicker',
                  duration: '3s',
                  status: 'READY'
                },
                {
                  sequence: 2,
                  title: 'Desk chaos reveal',
                  shotType: 'WIDE',
                  description: 'Slow push across scattered sketches, cards, and cable clutter toward Maya.',
                  lens: '24mm',
                  movement: 'Slider push-in',
                  duration: '6s',
                  status: 'TODO'
                }
              ]
            }
          },
          {
            title: 'The Forge Moment',
            sequence: 2,
            location: 'Home studio desk',
            timeOfDay: 'Night',
            beat: 'Maya arranges cards into a clear storyboard and the scene transforms from cluttered to intentional.',
            notes: 'Use match cuts from paper cards to polished frames.',
            shots: {
              create: [
                {
                  sequence: 1,
                  title: 'Cards snap into order',
                  shotType: 'CLOSE_UP',
                  description: 'Hands place storyboard cards in sequence; each placement triggers a UI overlay.',
                  lens: '50mm',
                  movement: 'Top-down rig',
                  duration: '7s',
                  status: 'READY'
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Seeded Storyboard Forge demo project.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
