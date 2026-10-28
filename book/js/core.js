/* ======================================================================
   core.js — 공통 — Book 네임스페이스 · 데이터 · 유틸 · 아이콘 · 토스트 · 레슨 사진 · 컬러 · 자간
   매거진형 · 리더형 공용. 화면 틀 동작은 magazine.js(또는 reader.js)에서만 다룬다
   ====================================================================== */
window.Book = window.Book || {};
(function (B) {
  "use strict";

  /* 데이터 : window.BOOK_DATA (data/lesson-NN.json) — 개발 시 API 응답으로 교체 */
  B.data = window.BOOK_DATA || {};

  /* 유틸 */
  B.$ = function (id) { return document.getElementById(id); };
  B.pad = function (n) { return String(n).padStart(2, "0"); };
  B.esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  B.isPhone = function () { return window.innerWidth < 640; };

  /* 아이콘 : data-icon="이름" 요소에 자동으로 채움. 새 아이콘은 이 표에만 추가 (24×24, stroke) */
  var ICON_PATHS = {
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    speaker: '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
    bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0 -4 12.7 3.5 3.5 0 0 1 1.5 2.8 .5 .5 0 0 0 .5 .5h4a.5 .5 0 0 0 .5 -.5 3.5 3.5 0 0 1 1.5 -2.8 7 7 0 0 0 -4 -12.7z"/>',
    book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    teacher: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    list: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
  };
  B.icon = function (name) { return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + ICON_PATHS[name] + "</svg>"; };
  B.fillIcons = function (root) {
    root.querySelectorAll("[data-icon]").forEach(function (el) { el.insertAdjacentHTML("afterbegin", B.icon(el.dataset.icon)); });
  };

  /* 토스트 : #bookToast */
  var toastTimer;
  B.toast = function (msg) {
    var t = B.$("bookToast");
    clearTimeout(toastTimer);
    t.textContent = msg;
    t.classList.add("is-show");
    toastTimer = setTimeout(function () { t.classList.remove("is-show"); }, 1400);
  };

  /* 레슨 사진 : images/lesson-photoN.jpg
     우선순위  1) lesson.photo  2) course.photo  3) PHOTO.mode 규칙
     mode      "sequence" 레슨 번호 순서대로 1 → count 반복 (기본 · 같은 레슨은 항상 같은 사진, 이웃 레슨은 다른 사진)
               "random"   열 때마다 무작위
     count     images/ 폴더에 있는 lesson-photo 개수. 사진을 추가하면 이 숫자만 바꾼다
     사진을 못 읽으면 data-photo를 빼고 브랜드 그라데이션으로 표시 */
  B.PHOTO = { dir: "images/", prefix: "lesson-photo", ext: ".jpg", count: 1, mode: "sequence" };
  B.photoUrl = function (lessonNo) {
    var d = B.data, P = B.PHOTO, fixed = (d.lesson && d.lesson.photo) || (d.course && d.course.photo);
    if (fixed) return /\//.test(fixed) ? fixed : P.dir + fixed;
    var n = P.mode === "random" ? 1 + Math.floor(Math.random() * P.count) : 1 + ((Math.max(1, lessonNo) - 1) % P.count);
    return P.dir + P.prefix + n + P.ext;
  };
  B.applyPhoto = function (book, lessonNo) {
    var url = B.photoUrl(lessonNo), img = new Image();
    url = (window.BOOK_IMAGES || {})[url] || url;               // 산출물 단일 파일에서만 내장 이미지로 바꿈
    if (!/^data:/.test(url)) url = new URL(url, document.baseURI).href;  // 절대 경로로: CSS 변수 속 상대 경로는 css/ 기준으로 풀리기 때문
    book.style.setProperty("--lesson-photo", 'url("' + url + '")');
    img.onload = function () { book.setAttribute("data-photo", ""); };
    img.onerror = function () { book.removeAttribute("data-photo"); };
    img.src = url;
  };

  /* 옵션 : 앱(WebView) · 검토 화면에서 Book.set(key, value) 또는 postMessage({ type: "review", key, value })
     palette  "" = purple(기본) · "coral" · "green"
     teacher  강사 계정이면 true (하단 바에 '강사 가이드' 노출)
     photo    false면 레슨 사진 없이 브랜드 그라데이션 */
  B.set = function (key, value) {
    var root = document.documentElement, book = B.$("book");
    if (key === "palette") { if (value) root.setAttribute("data-palette", value); else root.removeAttribute("data-palette"); }
    if (key === "teacher") book.toggleAttribute("data-teacher", !!value);
    if (key === "photo") book.toggleAttribute("data-photo", !!value);
  };
  window.addEventListener("message", function (e) { var d = e.data; if (d && d.type === "review") B.set(d.key, d.value); });

  /* 자간 : 한글 -0.02em, 영문·숫자 0 (20px 이상 -0.02/-0.01em, 28px 이상 -0.03/-0.02em)
     한 요소에 한글·영문이 섞이면 한글 구간만 <span class="ko">로 나눠 적용. 라벨처럼 + 자간(0.4px 초과)은 유지
     CSS에 letter-spacing을 따로 쓰지 않는다(+ 자간 라벨 제외) */
  var HANGUL = /[ᄀ-ᇿ㄰-㆏가-힣]/, HANGUL_RUN = /[ᄀ-ᇿ㄰-㆏가-힣]+/g;
  function spacing(size, ko) {
    if (size >= 28) return ko ? "-0.03em" : "-0.02em";
    if (size >= 20) return ko ? "-0.02em" : "-0.01em";
    return ko ? "-0.02em" : "0";
  }
  function fitElement(el) {
    if (el.closest("svg, script, style") || el.classList.contains("ko")) return;
    var texts = [].filter.call(el.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
    if (!texts.length) return;
    var cs = getComputedStyle(el), size = parseFloat(cs.fontSize);
    if (parseFloat(cs.letterSpacing) > 0.4) return;
    var all = texts.map(function (t) { return t.nodeValue; }).join(""), ko = HANGUL.test(all), mixed = ko && /[A-Za-z0-9]/.test(all);
    if (!mixed || /flex|grid/.test(cs.display)) { el.style.setProperty("letter-spacing", spacing(size, ko), "important"); return; }
    el.style.setProperty("letter-spacing", spacing(size, false), "important");
    texts.forEach(function (t) {
      if (!HANGUL.test(t.nodeValue)) return;
      t.parentNode.replaceChild(document.createRange().createContextualFragment(
        B.esc(t.nodeValue).replace(HANGUL_RUN, function (m) { return '<span class="ko" style="letter-spacing:' + spacing(size, true) + ' !important">' + m + "</span>"; })), t);
    });
  }
  function fitLetterSpacing(root) {
    if (root.nodeType === 3) root = root.parentElement;
    if (!root || root.nodeType !== 1) return;
    fitElement(root);
    root.querySelectorAll("*").forEach(fitElement);
  }
  B.watchLetterSpacing = function (root) {                      // 처음 한 번 + 텍스트가 바뀔 때마다(히어로 · 토스트 · 질문 보기)
    var queue = [], observer = new MutationObserver(function (list) {
      list.forEach(function (m) { queue.push(m.target); });
      requestAnimationFrame(function () {
        observer.disconnect();
        queue.splice(0).forEach(function (n) { if (n.isConnected) fitLetterSpacing(n); });
        observe();
      });
    });
    function observe() { observer.observe(root, { childList: true, subtree: true, characterData: true }); }
    fitLetterSpacing(root);
    observe();
  };
})(window.Book);
