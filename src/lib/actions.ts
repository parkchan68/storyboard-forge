'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  projectStatusLabels,
  shotStatusLabels,
  shotTypeLabels,
  type ProjectStatus,
  type ShotStatus,
  type ShotType
} from '@/lib/constants';
import { prisma } from '@/lib/prisma';

function textValue(formData: FormData, key: string, fallback = '') {
  const value = formData.get(key);
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function optionalTextValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  return value.length > 0 ? value : null;
}

function optionValue<T extends Record<string, string>>(source: T, raw: FormDataEntryValue | null, fallback: keyof T) {
  if (typeof raw === 'string' && Object.keys(source).includes(raw)) {
    return raw as keyof T;
  }

  return fallback;
}

async function nextSceneSequence(projectId: string) {
  const scene = await prisma.scene.findFirst({
    where: { projectId },
    orderBy: { sequence: 'desc' },
    select: { sequence: true }
  });

  return (scene?.sequence ?? 0) + 1;
}

async function nextShotSequence(sceneId: string) {
  const shot = await prisma.shot.findFirst({
    where: { sceneId },
    orderBy: { sequence: 'desc' },
    select: { sequence: true }
  });

  return (shot?.sequence ?? 0) + 1;
}

export async function createProject(formData: FormData) {
  const project = await prisma.project.create({
    data: {
      title: textValue(formData, 'title', 'Untitled project'),
      logline: textValue(formData, 'logline', 'Add a concise project logline.'),
      audience: optionalTextValue(formData, 'audience'),
      styleGuide: optionalTextValue(formData, 'styleGuide'),
      status: optionValue(projectStatusLabels, formData.get('status'), 'IDEA') as ProjectStatus
    }
  });

  revalidatePath('/');
  redirect(`/projects/${project.id}`);
}

export async function updateProjectStatus(formData: FormData) {
  const projectId = textValue(formData, 'projectId');

  await prisma.project.update({
    where: { id: projectId },
    data: { status: optionValue(projectStatusLabels, formData.get('status'), 'IDEA') as ProjectStatus }
  });

  revalidatePath('/');
  revalidatePath(`/projects/${projectId}`);
}

export async function createScene(formData: FormData) {
  const projectId = textValue(formData, 'projectId');
  const sequence = await nextSceneSequence(projectId);

  await prisma.scene.create({
    data: {
      projectId,
      sequence,
      title: textValue(formData, 'title', `Scene ${sequence}`),
      location: optionalTextValue(formData, 'location'),
      timeOfDay: optionalTextValue(formData, 'timeOfDay'),
      beat: textValue(formData, 'beat', 'Describe the story beat for this scene.'),
      notes: optionalTextValue(formData, 'notes')
    }
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function createShot(formData: FormData) {
  const sceneId = textValue(formData, 'sceneId');
  const projectId = textValue(formData, 'projectId');
  const sequence = await nextShotSequence(sceneId);

  await prisma.shot.create({
    data: {
      sceneId,
      sequence,
      title: textValue(formData, 'title', `Shot ${sequence}`),
      shotType: optionValue(shotTypeLabels, formData.get('shotType'), 'WIDE') as ShotType,
      description: textValue(formData, 'description', 'Describe framing, action, and intent.'),
      lens: optionalTextValue(formData, 'lens'),
      movement: optionalTextValue(formData, 'movement'),
      duration: optionalTextValue(formData, 'duration'),
      status: optionValue(shotStatusLabels, formData.get('status'), 'TODO') as ShotStatus
    }
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function updateShotStatus(formData: FormData) {
  const shotId = textValue(formData, 'shotId');
  const projectId = textValue(formData, 'projectId');

  await prisma.shot.update({
    where: { id: shotId },
    data: { status: optionValue(shotStatusLabels, formData.get('status'), 'TODO') as ShotStatus }
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function createCharacter(formData: FormData) {
  const projectId = textValue(formData, 'projectId');

  await prisma.character.create({
    data: {
      projectId,
      name: textValue(formData, 'name', 'Unnamed character'),
      role: textValue(formData, 'role', 'Supporting role'),
      motivation: optionalTextValue(formData, 'motivation'),
      wardrobe: optionalTextValue(formData, 'wardrobe')
    }
  });

  revalidatePath(`/projects/${projectId}`);
}
