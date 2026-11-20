/* ======================================================================
   ui.js — 퍼블리싱 HTML용 화면 동작 (데이터 로딩 · 서버 연동 없음)
   index.html에 이미 들어 있는 마크업만 다룬다.
   파트 이동 · 파트 목록 · 표지 · 가이드/번역/강사 가이드 · 항목 버튼 · 그림 확대 · 헤더 접힘 · 스와이프
   ====================================================================== */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var isPhone = function () { return window.innerWidth < 640; };

  var ICON = {
    right: '<path d="m9 18 6-6-6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
  };
  var icon = function (n) { return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + "</svg>"; };

  var book = $("book"), scroll = $("bookScroll"), main = $("bookMain");
  var parts = [].slice.call(main.querySelectorAll(".book-part"));
  var state = { part: 1, total: parts.length };
  var HEADER = 56;

  /* 레슨 사진 : CSS 변수 속 상대 경로는 브라우저마다 기준이 달라(Safari = 문서, Chrome = css 파일) 절대 경로로 넣음 */
  var photo = book.getAttribute("data-photo-src");
  if (photo) book.style.setProperty("--lesson-photo", 'url("' + new URL(photo, document.baseURI).href + '")');

  /* 토스트 */
  var toastTimer;
  function toast(msg) {
    var t = $("bookToast");
    clearTimeout(toastTimer);
    t.textContent = msg;
    t.classList.add("is-show");
    toastTimer = setTimeout(function () { t.classList.remove("is-show"); }, 1400);
  }

  /* 항목 단위 동작 */
  function unitOf(el) { return el.closest(".book-item, .book-item-unit, .book-message"); }
  function setTranslation(unit, on) {
    unit.querySelectorAll(".book-translation:not(.book-pattern-answer)").forEach(function (t) { t.hidden = !on; });
    var b = unit.querySelector('[data-action="translate"]');
    if (b) { b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); }
  }
  function setQuestion(unit, shown) {                                 // 13타입 숨김 질문 : 보기 / 숨김
    var btn = unit.querySelector("[data-reveal]"), line = unit.querySelector(".book-question-text");
    if (!btn) return;
    btn.dataset.shown = shown ? "1" : "";
    line.textContent = shown ? unit.dataset.question : "Listen to the question";
    line.classList.toggle("is-hidden-question", !shown);
    btn.innerHTML = icon(shown ? "eyeOff" : "eye") + "<span>" + (shown ? "숨김" : "보기") + "</span>";
  }
  function setGuide(unit, on) {
    unit.querySelectorAll(".book-answer-guide").forEach(function (g) { g.hidden = !on; });
    if (unit.hasAttribute("data-question")) setQuestion(unit, on);      // 13타입 : 가이드 켜면 질문도 함께 노출
    var b = unit.querySelector('[data-action="guide"]');
    if (b) { b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); }
  }
  function play(btn) {                                                // 듣기 : 재생 표시만 (TTS · 오디오는 개발 연동)
    clearTimeout(btn._timer);
    btn.classList.add("is-playing");
    btn._timer = setTimeout(function () { btn.classList.remove("is-playing"); }, 1800);
  }
  main.addEventListener("click", function (e) {
    var zoom = e.target.closest("[data-zoom]");
    if (zoom) { var img = zoom.querySelector("img"); openViewer(img.src, img.alt); return; }
    var btn = e.target.closest("[data-action], [data-reveal]");
    if (btn) {
      var unit = unitOf(btn), act = btn.dataset.action;
      if (act === "translate") setTranslation(unit, !btn.classList.contains("is-active"));
      else if (act === "guide") setGuide(unit, !btn.classList.contains("is-active"));
      else if (act === "listen") play(btn);
      else if (btn.hasAttribute("data-reveal")) setQuestion(unit, btn.dataset.shown !== "1");
    }
  });

  /* 보기 설정 : 켜면 다음 파트에도 유지 */
  var global = { guide: false, translate: false, teacher: false };
  var NAME = { guide: "가이드", translate: "번역", teacher: "강사 가이드" };
  var HAS = { guide: ".book-answer-guide, .book-brainstorm", translate: ".book-translation:not(.book-pattern-answer)", teacher: ".book-teacher-guide" };
  var BTN = { guide: "bookToolGuide", translate: "bookToolTranslate", teacher: "bookTeacherBtn" };
  function current() { return parts[state.part - 1]; }
  function applyToPart(part, key, on) {
    part.dataset[key] = on ? "1" : "";
    if (key === "guide") {
      part.querySelectorAll(".book-item").forEach(function (u) { setGuide(u, on); });
      part.querySelectorAll(".book-brainstorm").forEach(function (b) { b.hidden = !on; });
    } else if (key === "translate") {
      part.querySelectorAll(".book-item, .book-item-unit, .book-message").forEach(function (u) { setTranslation(u, on); });
    } else {
      part.querySelectorAll(".book-teacher-guide").forEach(function (tg) { tg.hidden = !on; });   // 파트 설명 TG · 파트 TG · 답변 TG
    }
  }
  function syncTools() {
    var part = current();
    Object.keys(BTN).forEach(function (key) {
      var b = $(BTN[key]), has = !!part.querySelector(HAS[key]), on = has && part.dataset[key] === "1";
      b.disabled = !has;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on);
    });
  }
  function toggleTool(key) {
    var on = current().dataset[key] !== "1";
    applyToPart(current(), key, on);
    global[key] = on;
    toast(NAME[key] + (on ? " 켜짐" : " 꺼짐"));
    syncTools();
  }
  $("bookToolGuide").addEventListener("click", function () { toggleTool("guide"); });
  $("bookToolTranslate").addEventListener("click", function () { toggleTool("translate"); });
  $("bookTeacherBtn").addEventListener("click", function () {
    toggleTool("teacher");
    var box = current().querySelector(".book-teacher-guide");      // 박스가 화면 위로 지나가 있으면 보이게
    if (!box || box.hidden) return;
    var top = box.getBoundingClientRect().top, limit = HEADER + 12;
    if (top < limit) (isPhone() ? scroll : window).scrollBy({ top: top - limit, behavior: "smooth" });
  });
  $("bookPrintBtn").addEventListener("click", function () { window.print(); });

  /* 파트 이동 */
  function go(n) {
    if (n < 1 || n > state.total) return;
    state.part = n;
    parts.forEach(function (p, i) { p.hidden = i + 1 !== n; });
    var part = current();
    Object.keys(global).forEach(function (key) {
      if ((part.dataset[key] === "1") !== global[key]) applyToPart(part, key, global[key]);
    });
    $("bookHeroEyebrow").textContent = $("bookHeaderPart").textContent = "PART " + pad(n);
    $("bookHeroTitle").textContent = $("bookHeaderTitle").textContent = part.dataset.title;
    $("bookHeroDesc").innerHTML = part.dataset.desc;
    $("bookPrev").disabled = n === 1;
    var last = n === state.total, next = $("bookNext");
    next.innerHTML = icon(last ? "check" : "right");
    next.setAttribute("aria-label", last ? "학습 완료" : "다음 파트");
    markLists();
    syncTools();
    scroll.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
    book.style.setProperty("--p", 0);
    book.classList.remove("is-collapsed");
  }
  function markLists() {                                              // 파트 목록 · 표지 목차의 현재 표시
    $("bookPartlist").querySelectorAll("[data-part]").forEach(function (b) {
      var n = +b.dataset.part;
      b.className = n === state.part ? "is-current" : n < state.part ? "is-done" : "";
      b.setAttribute("aria-selected", n === state.part);
    });
    document.querySelectorAll("#bookCoverParts [data-part]").forEach(function (b) {
      b.classList.toggle("is-current", +b.dataset.part === state.part);
    });
  }
  $("bookPrev").addEventListener("click", function () { go(state.part - 1); });
  $("bookNext").addEventListener("click", function () {
    if (state.part === state.total) toast("오늘 학습을 마쳤어요");
    else go(state.part + 1);
  });

  /* 파트 목록 */
  function setPartlist(open) {
    $("bookPartlist").classList.toggle("is-open", open);
    $("bookScrim").classList.toggle("is-open", open);
    $("bookDockList").setAttribute("aria-expanded", open);
  }
  $("bookDockList").addEventListener("click", function () { setPartlist($("bookDockList").getAttribute("aria-expanded") !== "true"); });
  $("bookScrim").addEventListener("click", function () { setPartlist(false); });
  $("bookPartlist").addEventListener("click", function (e) {
    var b = e.target.closest("[data-part]");
    if (b) { go(+b.dataset.part); setPartlist(false); }
  });

  /* 표지 */
  function setCover(open) { $("bookCover").classList.toggle("is-open", open); }
  $("bookCoverBtn").addEventListener("click", function () { setCover(true); });
  $("bookCoverBack").addEventListener("click", function () { setCover(false); });
  $("bookLessons").addEventListener("click", function (e) {
    var b = e.target.closest("[data-part]");
    if (b) { go(+b.dataset.part); setCover(false); return; }
    if (e.target.closest("[data-cover-close]")) { setCover(false); return; }
    var l = e.target.closest("[data-lesson]");                         // 다른 레슨 : 모두 열림. 실제 이동은 앱 연동
    if (l) toast("Lesson " + pad(+l.dataset.lesson) + " 데이터가 연결되지 않았어요");
  });

  /* 그림 크게 보기 : 누르면 그 지점 기준 2배, 다시 누르면 맞춤 */
  var viewer = $("bookViewer"), stage = $("bookViewerStage"), viewImg = $("bookViewerImg");
  function openViewer(src, alt) {
    viewImg.src = src; viewImg.alt = alt || ""; viewImg.style.width = "";
    viewer.classList.remove("is-zoomed");
    viewer.hidden = false;
    $("bookViewerClose").focus();
  }
  function closeViewer() { viewer.hidden = true; viewImg.removeAttribute("src"); }
  viewImg.addEventListener("click", function (e) {
    if (viewer.classList.contains("is-zoomed")) { viewer.classList.remove("is-zoomed"); viewImg.style.width = ""; return; }
    var r = viewImg.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    viewImg.style.width = r.width * 2 + "px";
    viewer.classList.add("is-zoomed");
    stage.scrollLeft = viewImg.offsetWidth * fx - stage.clientWidth / 2;
    stage.scrollTop = viewImg.offsetHeight * fy - stage.clientHeight / 2;
  });
  $("bookViewerClose").addEventListener("click", closeViewer);
  stage.addEventListener("click", function (e) { if (e.target === stage) closeViewer(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setPartlist(false); closeViewer(); setCover(false); } });

  /* 헤더 접힘 : --p 0 → 1 */
  var ticking = 0;
  function onScroll() {
    if (ticking) return;
    ticking = requestAnimationFrame(function () {
      ticking = 0;
      var y = Math.max(scroll.scrollTop, window.scrollY || 0), range = (isPhone() ? 300 : 320) - HEADER;
      var p = Math.min(y / range, 1);
      book.style.setProperty("--p", p.toFixed(3));
      book.classList.toggle("is-collapsed", p >= 0.9);
    });
  }
  scroll.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  /* 모바일 스와이프 : 왼쪽 = 다음 */
  var x0 = 0, y0 = 0, tracking = false, horizontal = false;
  scroll.addEventListener("touchstart", function (e) {
    tracking = isPhone() && e.touches.length === 1; horizontal = false;
    if (tracking) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }
  }, { passive: true });
  scroll.addEventListener("touchmove", function (e) {
    if (!tracking) return;
    var dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
    if (!horizontal && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) horizontal = true;
    if (horizontal) e.preventDefault();
  }, { passive: false });
  scroll.addEventListener("touchend", function (e) {
    if (!tracking || !horizontal) return;
    tracking = false;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) >= 60) go(state.part + (dx < 0 ? 1 : -1));
  }, { passive: true });

  go(1);
})();
