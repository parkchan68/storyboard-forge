# Storyboard Forge / 스토리보드 포지

## 한국어 안내

Storyboard Forge는 **한국어 15초 고정 스토리보드 생성 및 편집 앱**입니다. 기존 프로젝트, 장면, 샷 리스트 MVP를 유지하면서 프로젝트별로 실제 스토리보드 에디터를 추가했습니다. 사용자는 6, 12, 15, 24개 패널 중 하나를 선택해도 전체 장면 길이를 항상 15초로 유지하며, 24패널 스토리보드는 각 패널이 0.625초씩 배치됩니다.

### 이 앱이 하는 일

- 프로젝트를 만들고 로그라인, 대상 관객, 스타일 가이드를 관리합니다.
- 장면, 샷, 캐릭터/에셋을 기존 데이터베이스 흐름으로 계속 관리합니다.
- 프로젝트 상세 화면에서 3열 스토리보드 편집기를 제공합니다.
  - 왼쪽: 장면 목록과 프로젝트 에셋
  - 가운데: 16:9 가로형 스토리보드 콘택트 시트
  - 오른쪽: 선택 패널 수정 패널
- `스토리보드 생성` 버튼으로 한국 고등학교 스릴러 샘플 **「새 학년, 첫날」 / SCENE 01**을 생성합니다.
- 24개 패널을 `00:00.000`부터 `00:15.000`까지 정확히 분배합니다.
- 패널별 이미지 교체, 샷 사이즈, 카메라 앵글, 카메라 움직임, 한국어 설명, 대사, SFX, 영어 이미지 프롬프트, 캐릭터/장소 레퍼런스, 노트를 편집합니다.
- JSON, Excel XLSX, PNG, PDF 내보내기를 제공합니다.

### 설치 방법

권장 환경:

- Node.js 20 이상
- npm 10 이상

```bash
npm install
```

### Windows PowerShell 설정

이전 `cp -n` 기반 설정은 Windows PowerShell에서 실패할 수 있었습니다. 이제 `scripts/setup.mjs`가 `.env.example`을 `.env`로 복사하고 Prisma 작업을 실행합니다.

```powershell
npm run setup
```

`npm run setup`이 수행하는 작업:

1. `npm install`
2. `.env`가 없고 `.env.example`이 있으면 `.env` 생성
3. `npm run prisma:generate`
4. `npm run db:push`
5. `npm run db:seed`

### 로컬 실행

```bash
npm run dev
```

브라우저에서 <http://localhost:3000>을 엽니다.

### Prisma SQLite 설정

기본 환경 파일:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_NAME="Storyboard Forge"
```

SQLite 파일은 Prisma 기준 경로에 따라 `prisma/dev.db`로 생성됩니다.

수동 설정:

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

### 스토리보드 편집기 사용법

1. 홈에서 `프로젝트 만들기`를 완료합니다.
2. 프로젝트 상세 화면으로 이동합니다.
3. `스토리보드 생성`을 누르면 24패널, 15초 고정 샘플 장면이 생성됩니다.
4. 가운데 콘택트 시트에서 패널을 클릭합니다.
5. 오른쪽 `패널 수정`에서 이미지, 샷 사이즈, 카메라 앵글, 움직임, 설명, 대사, SFX, 프롬프트를 수정합니다.
6. 수정 내용은 콘택트 시트에 즉시 반영됩니다.
7. `선택 패널 재생성`은 현재 목업 버튼이며 “이미지 생성 API는 이후 연결 예정입니다.” 메시지를 표시합니다.

### 내보내기

내보내기 전 다음 검증이 실행됩니다.

- 장면 길이는 정확히 15초입니다.
- 첫 패널은 `00:00.000`에서 시작합니다.
- 마지막 패널은 `00:15.000`에서 끝납니다.
- 패널 사이에 빈 구간이 없습니다.
- 패널 사이에 겹침이 없습니다.
- 패널별 필수 편집 필드가 존재합니다.

지원 형식:

- `JSON 내보내기`: 프로젝트와 스토리보드 전체 데이터
- `Excel 내보내기`: XLSX 파일, 패널 번호/씬 코드/타임코드/샷 정보/설명/대사/SFX/프롬프트/레퍼런스/노트 포함
- `PNG 내보내기`: 스토리보드 콘택트 시트 이미지
- `PDF 내보내기`: 브라우저 인쇄를 사용한 가로형 PDF

### 알려진 제한 사항

- 스토리보드 데이터는 현재 브라우저 상태 기반 목업이며 Prisma 모델에 영구 저장되지는 않습니다.
- 이미지 생성 API는 아직 연결되지 않았습니다.
- PNG 내보내기는 브라우저 Canvas로 콘택트 시트 데이터를 그리는 방식입니다.
- PDF 내보내기는 브라우저의 인쇄/저장 기능을 사용합니다.
- 패널 드래그 앤 드롭 재정렬은 아직 없습니다.
- 인증/권한 기능은 없습니다.
- SQLite는 로컬 MVP에 적합하며 다중 사용자 운영 환경에는 별도 DB 전환이 필요합니다.

### 향후 API 연동 지점

- `src/app/projects/[id]/storyboard-editor.tsx`의 `선택 패널 재생성` 버튼에 이미지 생성 API 연결
- 패널 이미지 업로드를 로컬 base64 대신 파일 스토리지/S3/R2로 교체
- `StoryboardScene`과 `StoryboardPanel`을 Prisma 모델로 추가해 영구 저장
- 생성 프롬프트를 서버 액션 또는 API Route로 이동
- 장면/패널 생성 로직에 LLM 기반 구조화 출력 연결

### 개발자 인수인계 노트

- `src/lib/timecode.ts`는 15초 고정 타임코드 생성, 포맷, 검증, 재계산의 단일 기준입니다.
- `src/lib/storyboard-types.ts`는 스토리보드 타입, 샷 사이즈/카메라 옵션, 한국어 라벨을 제공합니다.
- `src/lib/mock-storyboard.ts`는 한국 고등학교 스릴러 24패널 목업 데이터를 생성합니다.
- `src/app/projects/[id]/storyboard-editor.tsx`는 3열 에디터, 패널 편집, 업로드, 검증, 내보내기를 담당하는 클라이언트 컴포넌트입니다.
- `src/lib/actions.ts`와 기존 Prisma 모델은 프로젝트/장면/샷/캐릭터 MVP 흐름을 유지합니다.
- Prisma는 안정성을 위해 `prisma`와 `@prisma/client`를 `6.19.0`으로 고정했습니다.

### TODO

- 스토리보드 장면/패널 Prisma 영구 저장 모델 추가
- 실제 이미지 생성 API 연결
- 패널 재정렬 UI와 `recalculateTimecodesAfterReorder` 연결 강화
- 이미지 파일 스토리지 연결
- 장면별 다중 스토리보드 관리
- Zod 등으로 서버/클라이언트 검증 강화
- Playwright 기반 내보내기/편집 E2E 테스트 추가
- 다국어 라벨 관리 파일 분리

---

## English Guide

Storyboard Forge is now a **Korean 15-second storyboard generation and editing app**. It preserves the original project, scene, shot-list, and character MVP while adding a real project-level storyboard editor.

### What this app does

- Creates and manages projects with logline, audience, style guide, and status.
- Keeps the existing scene, shot, and character database workflows.
- Adds a three-column storyboard editor on each project page.
  - Left: scene list and project assets
  - Center: professional 16:9 storyboard contact sheet
  - Right: selected panel editor
- Generates a mock Korean high-school thriller storyboard titled **“새 학년, 첫날” / SCENE 01**.
- Keeps every generated storyboard scene exactly 15 seconds, regardless of panel count.
- Supports 6, 12, 15, and 24 panel options. A 24-panel scene uses 0.625 seconds per panel and ends at exactly `00:15.000`.
- Supports JSON, XLSX, PNG, and print-friendly PDF export.

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open <http://localhost:3000>.

### Windows PowerShell setup

Use the cross-platform setup script:

```powershell
npm run setup
```

The setup script copies `.env.example` to `.env` only when `.env` does not already exist, then runs Prisma generate, DB push, and seed.

### Prisma SQLite setup

Default `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_NAME="Storyboard Forge"
```

Manual Prisma commands:

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

### How to use the storyboard editor

1. Create or open a project.
2. Click `스토리보드 생성` to generate the 24-panel Korean thriller sample.
3. Click a panel in the contact sheet.
4. Edit the selected panel on the right: image, shot size, camera angle, movement, Korean description, dialogue, SFX, English image prompt, character references, location, and notes.
5. The contact sheet updates immediately.
6. Use the export buttons after validation passes.

### Export

- JSON: complete project and storyboard data
- Excel XLSX: production-friendly tabular panel data
- PNG: generated storyboard sheet image
- PDF: browser print dialog in landscape layout

### Known limitations

- Storyboard data is currently client-side mock/editor state and is not persisted in Prisma.
- AI image generation is not connected yet.
- The regenerate button is a Korean placeholder message.
- PDF export uses the browser print dialog.
- No authentication, authorization, or multi-user collaboration yet.

### Future API integration points

- Connect the regenerate selected image button to an image generation API.
- Persist `StoryboardScene` and `StoryboardPanel` in Prisma.
- Move mock generation into a server action/API route with structured LLM output.
- Replace base64 uploads with file storage.
- Add automated visual export tests.

### Developer handoff notes

- Timecode rules live in `src/lib/timecode.ts`.
- Storyboard types and Korean labels live in `src/lib/storyboard-types.ts`.
- Mock 24-panel content lives in `src/lib/mock-storyboard.ts`.
- The client editor lives in `src/app/projects/[id]/storyboard-editor.tsx`.
- Cross-platform setup lives in `scripts/setup.mjs`.
- Prisma and Prisma Client are pinned to `6.19.0` for MVP stability.

### TODO

- Add Prisma persistence for storyboard scenes and panels.
- Add real image generation.
- Add drag-and-drop panel reordering.
- Add cloud/local image storage.
- Add stricter schema validation.
- Add Playwright and unit tests for timecode/export workflows.
