# 전화영어 교재 뷰어 (Daily Life · Lesson 01)

매거진형 · 리더형 2종 × 컬러 3종(purple · coral · green). 운영팀 선호는 매거진형, 법인팀 회신 대기 중(2026-10-28).

## 폴더
```
book/
├─ src/        book-magazine.html · book-reader.html   ← 수정은 여기서
├─ assets/     lesson-photo.jpg · pretendard-kr-subset.woff2
├─ dist/       배포용 단일 HTML 6개 (build.py 결과, 직접 수정 X)
├─ build.py    python3 build.py → dist/ 다시 생성
└─ _이전시안/   검토 단계 파일 (index_v5 ~ v7, v66, v666 등)
```
- 화면 확인은 `dist/` 파일을 브라우저로 열면 됩니다. 모바일 기준, 640px 이상은 태블릿 레이아웃(PC = 태블릿).

## 두 형태의 차이 — 본문은 같고 화면 틀만 다릅니다
| 영역 | 매거진형 · 리더형 |
|---|---|
| JS 1 Content · 3 Templates (레슨 데이터, 12개 파트 템플릿) | 같음 |
| CSS 7 Parts (파트 본문) | 거의 같음 (번호 표시 · 강사 가이드 톤만 다름) |
| CSS 2 Tokens · 3 Themes | 같은 토큰 이름, 컬러 값 동일 |
| CSS 6 Shell · HTML 틀 · JS 4 App 일부 (헤더 · 하단 · 표지 · 파트 목록) | 다름 |

개발 시 **본문(Content · Templates · Parts)은 공통 모듈, 화면 틀(Shell)은 교체 가능한 단위**로 나눠 주세요. 그러면 나중에 형태를 바꿔도 Shell만 교체하면 됩니다.

## 컬러
- 기본(속성 없음) = purple. `<html data-palette="coral">` · `<html data-palette="green">`
- 색은 `--brand-*` 토큰으로만 사용 (하드코딩 금지). 언어(영어 · 중국어 · 일본어) ↔ 컬러 배정은 미정

| | 그라데이션 | interactive |
|---|---|---|
| purple | #2373f4 → #6d68e4 → #915dd2 → #c04695 | #6d68e4 |
| coral | #973479 → #f06445 → #dce8a5 | #f06445 |
| green | #00a283 → #5ed83d → #b5ee62 | #0faa78 |

## 앱 연동
- `Book.go(n)` 파트 이동(1~12)
- `Book.set(key, value)` — `palette`(coral · green · 빈 값=purple), `teacher`(강사 계정), `photo`(매거진형만, 레슨 사진)
- iframe/WebView: `postMessage({ type: "review", key, value })` 도 같은 동작
- 가이드 · 번역 · 강사 가이드 켠 상태는 다음 파트로 이어집니다
- 듣기 버튼은 1.8초 표시만 함 → 실제 오디오 재생 시간으로 교체 필요 (`play()`)

## 코드 규칙
- CSS: 1 Fonts · 2 Tokens · 3 Themes · 4 Base · 5 Components · 6 Shell · 7 Parts · 8 Tablet(≥640) · 9 Motion
- JS: 1 Content · 2 Icons · 3 Templates · 4 App
- 클래스: 공통 `.icon-btn .chip .badge .tag .box .toast`, 교재 전용 `book-` 접두어
- 상태: `is-open / is-on / is-active / is-playing / is-show`, 표시 여부는 `hidden` 속성
- 서체: Plus Jakarta Sans(영문) + Pretendard(한글, 서브셋 내장). 자간은 JS `fitLetterSpacing`이 한글/영문을 나눠 적용
- 글자 크기: 11 · 12 · 13 · 14 · 16 · 18 · 20 · 22 · 28 (예외: 히어로 · 표지 타이틀)

## 남은 확인
- 리더형 표지 'Level 1' 표기
- 언어별 컬러 배정
- 형태 확정 후: 피그마 정리 · 디자인시스템 · 컴포넌트 문서
