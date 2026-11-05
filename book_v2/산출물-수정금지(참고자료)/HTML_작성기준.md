# 전화영어 교재 — 콘텐츠 HTML 작성 기준

대상: ybmlms 교재 등록 담당 · 개발 · 디자인
범위: ITEM의 텍스트 칸 (`item_title`, `item_eng_1`, `item_kor_1`, `item_eng_2`, `item_kor_2`, `item_example`)

## 1. 원칙

1. 칸에는 **내용만** 넣는다. 글자 크기 · 색 · 글꼴 · 여백은 앱 화면이 정한다.
2. 꾸밈이 필요하면 2장의 **허용 태그**만 쓴다.
3. 줄바꿈은 Enter(실제 줄바꿈) 또는 `<br>`. 둘 다 화면에서 줄이 바뀐다. 빈 줄은 넣지 않는다(간격은 화면이 정함).
4. 허용되지 않은 태그와 모든 속성(`style`, `color`, `size`, `face` 등)은 화면에서 지워진다. 글자 내용은 남는다.

## 2. 허용 태그

| 용도 | 작성 | 화면 표시 |
|---|---|---|
| 줄바꿈 | Enter 또는 `<br>` | 줄바꿈 |
| 문단 | `<p>…</p>` | 줄바꿈 |
| 강조 | `<b>…</b>` 또는 `<strong>…</strong>` | 굵게 |
| 후리가나 · 윗첨자 | `<sup>…</sup>` | 작은 윗글자 |
| 항목 소제목 | `<span class="sub">…</span>` | 회색 칩 (예: 플랜 요청하기) |
| 팁 라벨 | `<span class="tip">…</span>` | TIP 태그 (예: Vocabulary Tip, 예상 답변) |
| 보조 문구 | `<span class="note">…</span>` | 작은 회색 글씨 (팁 내용 · 안내) |
| 빈칸 | `( )` 또는 `____` | 밑줄 빈칸 |

- 위 표 외의 태그(`font`, `span style`, `div`, `table`, `img`, `a`, `script` 등)는 쓰지 않는다.
- 이미지는 칸에 넣지 않고 이미지 항목으로 등록한다.

## 3. 쓰지 않는 것

| 쓰지 않음 | 이유 | 대신 |
|---|---|---|
| `style="font-size:…"`, `<font size>` | 앱 글자 크기 단계와 어긋남 | 쓰지 않음 (화면이 정함) |
| `style="color:…"`, `<font color>` | 언어별 컬러 · 흰 배경과 충돌 (예: `#ffff00` 노란 글씨는 안 보임) | 소제목은 `span.sub`, 강조는 `b` |
| `font-family` | 앱 서체와 어긋남 | 쓰지 않음 |
| `&emsp;` `&ensp;` `&nbsp;` 들여쓰기 | 화면 폭마다 정렬이 깨짐 | 줄바꿈만 사용 |
| 빈 문단 `<p>&nbsp;</p>` | 불필요한 빈 줄 | 지움 |

## 4. 작성 예시

**패턴 연습 (Pattern Drill)**

```html
<span class="sub">플랜 요청하기</span>
Q: What kind of plan are you looking for?
A: I'm looking for ( ).
<span class="tip">Vocabulary Tip</span>
<span class="note">- a prepaid plan
- a monthly plan
- a BYOD plan</span>
```

**자유 대화 (Talking about Yourself)**

```html
Tutor (Agent): Hello! How can I help you today?
Student: (새로운 유심을 개통하고 싶다고 말하세요.)
<span class="tip">예상 답변</span>
I'd like to ____.
```

**일본어 후리가나**

```html
<b>私<sup>(わたし)</sup>の名前<sup>(なまえ)</sup>は OOです。</b>
```

## 5. 기존 데이터 자동 정리 (화면 처리)

이미 등록된 데이터는 다시 입력하지 않아도 된다. 화면이 아래처럼 바꿔 보여준다.

| 기존 데이터 | 화면 처리 |
|---|---|
| `<font color=…>` 로 감싼 짧은 글 (줄 하나) | `span.sub` (소제목 칩) |
| `<span class="tip">` · `<span class=tip>` | TIP 태그 |
| `<p style="… color:#A9A9A9 …">` (회색 문단) | `span.note` (보조 문구) |
| `<p style>` · `<span style>` · `<strong><span style>` | 속성 제거, 글자와 `p` · `strong`만 남김 |
| `<font size>` · `<font face>` | 태그 제거, 글자만 남김 |
| `&emsp;` `&ensp;` `&nbsp;` | 공백 하나로 |
| 빈 `<p>` · 빈 줄 | 지움 (줄 사이 간격은 화면이 정함) |
| `<script>` · `<iframe>` · `on…` 속성 | 통째로 제거 |

- 정리 기준을 바꾸면 화면 코드 한 곳(`js/core.js` `Book.rich`)만 고친다.
- 실교재 적용 화면: `book-magazine-sample-172855.html` (워킹홀리데이 취업 인사이더 Lesson 1)
- 새로 등록하는 데이터는 2장 기준으로 작성한다.
