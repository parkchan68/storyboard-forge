import type { SceneTimingValidation, StoryboardPanel } from './storyboard-types';

export function formatTimecode(seconds: number) {
  const totalMs = Math.round(seconds * 1000);
  const sec = Math.floor(totalMs / 1000);
  const ms = totalMs % 1000;

  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  const mmm = String(ms).padStart(3, '0');

  return `${mm}:${ss}.${mmm}`;
}

export function generatePanelTimecodes(panelCount: number, durationSec = 15) {
  const panels = [];

  for (let i = 0; i < panelCount; i++) {
    const startSec = (durationSec * i) / panelCount;
    const endSec = (durationSec * (i + 1)) / panelCount;

    panels.push({
      panelNumber: i + 1,
      startSec,
      endSec,
      timecodeLabel: `${formatTimecode(startSec)} - ${formatTimecode(endSec)}`
    });
  }

  return panels;
}

function sameMs(a: number, b: number) {
  return Math.round(a * 1000) === Math.round(b * 1000);
}

export function validateSceneTiming(panels: Pick<StoryboardPanel, 'startSec' | 'endSec'>[], durationSec = 15): SceneTimingValidation {
  const warnings: string[] = [];

  if (!sameMs(durationSec, 15)) {
    warnings.push('장면 길이는 반드시 15초여야 합니다.');
  }

  if (panels.length === 0) {
    warnings.push('내보내기 전에 패널을 1개 이상 생성해야 합니다.');
    return { valid: false, warnings };
  }

  const sortedPanels = [...panels].sort((a, b) => a.startSec - b.startSec);
  const first = sortedPanels[0];
  const last = sortedPanels[sortedPanels.length - 1];

  if (!sameMs(first.startSec, 0)) {
    warnings.push('첫 번째 패널은 00:00.000에서 시작해야 합니다.');
  }

  if (!sameMs(last.endSec, durationSec)) {
    warnings.push('마지막 패널은 정확히 00:15.000에서 끝나야 합니다.');
  }

  sortedPanels.forEach((panel, index) => {
    if (panel.startSec < 0 || panel.endSec > durationSec || panel.endSec <= panel.startSec) {
      warnings.push(`${index + 1}번 패널의 타임코드가 15초 범위를 벗어났습니다.`);
    }

    const next = sortedPanels[index + 1];
    if (!next) return;

    if (next.startSec < panel.endSec && !sameMs(next.startSec, panel.endSec)) {
      warnings.push(`${index + 1}번 패널과 ${index + 2}번 패널 사이에 겹침이 있습니다.`);
    }

    if (next.startSec > panel.endSec && !sameMs(next.startSec, panel.endSec)) {
      warnings.push(`${index + 1}번 패널과 ${index + 2}번 패널 사이에 빈 구간이 있습니다.`);
    }
  });

  return { valid: warnings.length === 0, warnings };
}

export function recalculateTimecodesAfterReorder<T extends StoryboardPanel>(panels: T[], durationSec = 15): T[] {
  const timecodes = generatePanelTimecodes(panels.length, durationSec);

  return panels.map((panel, index) => ({
    ...panel,
    panelNumber: timecodes[index].panelNumber,
    startSec: timecodes[index].startSec,
    endSec: timecodes[index].endSec,
    timecodeLabel: timecodes[index].timecodeLabel
  }));
}
