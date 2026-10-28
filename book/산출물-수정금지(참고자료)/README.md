# 전화영어 교재 뷰어 · 매거진형 — 작업 규칙

경로는 모두 `book/` 기준.

## 1. 폴더

```
book/
├─ inc/        HTML 조각 (magazine-header · magazine-body · magazine-dock · magazine-cover)
├─ css/        tokens → base → components → magazine → parts  (이 순서로 읽음)
├─ js/         core → parts → magazine                          (이 순서로 읽음)
├─ data/       lesson-NN.json  레슨 데이터 = API 응답 형식
├─ images/     lesson-photoN.jpg
├─ magazine.src.html · build.py   조립 원본 · 빌드
├─ magazine.html                   build.py 결과 (css/ js/ images/ 참조)
└─ 산출물-수정금지(참고자료)/       단일 파일 3종(purple · coral · green) · 이 문서
```

| 파일 | 범위 | 공용 여부 |
|---|---|---|
| css/tokens.css | 색 · 글자 · 간격 · 반경 · 그림자 변수, 웹폰트, 컬러 테마 | 공용 |
| css/base.css | 리셋 · 기본값 · 동작 줄이기 | 공용 |
| css/components.css | .icon-btn .chip .badge .tag .box .glass-btn .bar-btn .toast | 공용 |
| css/parts.css | 파트 본문 12유형 | 공용 |
| css/magazine.css | 헤더 · 히어로 · 하단 바 · 파트 목록 · 표지 · 강사 가이드 박스 | 매거진형 전용 |
| js/core.js | Book 네임스페이스 · 유틸 · 아이콘 · 토스트 · 레슨 사진 · Book.set · 자간 | 공용 |
| js/parts.js | 파트 템플릿 · 항목 동작 · 보기 설정 적용 | 공용 |
| js/magazine.js | 시작 · 보기 설정 유지 · 이동 · 표지 · 파트 목록 · 히어로 접힘 · 스와이프 | 매거진형 전용 |

리더형으로 바꿀 때는 `magazine.css` · `magazine.js` · `inc/magazine-*`만 교체한다. 공용 파일은 그대로 쓴다.

## 2. 공통 규칙 (AI · 디자이너 · 개발자)

1. 수정은 `inc/ css/ js/ data/ magazine.src.html`에서만 한다. `magazine.html`과 `산출물-수정금지(참고자료)/`는 `python3 build.py`로만 만든다.
2. 색 · 글자 크기 · 반경 · 간격은 `tokens.css` 변수만 쓴다. 다른 파일에 색 코드(#hex)를 직접 쓰지 않는다. 새 색은 `tokens.css`에 변수로 먼저 추가한다. 예외: 사진 · 글래스 버튼 위 반투명 rgba.
3. 컬러는 3종. 기본 purple, `<html data-palette="coral">`, `<html data-palette="green">`. 테마는 `--brand-*` 값만 바꾼다.
4. 글자 크기는 11 · 12 · 13 · 14 · 16 · 18 · 20 · 22 · 28만 쓴다. 예외: 히어로 · 표지 제목 34. 소수점 크기 금지.
5. 굵기는 400 · 500 · 600 · 700 · 800. 11–12px 글자에 800 금지.
6. 서체는 `--font` 한 벌(Plus Jakarta Sans + Pretendard). 자간은 `core.js`가 넣으므로 CSS에 letter-spacing을 쓰지 않는다(+ 자간 라벨만 예외).
7. 클래스: 공용 컴포넌트는 접두어 없음, 교재 전용은 `book-` 접두어. 상태는 `is-open · is-on · is-active · is-playing · is-show · is-current · is-done`, 보이기/숨기기는 `hidden` 속성.
8. 화면 폭: 모바일 기준, 640px 이상 태블릿(본문 760px 칼럼). PC는 태블릿과 같다. 미디어 쿼리는 `min-width: 640px` 하나만 쓴다.
9. 아이콘은 `core.js` ICON_PATHS에만 추가하고 `data-icon="이름"`으로 넣는다. 24×24, 선 2px.
10. 버튼은 둥근 사각형(`--radius-12`). 원형 · 알약은 배지와 표지 과정명 라벨만.
11. 하단 바 버튼은 호버 시 면 없이 색만 바뀐다. 켜진 토글만 연한 면(`--brand-subtle`)을 쓴다.

## 3. 동작 규칙

| 항목 | 규칙 |
|---|---|
| 보기 설정(가이드 · 번역 · 강사 가이드) | 하단 바에서 켜면 파트를 넘겨도 켜진 채 유지된다. 사용자가 다시 눌러 끌 때만 꺼진다. 켜고 끌 때 토스트로 이름을 알린다 |
| 강사 가이드 | 강사 계정(`data-teacher`)에만 버튼이 보인다. 켜면 각 파트 본문 맨 위에 박스가 나오고, 박스가 화면 위로 지나가 있으면 보이도록 스크롤한다. 강사님이 직접 끌 때까지 모든 파트에서 유지 |
| 항목별 아이콘 | 번역 · 듣기 · 답변 가이드는 항목마다 따로 켜고 끌 수 있다. 하단 바 설정이 바뀌면 그 파트의 항목 전체에 다시 적용된다 |
| 히어로 | 스크롤하면 300px(태블릿 320px) 사진이 56px 띠로 접힌다. 짧은 파트도 띠가 다 접힐 만큼은 스크롤된다 |
| 이동 | 하단 바 ‹ ›, 파트 목록, 표지 목차, 모바일 좌우 스와이프(60px 이상). 마지막 파트의 › 는 ✓(학습 완료) |
| 듣기 | 현재는 1.8초 재생 표시만 한다. `parts.js` play()를 실제 오디오 재생 시간에 맞춰 교체 |

## 4. 레슨 사진

- 파일 이름: `images/lesson-photo1.jpg`, `lesson-photo2.jpg` … (숫자는 1부터, 0 채우기 없음)
- 크기: 1280×800 이상 JPG, 150KB 안팎. 히어로는 세로 40% 지점, 표지는 위쪽 기준으로 잘리므로 주요 피사체는 가운데 위쪽에 둔다.
- 사진 선택 순서 (`core.js` Book.photoUrl):
  1. `lesson.photo` — 레슨 고정 사진
  2. `course.photo` — 강좌 고정 사진
  3. `Book.PHOTO.mode` 규칙
     - `"sequence"`(기본): 레슨 번호 순서로 1 → count 반복. 같은 레슨은 항상 같은 사진, 이웃 레슨은 다른 사진
     - `"random"`: 열 때마다 무작위
- 사진을 추가하면 `Book.PHOTO.count`만 바꾼다. 레슨 수가 사진 수보다 많으면 처음부터 다시 돈다.
- 사진을 못 읽으면 `data-photo`가 빠지고 브랜드 그라데이션으로 보인다.
- 경로는 JS에서 절대 URL로 바꿔 `--lesson-photo`에 넣는다. CSS 변수 안 상대 경로는 `css/` 기준으로 풀리므로 직접 상대 경로를 넣지 않는다.
- 본문 그림(Part 10 · 12): `picture.src`가 있으면 그 사진(`<img>`), 없으면 레슨 사진을 쓴다.

## 5. 데이터 (`data/lesson-NN.json`)

```
course   { label, title, titleEn, desc, photo }   표지
lesson   { number, photo }                        현재 레슨
lessons  [ { title, desc } ]                      표지 레슨 목차 (현재 레슨만 파트 목차 펼침)
parts    [ { type, title, desc, teacher, ... } ]  파트 12개, type별 필드는 parts.js RENDER 참고
```

- `type`: words · qa · drills · patterns · topics · dialogue · expressions · phrases · reading · describe · respond · survey
- `teacher`: 강사 가이드 문구. 모든 파트에 필수
- 빈칸 문장은 `( )` 자리가 밑줄로 바뀐다

## 6. 앱 연동

| 호출 | 동작 |
|---|---|
| `window.BOOK_DATA` | 레슨 데이터. `core.js`보다 먼저 넣는다 |
| `Book.go(n)` | 파트 이동 (1–12) |
| `Book.set("palette", "coral")` | 컬러 변경. `""` = purple |
| `Book.set("teacher", true)` | 강사 계정 |
| `Book.set("photo", false)` | 레슨 사진 끄기 |
| `postMessage({ type: "review", key, value })` | `Book.set`과 같다 (iframe · WebView) |
