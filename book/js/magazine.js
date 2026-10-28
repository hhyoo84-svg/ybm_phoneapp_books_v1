/* ======================================================================
   magazine.js — 시작 · 보기 설정 · 헤더/하단 바 · 표지 · 파트 목록 · 이동 · 히어로 접힘 · 스와이프
   ====================================================================== */
(function (B) {
  "use strict";
  var $ = B.$, pad = B.pad, esc = B.esc, icon = B.icon;
  var D = B.data, book = $("book"), scroll = $("bookScroll"), main = $("bookMain");
  var HEADER = 56;                                                    // = --header-height
  var lessonNo = (D.lesson && D.lesson.number) || 1;
  var state = { part: 1, total: D.parts.length };

  /* 시작 */
  if (!document.documentElement.hasAttribute("data-lang")) B.set("lang", D.course.lang);   // 언어별 컬러 (html 속성 우선)
  var parts = B.renderParts(main, D.parts);
  B.bindPartActions(main);
  $("bookLessonLabel").textContent = "LESSON " + pad(lessonNo);
  $("bookCourseLabel").textContent = D.course.label;
  $("bookCourseTitle").innerHTML = esc(D.course.title) + "<br />" + esc(D.course.titleEn);
  $("bookCourseDesc").textContent = D.course.desc;
  B.fillIcons(document);
  B.applyPhoto(book, lessonNo);
  function currentPart() { return parts[state.part - 1]; }

  /* 보기 설정 : 가이드 · 번역 · 강사 가이드 — 켜면 파트를 넘겨도 유지, 직접 끌 때만 꺼짐 */
  var global = { guide: false, translate: false, teacher: false };
  var TOAST = { guide: "가이드", translate: "번역", teacher: "강사 가이드" };
  function toggleTool(key) {
    var on = currentPart().dataset[key] !== "1";
    B.applyToPart(currentPart(), key, on);
    global[key] = on;
    B.toast(TOAST[key] + (on ? " 켜짐" : " 꺼짐"));
    syncToolStates();
  }
  function syncToolStates() {
    var d = currentPart().dataset;
    [["bookToolGuide", d.guide], ["bookToolTranslate", d.translate], ["bookTeacherBtn", d.teacher]].forEach(function (x) {
      var on = x[1] === "1";
      $(x[0]).classList.toggle("is-on", on);
      $(x[0]).setAttribute("aria-pressed", on);
    });
  }

  /* 헤더 · 하단 바 버튼 */
  $("bookCoverBtn").addEventListener("click", function () { setCover(true); });
  $("bookPrintBtn").addEventListener("click", function () { window.print(); });
  $("bookToolGuide").addEventListener("click", function () { toggleTool("guide"); });
  $("bookToolTranslate").addEventListener("click", function () { toggleTool("translate"); });
  $("bookTeacherBtn").addEventListener("click", function () { toggleTool("teacher"); revealTeacherGuide(); });
  function revealTeacherGuide() {                                     // 박스가 화면 위로 지나가 있으면 보이게
    var box = currentPart().querySelector(".book-teacher-guide"), top = box.getBoundingClientRect().top, limit = HEADER + 12;
    if (box.hidden || top >= limit) return;
    (B.isPhone() ? scroll : window).scrollBy({ top: top - limit, behavior: "smooth" });
  }

  /* 표지 : 현재 레슨만 파트 목차 펼침 */
  function setCover(open) { $("bookCover").classList.toggle("is-open", open); }
  $("bookLessons").insertAdjacentHTML("beforeend", D.lessons.map(function (l, i) {
    var current = i + 1 === lessonNo, tag = current ? 'button type="button" id="bookLessonCurrent"' : "div";
    return '<div class="book-lesson' + (current ? " is-current" : "") + '"><' + tag + ' class="book-lesson-head"><span class="book-lesson-number">' + pad(i + 1) + "</span>" +
      '<span class="book-lesson-text"><b>' + esc(l.title) + "</b><span>" + esc(l.desc) + '</span></span><em class="book-lesson-badge">' + (current ? "학습 중" : "예정") + "</em></" + (current ? "button" : "div") + ">" +
      (current ? '<ol class="book-lesson-parts" id="bookCoverParts" aria-label="파트 목차"></ol>' : "") + "</div>";
  }).join(""));
  $("bookCoverBack").addEventListener("click", function () { setCover(false); });
  $("bookLessonCurrent").addEventListener("click", function () { setCover(false); });
  $("bookCoverParts").addEventListener("click", function (e) {
    var b = e.target.closest("[data-part]");
    if (b) { go(+b.dataset.part); setCover(false); }
  });

  /* 그림 크게 보기 : 처음엔 화면에 맞춤, 누르면 그 지점 기준 2배 · 다시 누르면 맞춤 */
  var viewer = $("bookViewer"), stage = $("bookViewerStage"), viewImg = $("bookViewerImg");
  B.zoom = function (src, alt) {
    viewImg.src = src;
    viewImg.alt = alt;
    viewImg.style.width = "";
    viewer.classList.remove("is-zoomed");
    viewer.hidden = false;
    $("bookViewerClose").focus();
  };
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

  /* 파트 목록 */
  function setPartlist(open) {
    $("bookPartlist").classList.toggle("is-open", open);
    $("bookScrim").classList.toggle("is-open", open);
    $("bookDockList").setAttribute("aria-expanded", open);
  }
  function renderPartlist() {
    $("bookPartlist").innerHTML = D.parts.map(function (p, i) {
      var n = i + 1, cls = n === state.part ? "is-current" : n < state.part ? "is-done" : "";
      return '<button role="option" data-part="' + n + '" class="' + cls + '" aria-selected="' + (n === state.part) + '"><i>' + pad(n) + "</i>" + esc(p.title) + icon("check") + "</button>";
    }).join("");
    $("bookCoverParts").innerHTML = D.parts.map(function (p, i) {
      return '<li><button type="button" data-part="' + (i + 1) + '"' + (i + 1 === state.part ? ' class="is-current"' : "") + "><i>" + pad(i + 1) + "</i><span>" + esc(p.title) + "</span></button></li>";
    }).join("");
  }
  $("bookDockList").addEventListener("click", function () { setPartlist($("bookDockList").getAttribute("aria-expanded") !== "true"); });
  $("bookScrim").addEventListener("click", function () { setPartlist(false); });
  $("bookPartlist").addEventListener("click", function (e) {
    var b = e.target.closest("[data-part]");
    if (b) { go(+b.dataset.part); setPartlist(false); }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setPartlist(false); closeViewer(); } });

  /* 파트 이동 */
  function go(n) {
    if (n < 1 || n > state.total) return;
    state.part = n;
    parts.forEach(function (p, i) { p.hidden = i + 1 !== n; });
    var p = D.parts[n - 1], part = parts[n - 1];
    Object.keys(global).forEach(function (key) {
      if ((part.dataset[key] === "1") !== global[key]) B.applyToPart(part, key, global[key]);
    });
    $("bookHeroEyebrow").textContent = $("bookHeaderPart").textContent = "PART " + pad(n);
    $("bookHeroTitle").textContent = $("bookHeaderTitle").textContent = p.title;
    $("bookHeroDesc").textContent = p.desc;
    $("bookPrev").disabled = n === 1;
    var last = n === state.total, next = $("bookNext");
    next.innerHTML = icon(last ? "check" : "right");
    next.setAttribute("aria-label", last ? "학습 완료" : "다음 파트");
    renderPartlist();
    syncToolStates();
    scroll.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
    book.style.setProperty("--p", 0);
    book.classList.remove("is-collapsed");
  }
  $("bookPrev").addEventListener("click", function () { go(state.part - 1); });
  $("bookNext").addEventListener("click", function () { go(state.part + 1); });

  /* 히어로 접힘 : --p 0 → 1 */
  var ticking = 0;
  function onScroll() {
    if (ticking) return;
    ticking = requestAnimationFrame(function () {
      ticking = 0;
      var y = Math.max(scroll.scrollTop, window.scrollY || 0), range = (B.isPhone() ? 300 : 320) - HEADER;
      var p = Math.min(y / range, 1);
      book.style.setProperty("--p", p.toFixed(3));
      book.classList.toggle("is-collapsed", p >= 0.9);
    });
  }
  scroll.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  /* 모바일 스와이프 : 왼쪽 = 다음 */
  (function () {
    var x0 = 0, y0 = 0, tracking = false, horizontal = false;
    scroll.addEventListener("touchstart", function (e) {
      tracking = B.isPhone() && e.touches.length === 1; horizontal = false;
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
  })();

  B.go = go;
  go(1);
  B.watchLetterSpacing(book);
})(window.Book);
