/* ======================================================================
   core.js — Book 네임스페이스 · 데이터 · 유틸 · 아이콘 · 토스트 · 레슨 사진 · 옵션 · 자간
   ====================================================================== */
window.Book = window.Book || {};
(function (B) {
  "use strict";

  /* 데이터 : window.BOOK_DATA (data/lesson-NN.json 형식) */
  B.data = window.BOOK_DATA || {};

  /* 유틸 */
  B.$ = function (id) { return document.getElementById(id); };
  B.pad = function (n) { return String(n).padStart(2, "0"); };
  B.esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  B.isPhone = function () { return window.innerWidth < 640; };

  /* 아이콘 : data-icon="이름" (24×24, stroke) */
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
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    expand: '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>',
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

  /* 이미지 경로 : 파일 이름만 쓰면 폴더를 붙임. 단일 파일에서는 내장 이미지로 바꿈 */
  B.IMAGE_DIR = { lesson: "images/lesson/", content: "images/content/" };
  B.imageUrl = function (name, kind) {
    var url = /\//.test(name) ? name : B.IMAGE_DIR[kind] + name;
    return (window.BOOK_IMAGES || {})[url] || url;
  };

  /* 레슨 사진(히어로 · 표지) : lesson.photo → course.photo → mode 규칙
     mode   "sequence" 레슨 번호 순서로 1 → count 반복 · "random" 열 때마다 무작위
     count  images/lesson/lesson-photoN.jpg 개수 */
  B.PHOTO = { prefix: "lesson-photo", ext: ".jpg", count: 8, mode: "sequence" };
  B.photoUrl = function (lessonNo) {
    var d = B.data, P = B.PHOTO, fixed = (d.lesson && d.lesson.photo) || (d.course && d.course.photo);
    if (fixed) return B.imageUrl(fixed, "lesson");
    var n = P.mode === "random" ? 1 + Math.floor(Math.random() * P.count) : 1 + ((Math.max(1, lessonNo) - 1) % P.count);
    return B.imageUrl(P.prefix + n + P.ext, "lesson");
  };
  B.applyPhoto = function (book, lessonNo) {
    var url = B.photoUrl(lessonNo), img = new Image();
    if (!/^data:/.test(url)) url = new URL(url, document.baseURI).href;  // CSS 변수 속 상대 경로는 css/ 기준으로 풀리므로 절대 경로로
    book.style.setProperty("--lesson-photo", 'url("' + url + '")');
    img.onload = function () { book.setAttribute("data-photo", ""); };
    img.onerror = function () { book.removeAttribute("data-photo"); };
    img.src = url;
  };

  /* 옵션 : Book.set(key, value) 또는 postMessage({ type: "book", key, value })
     lang "en"(purple · 기본) · "zh"(coral) · "ja"(green) / teacher 강사 계정 / photo false면 사진 없이 그라데이션 */
  B.set = function (key, value) {
    var root = document.documentElement, book = B.$("book");
    if (key === "lang") { if (value && value !== "en") root.setAttribute("data-lang", value); else root.removeAttribute("data-lang"); }
    if (key === "teacher") book.toggleAttribute("data-teacher", !!value);
    if (key === "photo") book.toggleAttribute("data-photo", !!value);
  };
  window.addEventListener("message", function (e) { var d = e.data; if (d && d.type === "book") B.set(d.key, d.value); });

  /* 자간 : 한글 -0.02em, 영문 0 (20px↑ -0.02/-0.01em, 28px↑ -0.03/-0.02em). 섞인 문장은 한글만 span.ko */
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
  B.watchLetterSpacing = function (root) {
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
