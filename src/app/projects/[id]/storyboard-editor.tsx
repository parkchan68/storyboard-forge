'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createMockStoryboardScene } from '@/lib/mock-storyboard';
import {
  cameraAngleKo,
  cameraAngles,
  cameraMovementKo,
  cameraMovements,
  shotSizeKo,
  shotSizes,
  type CameraAngle,
  type CameraMovement,
  type ShotSize,
  type StoryboardPanel,
  validPanelCounts,
  type StoryboardScene,
  type ValidPanelCount
} from '@/lib/storyboard-types';
import { generatePanelTimecodes, recalculateTimecodesAfterReorder, validateSceneTiming } from '@/lib/timecode';

type ProjectAsset = {
  id: string;
  name: string;
  role: string;
};

type SceneSummary = {
  id: string;
  sequence: number;
  title: string;
  location: string | null;
  beat: string;
};

type StoryboardEditorProps = {
  project: {
    id: string;
    title: string;
    logline: string;
    characters: ProjectAsset[];
    scenes: SceneSummary[];
  };
};

const locations = ['2학년 교실', '복도', '운동장', '교무실', '계단참'];
const panelCountOptions = validPanelCounts;

type CharacterReferenceImage = {
  id: string;
  name: string;
  role: string;
  appearanceNotes: string;
  imageUrl: string;
};

type ExportRow = Record<string, string | number>;

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit++) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff);
}

function writeUint32(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function textBytes(value: string) {
  return new TextEncoder().encode(value);
}

function zipStore(files: { name: string; content: string }[]) {
  const output: number[] = [];
  const centralDirectory: number[] = [];

  for (const file of files) {
    const name = textBytes(file.name);
    const data = textBytes(file.content);
    const checksum = crc32(data);
    const offset = output.length;

    writeUint32(output, 0x04034b50);
    writeUint16(output, 20);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint16(output, 0);
    writeUint32(output, checksum);
    writeUint32(output, data.length);
    writeUint32(output, data.length);
    writeUint16(output, name.length);
    writeUint16(output, 0);
    output.push(...name, ...data);

    writeUint32(centralDirectory, 0x02014b50);
    writeUint16(centralDirectory, 20);
    writeUint16(centralDirectory, 20);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint32(centralDirectory, checksum);
    writeUint32(centralDirectory, data.length);
    writeUint32(centralDirectory, data.length);
    writeUint16(centralDirectory, name.length);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint16(centralDirectory, 0);
    writeUint32(centralDirectory, 0);
    writeUint32(centralDirectory, offset);
    centralDirectory.push(...name);
  }

  const centralOffset = output.length;
  output.push(...centralDirectory);
  writeUint32(output, 0x06054b50);
  writeUint16(output, 0);
  writeUint16(output, 0);
  writeUint16(output, files.length);
  writeUint16(output, files.length);
  writeUint32(output, centralDirectory.length);
  writeUint32(output, centralOffset);
  writeUint16(output, 0);

  return new Uint8Array(output);
}

function escapeXml(value: string | number) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function createXlsxBlob(rows: ExportRow[]) {
  const headers = Object.keys(rows[0] ?? {});
  const sheetRows = [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ''))]
    .map((row) => `<row>${row.map((cell) => `<c t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`).join('')}</row>`)
    .join('');
  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`;
  const workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Storyboard" sheetId="1" r:id="rId1"/></sheets></workbook>';
  const workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>';
  const rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
  const types = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>';

  const bytes = zipStore([
    { name: '[Content_Types].xml', content: types },
    { name: '_rels/.rels', content: rootRels },
    { name: 'xl/workbook.xml', content: workbook },
    { name: 'xl/_rels/workbook.xml.rels', content: workbookRels },
    { name: 'xl/worksheets/sheet1.xml', content: worksheet }
  ]);

  return new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function drawWrappedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const words = text.split(/\s+/);
  let line = '';
  let currentY = y;
  let lines = 0;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
      lines += 1;
      if (lines >= maxLines) return;
    } else {
      line = testLine;
    }
  }

  if (line && lines < maxLines) context.fillText(line, x, currentY);
}

function drawStoryboardCanvas(context: CanvasRenderingContext2D, scene: StoryboardScene) {
  context.fillStyle = '#f5f7fb';
  context.fillRect(0, 0, 1920, 1080);
  context.fillStyle = '#172033';
  context.font = '700 42px sans-serif';
  context.fillText(`${scene.sceneCode} · ${scene.title}`, 48, 70);
  context.font = '700 24px sans-serif';
  context.fillText(`Storyboard Forge · 15초 고정 · ${scene.panels.length}패널 균등 분배`, 48, 112);

  const columns = scene.panels.length >= 24 ? 6 : scene.panels.length === 15 ? 5 : 3;
  const gap = 16;
  const startX = 48;
  const startY = 142;
  const cardW = (1920 - startX * 2 - gap * (columns - 1)) / columns;
  const cardH = scene.panels.length >= 24 ? 210 : 270;

  scene.panels.forEach((panel, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = startX + col * (cardW + gap);
    const y = startY + row * (cardH + gap);
    context.fillStyle = '#ffffff';
    context.strokeStyle = '#d8deea';
    context.lineWidth = 2;
    context.fillRect(x, y, cardW, cardH);
    context.strokeRect(x, y, cardW, cardH);
    context.fillStyle = '#1d2738';
    context.fillRect(x + 8, y + 8, cardW - 16, 86);
    context.fillStyle = '#ffffff';
    context.font = '800 20px sans-serif';
    context.fillText(`#${String(panel.panelNumber).padStart(2, '0')}`, x + 20, y + 40);
    context.font = '700 15px sans-serif';
    context.fillText(panel.timecodeLabel, x + 20, y + 72);
    context.fillStyle = '#172033';
    context.font = '700 14px sans-serif';
    context.fillText(`${shotSizeKo[panel.shotSize]} · ${cameraAngleKo[panel.cameraAngle]}`, x + 12, y + 116);
    context.fillText(cameraMovementKo[panel.cameraMovement], x + 12, y + 138);
    context.font = '14px sans-serif';
    drawWrappedText(context, panel.descriptionKo, x + 12, y + 162, cardW - 24, 18, 2);
    context.fillStyle = '#475569';
    context.font = '12px sans-serif';
    drawWrappedText(context, `대사: ${panel.dialogueKo || '없음'} / SFX: ${panel.sfxKo || '없음'}`, x + 12, y + cardH - 24, cardW - 24, 14, 1);
  });
}

function createPlaceholderImage(panelNumber: number) {
  return `linear-gradient(135deg, rgba(26,31,43,.96), rgba(42,56,78,.96)), radial-gradient(circle at 30% 20%, rgba(79,209,197,.35), transparent 36%), linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,0))`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function makeBlankScene(panelCount: ValidPanelCount): StoryboardScene {
  const timecodes = generatePanelTimecodes(panelCount, 15);

  return {
    id: `blank-scene-${Date.now()}`,
    title: '새 장면',
    sceneCode: 'SCENE 01',
    durationSec: 15,
    panelCount,
    panels: timecodes.map((timecode) => ({
      id: `panel-${crypto.randomUUID()}`,
      ...timecode,
      imagePromptEn: 'realistic Korean live action thriller, no anime, no cartoon, no 3D render, no fantasy.',
      shotSize: 'Medium Shot',
      cameraAngle: 'Eye Level',
      cameraMovement: 'Static Locked Shot',
      descriptionKo: '장면 설명을 입력하세요.',
      dialogueKo: '',
      sfxKo: '',
      characterRefs: [],
      locationRef: '2학년 교실',
      notes: ''
    }))
  };
}

export function StoryboardEditor({ project }: StoryboardEditorProps) {
  const [storyboardScene, setStoryboardScene] = useState<StoryboardScene>(() => createMockStoryboardScene());
  const [selectedPanelId, setSelectedPanelId] = useState<string>('scene-01-panel-01');
  const [warning, setWarning] = useState<string>('');
  const [notice, setNotice] = useState<string>('준비 완료');
  const [characterReferences, setCharacterReferences] = useState<CharacterReferenceImage[]>([]);
  const [referencesLoaded, setReferencesLoaded] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const storageKey = `storyboard-forge:${project.id}:character-references`;
  const selectedPanel = storyboardScene.panels.find((panel) => panel.id === selectedPanelId) ?? storyboardScene.panels[0];
  const characterReferenceOptions = [
    { id: 'default-kang-jaehoon', name: '강재훈', role: '주인공' },
    ...project.characters.map((character) => ({ id: character.id, name: character.name, role: character.role })),
    ...characterReferences.map((reference) => ({ id: reference.id, name: reference.name, role: reference.role }))
  ];
  const selectedCharacterReferenceImages = characterReferences.filter((reference) => selectedPanel?.characterRefs.includes(reference.name));
  const timingValidation = useMemo(
    () => validateSceneTiming(storyboardScene.panels, storyboardScene.durationSec),
    [storyboardScene]
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        setCharacterReferences(JSON.parse(saved) as CharacterReferenceImage[]);
      }
    } catch {
      setCharacterReferences([]);
    } finally {
      setReferencesLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!referencesLoaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(characterReferences));
  }, [characterReferences, referencesLoaded, storageKey]);

  function selectPanel(panelId: string) {
    setSelectedPanelId(panelId);
    setWarning('');
  }

  function updateSelectedPanel(updates: Partial<StoryboardPanel>) {
    setStoryboardScene((scene) => ({
      ...scene,
      panels: scene.panels.map((panel) => (panel.id === selectedPanel.id ? { ...panel, ...updates } : panel))
    }));
  }

  function generateMockStoryboard() {
    const scene = createMockStoryboardScene(storyboardScene.panelCount);
    setStoryboardScene(scene);
    setSelectedPanelId(scene.panels[0].id);
    setNotice(`${scene.panelCount}개 패널 스토리보드를 15초 고정 타임코드로 생성했습니다.`);
    setWarning('');
  }

  function changePanelCount(nextCount: ValidPanelCount) {
    const scene = makeBlankScene(nextCount);
    setStoryboardScene(scene);
    setSelectedPanelId(scene.panels[0].id);
    setNotice(`${nextCount}개 패널로 새 15초 장면을 준비했습니다.`);
  }

  function validateForExport() {
    const warnings = [...timingValidation.warnings];

    storyboardScene.panels.forEach((panel) => {
      if (!panel.shotSize || !panel.cameraAngle || !panel.cameraMovement || !panel.descriptionKo || panel.dialogueKo === undefined || panel.sfxKo === undefined || !panel.imagePromptEn) {
        warnings.push(`${panel.panelNumber}번 패널의 필수 편집 필드가 비어 있습니다.`);
      }
      if (panel.imageUrl === undefined) {
        // An empty URL is valid because the image field is editable and can intentionally remain a placeholder.
        return;
      }
    });

    if (warnings.length > 0) {
      setWarning(`내보내기 전 타임코드 검증 실패: ${warnings.join(' ')}`);
      return false;
    }

    setWarning('');
    return true;
  }

  function exportJson() {
    if (!validateForExport()) return;
    const payload = { project, storyboardScene, characterReferences, exportedAt: new Date().toISOString() };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }), 'storyboard-forge-15s.json');
  }

  function exportExcel() {
    if (!validateForExport()) return;

    const rows = storyboardScene.panels.map((panel) => ({
      'Panel Number': panel.panelNumber,
      'Scene Code': storyboardScene.sceneCode,
      Timecode: panel.timecodeLabel,
      'Shot Size': panel.shotSize,
      'Camera Angle': panel.cameraAngle,
      'Camera Movement': panel.cameraMovement,
      'Korean Scene Description': panel.descriptionKo,
      Dialogue: panel.dialogueKo,
      SFX: panel.sfxKo,
      'English Image Prompt': panel.imagePromptEn,
      'Character References': panel.characterRefs.join(', '),
      'Location Reference': panel.locationRef ?? '',
      Notes: panel.notes ?? ''
    }));
    downloadBlob(createXlsxBlob(rows), 'storyboard-forge-15s.xlsx');
  }

  function exportPng() {
    if (!validateForExport()) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const context = canvas.getContext('2d');
    if (!context) return;
    drawStoryboardCanvas(context, storyboardScene);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, 'storyboard-forge-15s.png');
    });
  }

  function exportPdf() {
    if (!validateForExport()) return;
    window.print();
  }

  function addCharacterReferenceImages(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    Promise.all(files.map((file, index) => new Promise<CharacterReferenceImage>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: `character-reference-${crypto.randomUUID()}`,
          name: file.name.replace(/\.[^.]+$/, '') || `캐릭터 ${characterReferences.length + index + 1}`,
          role: '역할 미정',
          appearanceNotes: '',
          imageUrl: String(reader.result)
        });
      };
      reader.readAsDataURL(file);
    }))).then((references) => {
      setCharacterReferences((current) => [...current, ...references]);
      setNotice(`${references.length}개의 캐릭터 레퍼런스 이미지를 추가했습니다.`);
    });
  }

  function updateCharacterReference(referenceId: string, updates: Partial<Omit<CharacterReferenceImage, 'id' | 'imageUrl'>>) {
    const previous = characterReferences.find((reference) => reference.id === referenceId);
    setCharacterReferences((references) => references.map((reference) => (reference.id === referenceId ? { ...reference, ...updates } : reference)));

    if (previous && updates.name && updates.name !== previous.name) {
      setStoryboardScene((scene) => ({
        ...scene,
        panels: scene.panels.map((panel) => ({
          ...panel,
          characterRefs: panel.characterRefs.map((name) => (name === previous.name ? updates.name as string : name))
        }))
      }));
    }
  }

  function deleteCharacterReference(reference: CharacterReferenceImage) {
    setCharacterReferences((references) => references.filter((item) => item.id !== reference.id));
    setStoryboardScene((scene) => ({
      ...scene,
      panels: scene.panels.map((panel) => ({
        ...panel,
        characterRefs: panel.characterRefs.filter((name) => name !== reference.name)
      }))
    }));
    setNotice(`${reference.name} 레퍼런스를 삭제했습니다.`);
  }

  function replaceImage(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateSelectedPanel({ imageUrl: String(reader.result) });
      setNotice('이미지를 교체했습니다.');
    };
    reader.readAsDataURL(file);
  }

  function duplicatePanel() {
    setStoryboardScene((scene) => {
      const index = scene.panels.findIndex((panel) => panel.id === selectedPanel.id);
      const duplicated = { ...selectedPanel, id: `panel-${crypto.randomUUID()}`, notes: `${selectedPanel.notes ?? ''}` };
      const inserted = [...scene.panels.slice(0, index + 1), duplicated, ...scene.panels.slice(index + 1)];
      const overflowIndex = index + 2 < inserted.length ? index + 2 : 0;
      const panels = inserted.length > scene.panelCount
        ? inserted.filter((_, panelIndex) => panelIndex !== overflowIndex)
        : inserted;
      const recalculated = recalculateTimecodesAfterReorder(panels, 15);
      setSelectedPanelId(duplicated.id);
      return { ...scene, panels: recalculated };
    });
    setNotice('선택 패널을 복제하고 현재 패널 수 안에서 15초 타임코드를 다시 계산했습니다.');
  }

  function deletePanel() {
    if (storyboardScene.panels.length <= 1) {
      setWarning('패널은 최소 1개 이상 필요합니다.');
      return;
    }
    setStoryboardScene((scene) => {
      const panels = scene.panels.filter((panel) => panel.id !== selectedPanel.id);
      const recalculated = recalculateTimecodesAfterReorder(panels, 15);
      setSelectedPanelId(recalculated[0].id);
      return { ...scene, panels: recalculated };
    });
    setNotice('패널을 삭제하고 15초 안에서 타임코드를 다시 계산했습니다.');
  }

  const gridClass = storyboardScene.panels.length >= 24 ? 'grid-24' : storyboardScene.panels.length === 15 ? 'grid-15' : storyboardScene.panels.length === 9 ? 'grid-9' : 'grid-flex';

  return (
    <section className="storyboard-editor" aria-label="스토리보드 편집기">
      <div className="editor-toolbar panel">
        <div>
          <p className="eyebrow">15초 고정 · 타임코드 검증</p>
          <h2>스토리보드 생성 및 패널 수정</h2>
          <p>{notice}</p>
          {warning ? <p className="warning-text">{warning}</p> : <p className="success-text">검증 상태: {timingValidation.valid ? '준비 완료' : '확인 필요'}</p>}
        </div>
        <div className="toolbar-actions">
          <button type="button" onClick={generateMockStoryboard}>스토리보드 생성</button>
          <label className="compact-select">
            패널 수
            <select value={storyboardScene.panelCount} onChange={(event) => changePanelCount(Number(event.target.value) as ValidPanelCount)}>
              {panelCountOptions.map((count) => <option key={count} value={count}>{count}개</option>)}
            </select>
          </label>
          <button type="button" onClick={exportJson}>JSON 내보내기</button>
          <button type="button" onClick={exportExcel}>Excel 내보내기</button>
          <button type="button" onClick={exportPng}>PNG 내보내기</button>
          <button type="button" onClick={exportPdf}>PDF 내보내기</button>
        </div>
      </div>

      <div className="editor-columns">
        <aside className="panel editor-sidebar">
          <h3>장면 목록</h3>
          <button type="button" className="scene-list-button active">{storyboardScene.sceneCode} · {storyboardScene.title}</button>
          {project.scenes.map((scene) => (
            <div className="mini-card" key={scene.id}>
              <strong>장면 {scene.sequence}. {scene.title}</strong>
              <p>{scene.beat}</p>
            </div>
          ))}

          <h3>프로젝트 에셋</h3>
          <div className="asset-list">
            {project.characters.map((character) => (
              <span key={character.id}>{character.name} · {character.role}</span>
            ))}
            {project.characters.length === 0 ? <span>등록된 캐릭터가 없습니다.</span> : null}
          </div>

          <h3>캐릭터 레퍼런스 이미지</h3>
          <label className="file-button character-upload">
            캐릭터 이미지 업로드
            <input type="file" accept="image/*" multiple onChange={(event) => {
              addCharacterReferenceImages(event.target.files);
              event.currentTarget.value = '';
            }} />
          </label>
          <div className="character-reference-list">
            {characterReferences.map((reference) => (
              <article className="character-reference-card" key={reference.id}>
                <div className="reference-thumbnail" role="img" aria-label={`${reference.name} 캐릭터 레퍼런스`} style={{ backgroundImage: `url(${reference.imageUrl})` }} />
                <label>
                  캐릭터 이름
                  <input value={reference.name} onChange={(event) => updateCharacterReference(reference.id, { name: event.target.value })} />
                </label>
                <label>
                  역할
                  <input value={reference.role} onChange={(event) => updateCharacterReference(reference.id, { role: event.target.value })} />
                </label>
                <label>
                  외형 노트
                  <textarea value={reference.appearanceNotes} onChange={(event) => updateCharacterReference(reference.id, { appearanceNotes: event.target.value })} rows={3} placeholder="머리, 의상, 분위기 등" />
                </label>
                <button type="button" className="danger-button small-button" onClick={() => deleteCharacterReference(reference)}>이미지 삭제</button>
              </article>
            ))}
            {characterReferences.length === 0 ? <p className="empty-copy">캐릭터 레퍼런스 이미지를 업로드하면 여기에 썸네일과 메모가 표시됩니다.</p> : null}
          </div>

          <h3>장소 레퍼런스</h3>
          <div className="asset-list">
            {locations.map((location) => <span key={location}>{location}</span>)}
          </div>
        </aside>

        <div className="contact-sheet-shell">
          <div className="contact-sheet" ref={sheetRef}>
            <header className="sheet-header">
              <div>
                <p>Storyboard Forge · 15초 고정</p>
                <h2>{storyboardScene.sceneCode} · {storyboardScene.title}</h2>
              </div>
              <div>
                <span>길이 00:15.000</span>
                <span>패널 {storyboardScene.panels.length}개</span>
              </div>
            </header>
            <div className={`storyboard-grid ${gridClass}`}>
              {storyboardScene.panels.map((panel) => (
                <button
                  className={`storyboard-panel-card ${selectedPanel.id === panel.id ? 'selected' : ''}`}
                  key={panel.id}
                  type="button"
                  onClick={() => selectPanel(panel.id)}
                >
                  <div className="panel-image" style={panel.imageUrl ? { backgroundImage: `url(${panel.imageUrl})` } : { background: createPlaceholderImage(panel.panelNumber) }}>
                    <span>#{String(panel.panelNumber).padStart(2, '0')}</span>
                  </div>
                  <div className="panel-copy">
                    <strong>{panel.timecodeLabel}</strong>
                    <span>{shotSizeKo[panel.shotSize]} · {cameraAngleKo[panel.cameraAngle]}</span>
                    <span>{cameraMovementKo[panel.cameraMovement]}</span>
                    <p>{panel.descriptionKo}</p>
                    <small>대사: {panel.dialogueKo || '없음'}</small>
                    <small>SFX: {panel.sfxKo || '없음'}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="panel panel-editor">
          <h3>패널 수정</h3>
          {selectedPanel ? (
            <div className="editor-form">
              <div className="image-preview" style={selectedPanel.imageUrl ? { backgroundImage: `url(${selectedPanel.imageUrl})` } : { background: createPlaceholderImage(selectedPanel.panelNumber) }}>
                <span>패널 {selectedPanel.panelNumber}</span>
              </div>
              <label className="file-button">
                이미지 교체
                <input type="file" accept="image/*" onChange={(event) => replaceImage(event.target.files?.[0])} />
              </label>
              <button type="button" onClick={() => setNotice('이미지 생성 API는 이후 연결 예정입니다.')}>선택 패널 재생성</button>
              <label>
                샷 사이즈
                <select value={selectedPanel.shotSize} onChange={(event) => updateSelectedPanel({ shotSize: event.target.value as ShotSize })}>
                  {shotSizes.map((shotSize) => <option key={shotSize} value={shotSize}>{shotSizeKo[shotSize]}</option>)}
                </select>
              </label>
              <label>
                카메라 앵글
                <select value={selectedPanel.cameraAngle} onChange={(event) => updateSelectedPanel({ cameraAngle: event.target.value as CameraAngle })}>
                  {cameraAngles.map((angle) => <option key={angle} value={angle}>{cameraAngleKo[angle]}</option>)}
                </select>
              </label>
              <label>
                카메라 움직임
                <select value={selectedPanel.cameraMovement} onChange={(event) => updateSelectedPanel({ cameraMovement: event.target.value as CameraMovement })}>
                  {cameraMovements.map((movement) => <option key={movement} value={movement}>{cameraMovementKo[movement]}</option>)}
                </select>
              </label>
              <label>
                한국어 장면 설명
                <textarea value={selectedPanel.descriptionKo} onChange={(event) => updateSelectedPanel({ descriptionKo: event.target.value })} rows={4} />
              </label>
              <label>
                대사
                <textarea value={selectedPanel.dialogueKo} onChange={(event) => updateSelectedPanel({ dialogueKo: event.target.value })} rows={2} />
              </label>
              <label>
                SFX
                <textarea value={selectedPanel.sfxKo} onChange={(event) => updateSelectedPanel({ sfxKo: event.target.value })} rows={2} />
              </label>
              <label>
                영어 이미지 프롬프트
                <textarea value={selectedPanel.imagePromptEn} onChange={(event) => updateSelectedPanel({ imagePromptEn: event.target.value })} rows={5} />
              </label>
              <label>
                캐릭터 레퍼런스
                <select
                  multiple
                  value={selectedPanel.characterRefs}
                  onChange={(event) => updateSelectedPanel({ characterRefs: Array.from(event.target.selectedOptions).map((option) => option.value) })}
                >
                  {characterReferenceOptions.map((character) => <option key={character.id} value={character.name}>{character.name} · {character.role}</option>)}
                </select>
              </label>
              <div className="selected-character-references">
                {selectedCharacterReferenceImages.map((reference) => (
                  <figure key={reference.id}>
                    <div className="reference-thumbnail" role="img" aria-label={`${reference.name} 선택된 캐릭터 레퍼런스`} style={{ backgroundImage: `url(${reference.imageUrl})` }} />
                    <figcaption>{reference.name}</figcaption>
                  </figure>
                ))}
                {selectedCharacterReferenceImages.length === 0 ? <p className="empty-copy">선택한 업로드 캐릭터 이미지가 없습니다.</p> : null}
              </div>
              <label>
                장소 레퍼런스
                <select value={selectedPanel.locationRef ?? ''} onChange={(event) => updateSelectedPanel({ locationRef: event.target.value })}>
                  {locations.map((location) => <option key={location} value={location}>{location}</option>)}
                </select>
              </label>
              <label>
                노트
                <textarea value={selectedPanel.notes ?? ''} onChange={(event) => updateSelectedPanel({ notes: event.target.value })} rows={2} />
              </label>
              <div className="editor-actions">
                <button type="button" onClick={() => setNotice('저장되었습니다.')}>저장</button>
                <button type="button" onClick={duplicatePanel}>패널 복제</button>
                <button type="button" className="danger-button" onClick={deletePanel}>패널 삭제</button>
              </div>
            </div>
          ) : <p>선택된 패널이 없습니다.</p>}
        </aside>
      </div>
    </section>
  );
}
