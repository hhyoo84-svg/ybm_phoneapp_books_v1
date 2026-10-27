# 전화영어 클래스룸 · 시안4(와옹이) — 개발 전달본 v2

클래스룸·스케줄·팝업 화면을 영역별 HTML 조각(`inc/`)과 CSS·JS 파일로 나눈 전달본입니다.
이 문서의 경로는 모두 `v2/` 폴더 기준입니다.

- **기본 앱**: 조각을 모두 조립해서 씁니다.
- **B2B·B2C 웹**: 앱 전용 조각(헤더·하단 내비·네이티브)과 `shell.css`를 빼고 필요한 조각만 인클루드합니다.

---

## 1. 먼저 볼 파일

| 파일 | 용도 |
|---|---|
| `screens-list.html` | **화면 목록 (Screen Index)**. 85개 화면마다 기획안 ID·페이지, Figma 링크, 구현 파일을 함께 표시 |
| `app.html` | 전체 조립본. 더블클릭으로 열림. `app.html?screen=번호`로 특정 화면 상태 재현 |

**`산출물-수정금지(참고자료)/`** — 확인용 산출물입니다. 파일 하나만으로 열리며(CSS·JS·이미지 내장), 개발 작업은 위의 나눠진 파일 기준으로 해 주세요.

| 파일 | 용도 |
|---|---|
| `DesignSystem.html` | 디자인 시스템 문서. 색·글자·간격·아이콘·와옹이·컴포넌트 19종 (Figma 「Design System」 페이지와 같은 내용) |
| `phone-ybmclass.html` | 앱 화면 단일 파일. `app.html`과 같은 화면 |
| `README.md` | 이 문서 |

---

## 2. 폴더 구성

```
v2/
├─ inc/                 HTML 조각
│  ├─ shell-head.html   앱 상단 (로고·타이틀·과정 안내·설정) + 클래스룸 탭      [앱 전용]
│  ├─ classroom.html    클래스룸 (#scrollArea 수강중 · #upcomingArea 예정 · #doneArea 종료)
│  ├─ schedule.html     스케줄 (#scheduleArea)
│  ├─ shell-nav.html    하단 내비 (클래스룸 / 스케줄)                          [앱 전용]
│  ├─ popups.html       공통 팝업 전체 (기본 hidden, JS로 열림)
│  ├─ native.html       수업 콜·푸시·스플래시·공지·권한 — 화면 기준용, 실서비스는 네이티브 구현 [앱 전용]
│  └─ settings.html     설정(네이티브 기준) + 약관·개인정보·탈퇴·로그인 웹뷰 자리               [앱 전용]
├─ css/
│  ├─ tokens.css        디자인 토큰 + 웹폰트. 브랜드 테마는 이 파일만 교체
│  ├─ base.css          리셋 · 기본값
│  ├─ components.css    공통 컴포넌트 (버튼·칩·탭·세그먼트·와옹이·인터랙션)
│  ├─ shell.css         앱 셸 (화면 높이 고정·헤더·탭·하단 내비·네이티브)        [앱 전용]
│  ├─ classroom.css · schedule.css · popup.css   영역별 화면
│  └─ settings.css      설정 · 웹뷰 자리                                         [앱 전용]
├─ js/
│  ├─ core.js           공통 (블록 등록·실행, 데모 데이터, 와옹이 이미지 맵 window.S3C, 인터랙션)
│  ├─ classroom.js · schedule.js · popup.js     영역별 동작
│  ├─ shell.js          수업 콜·푸시·스플래시·공지·권한                         [앱 전용]
│  ├─ settings.js       설정 · 웹뷰 · 로그아웃                                   [앱 전용]
│  └─ demo/screen-states.js   ?screen=번호 상태 재현 — 실서비스에 넣지 않음
├─ data/demo.json       데모 데이터 24종 — API 응답으로 교체 대상
├─ images/              와옹이 wawong-N.png, 로고, 강사 아바타, 푸시 아이콘
├─ app.src.html · build.py   조립 원본과 빌드 스크립트 (app.html · phone-ybmclass.html 생성)
├─ app.html · screens-list.html
└─ 산출물-수정금지(참고자료)/   DesignSystem.html · phone-ybmclass.html · README.md
```

---

## 3. 조립 방법

```html
<!-- CSS : 순서 유지 (필요 없는 영역 파일은 빼도 됨) -->
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/shell.css">        <!-- 앱 전용 -->
<link rel="stylesheet" href="css/classroom.css">
<link rel="stylesheet" href="css/schedule.css">
<link rel="stylesheet" href="css/popup.css">
<link rel="stylesheet" href="css/settings.css">     <!-- 앱 전용 -->

<div class="stage">
  <!--#include virtual="/inc/shell-head.html"-->     <!-- 앱 전용 -->
  <!--#include virtual="/inc/classroom.html"-->
  <!--#include virtual="/inc/schedule.html"-->
  <!--#include virtual="/inc/shell-nav.html"-->      <!-- 앱 전용 -->
  <!--#include virtual="/inc/popups.html"-->
  <!--#include virtual="/inc/settings.html"-->      <!-- 앱 전용 -->
</div>
<!--#include virtual="/inc/native.html"-->           <!-- 앱 전용 -->

<script>window.YBMP_DEMO = { /* 실서비스: 서버 데이터 */ };</script>
<script src="js/core.js"></script>
<script src="js/classroom.js"></script>
<script src="js/schedule.js"></script>
<script src="js/popup.js"></script>
<script src="js/shell.js"></script>                   <!-- 앱 전용 -->
<script src="js/settings.js"></script>                <!-- 앱 전용 -->
<script>YBMP.boot();</script>
```

**JS 실행 순서** — 각 파일은 `YBMP.add(순번, 이름, 함수)`로 블록을 등록만 하고, `YBMP.boot()`가 순번대로 실행합니다. 파일 로드 순서와 무관하게 같은 순서로 동작하니 **순번은 바꾸지 마세요.**

---

## 4. 개발 시 유의사항

### 구조
- **조각은 페이지당 한 번만 인클루드** — `popups.html`에만 id가 200개 가까이 있고, JS가 id로 요소를 찾습니다. 같은 조각을 두 번 넣으면 동작이 꼬입니다.
- **일부 영역만 쓸 때는 해당 JS 파일도 뺄 것** — 없는 영역의 블록은 오류가 나도 다른 블록은 계속 돌지만, 콘솔에 `[YBMP] 블록이름` 오류가 남습니다.
- **`app.html`, `phone-ybmclass.html`은 생성 파일** — 직접 고치지 말고 `inc/`, `app.src.html`, `data/demo.json`을 고친 뒤 `python3 build.py`로 다시 만듭니다. (`phone-ybmclass.html`은 Pillow가 있을 때만 함께 생성 — `pip install pillow`)
- **CSS 영역 경계** — 단독 사용 시 깨지지 않도록 영역 간 덮어쓰기 규칙은 `components.css`·`base.css`로 옮겨 두었습니다. 파일 안의 `(from v1 xxx.css)` 표시는 원래 위치입니다.

### 앱 웹뷰
- **화면 높이 고정은 `shell.css`에만 있습니다** (`html`·`body`·`.stage` = `100dvh`, `.scroll-area` 내부 스크롤). 웹에 넣을 때 `shell.css`를 빼면 문서 흐름대로 표시됩니다.
- **`100dvh`** — iOS 15.4 / Android Chrome 108 미만 웹뷰는 지원하지 않습니다. 지원 범위가 더 낮다면 `100vh` 대체값이 필요합니다.
- **안전 영역** — `env(safe-area-inset-*)`를 쓰므로 웹뷰에서 `viewport-fit=cover`가 적용돼야 노치·홈 인디케이터 여백이 맞습니다.
- **애니메이션** — 기기에서 '동작 줄이기'(iOS)·'애니메이션 제거'(Android)가 켜져 있으면 `prefers-reduced-motion`에 따라 등장·캐릭터 애니메이션이 꺼집니다. 의도된 동작입니다.

### 설정 · 웹뷰 (70~79)
- **설정은 네이티브 구현 기준 시안**입니다. 토글 값 저장, OS 알림 권한 이동, 스토어 이동, 로그아웃 처리는 앱에서 구현합니다.
- **이용약관 · 개인정보처리방침 · 회원탈퇴 · 로그인은 기존 웹페이지(W2)** 입니다. 이용약관 · 개인정보처리방침 · 로그인은 실제 페이지를 웹뷰(iframe)로 띄우고, 회원탈퇴는 주소가 정해지지 않아 점선 자리 표시입니다. 앱은 헤더(뒤로가기 + 제목)만 그리며, 로그인은 헤더 없이 전체 화면입니다. 주소는 `js/settings.js`의 `WEB` · `LOGIN_URL`에 있습니다.
- 로그인 화면 아래 **"시안 확인용 · 클래스룸으로" 버튼은 시안 전용**입니다(실서비스에서는 빼 주세요).
- 확인 팝업은 공통 다이얼로그(`window.scDlgOpen`)를 씁니다. 와옹이 이미지는 `js/core.js`의 다이얼로그 제목 맵에서 정합니다.

### 추가 상태 화면 (80~85)
- 이미 구현돼 있던 상태에 화면 번호만 붙였습니다 — 만족도 이미 참여(80), 전화번호 형식 오류(81), 월간 +N(82), 안내사항(83), 예습 완료 독려 문구(84), 주니어 첨삭 진입(85). Figma 프레임은 없습니다.
- 아직 시안이 없는 화면과 범위 밖 항목은 `screens-list.html` 왼쪽 아래 목록에 정리돼 있습니다.

### 웹(B2B·B2C) 삽입
- **팝업은 `position:fixed`** — 사이트 헤더·GNB의 `z-index`와 겹치지 않는지 확인해 주세요.
- **인코딩** — 모든 파일은 UTF-8입니다. ASP 페이지가 EUC-KR(코드페이지 949)이면 한글이 깨지니 변환하거나 코드페이지를 맞춰 주세요.
- 검증 범위: `classroom` + `popups` 조합을 사이트 헤더 아래에 넣어 표시와 팝업 열림까지 확인했습니다.

### 데이터 · 외부 리소스
- **데모 데이터는 오늘 날짜 기준으로 계산됩니다** (스케줄·출석·레슨 순번). 실서비스에서는 `data/demo.json` 구조 그대로 서버 데이터를 넣어 주세요.
- **폰트는 외부 CDN** — Pretendard(jsdelivr), Plus Jakarta Sans(Google Fonts)를 `tokens.css`에서 `@import`합니다. 사내망·오프라인 환경이 있으면 자체 호스팅을 권장합니다.
- **강좌 이미지**는 서버 경로(`upsisa.ybmsisa.com/.../product/info/*.jpg`)에서 직접 불러옵니다.
- **와옹이 이미지 교체**는 `js/core.js`의 `window.S3C` 한 곳만 수정하면 됩니다.
- **접근성** — 아이콘만 있는 버튼의 `aria-label`은 지우지 마세요.


---

## 5. Figma

파일 `20GzBZGgraOkwqRb5iLsDM`

| 페이지 | 내용 |
|---|---|
| Design System | 파운데이션·컴포넌트 문서 (`DesignSystem.html`과 같은 내용) |
| Component | 컴포넌트 원본 (`Purple DS`). **삭제·이동 금지 — 화면과 문서가 모두 이 원본을 참조** |
| 시안 · 화면 | 01~79 화면 (프레임 번호 = `screens-list.html` 번호). 80~85는 Figma 프레임 없음 |
| 캐릭터 | 와옹이 원본 |

텍스트는 `Phone/` 텍스트 스타일(Pretendard)로 통일되어 있습니다.
