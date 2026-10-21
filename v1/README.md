# 전화영어 클래스룸 · 시안4(와옹이) — 개발 전달본

## 파일 구성

| 경로 | 내용 |
|---|---|
| `classroom.html` | 화면 마크업 (클래스룸 · 스케줄 · 팝업 · 네이티브 화면 전체) |
| `css/variables.css` | 디자인 토큰 (`:root` 변수 — 색·타이포·간격·라운드·그림자). 디자인 수정은 우선 여기서 |
| `css/font.css` | 웹폰트 로드 (Pretendard · Plus Jakarta Sans) |
| `css/reset.css` | 리셋·기본 태그 스타일 |
| `css/common.css` | 공통 컴포넌트 — 헤더·탭·버튼·칩·아이콘 버튼·모달/다이얼로그/바텀시트 셸·토스트·하단 내비 |
| `css/classroom.css` | 클래스룸 화면 |
| `css/schedule.css` | 스케줄·연기/보강·수업 루틴 변경 |
| `css/popup.css` | 기능 팝업 (학습 질문·만족도·수업 리뷰·Class Report·출석·AI 히스토리·수업환경·마이크/발음·레슨 시트·공지) |
| `css/native.css` | 네이티브 화면 (수업 콜·푸시·스플래시·권한 안내) |
| `css/motion.css` | 인터랙션·애니메이션 |
| `css/sian4.css` | 시안4 레이아웃·와옹이 캐릭터 (위 파일을 덮어쓰므로 마지막에 로드) |
| `js/classroom.js` | 공통 기능 — 탭, 스케줄, 팝업, 연기/보강, 루틴 변경 등 |
| `js/classroom-s4.js` | 시안4 레이아웃 · 와옹이 캐릭터 배치 (상단 `window.S3C`에 이미지 맵) |
| `js/screen-states.js` | **화면 목록 전용**. `?screen=번호`로 특정 상태를 재현. 실서비스에는 넣지 않음 |
| `screens.html` | 69개 화면 목록 (HTML 미리보기 + Figma 프레임 링크) |
| `images/` | 와옹이 `wawong-N.png`, 로고, 강사 아바타, 푸시 아이콘 |

CSS는 `classroom.html`에 적힌 순서대로 로드해야 합니다(뒤 파일이 앞 파일을 덮어씀).
스크립트 순서: `classroom.js` → `classroom-s4.js` → (선택) `screen-states.js`

## 이미지

- 와옹이: `images/wawong-N.png` (최대 360px, 2배 해상도 기준으로 정리). 교체는 `js/classroom-s4.js` 상단 `window.S3C` 한 곳만 수정하면 됨.
- 사용 번호: 1–16, 18–27, 29–32 (17·28 없음). `wawong-23` = 월간 리포트 UP 와옹이.
- 강좌 이미지: 서버 경로(`upsisa.ybmsisa.com/.../product/info/*.jpg`)에서 직접 로드. 표시 비율 288:207 고정(`aspect-ratio`).
- 폰트: Pretendard Variable CDN(jsdelivr v1.3.9).

## 정리 내역 (10/19)

- 화면에 쓰이지 않던 2안 예습 카드(`#prepCard`)·월간 Class Report 버튼 제거, 예습 로드맵(`#prepBlock`)은 JS 주입 → HTML 정적 마크업
- 미사용 CSS 규칙 제거(다크 테마·구 컴포넌트 등). 재생 중·오류·빈 상태·열림 같은 **상태 스타일은 JS가 붙이는 클래스라 유지**
- 검증: 코드 정리 전후 69개 화면 캡처 비교, CSS 분리 전후 69개 화면 × 390/820px 계산된 스타일 비교 — 차이 없음(애니메이션 타이밍 제외)

## 동작 메모

- 월간 리포트 카드의 와옹이는 클릭되지 않음 (`pointer-events:none`).
- 수강 중 2번 강좌: 예습하기 1개만 노출, 주니어 첨삭 미노출 (`data-prep`로 제어).
- 월간 스케줄 TODAY 버튼: 현재 월로 부드럽게 스크롤.
- 데모 데이터(날짜·강좌명·강사 등)는 하드코딩 상태 — API 연동 시 교체 대상.

## Figma

파일 `20GzBZGgraOkwqRb5iLsDM` · 페이지 「시안4 · 화면(와옹)」 — 69개 프레임. `screens.html`에서 화면별 Figma 링크로 이동 가능.
