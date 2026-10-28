/* ======================================================================
   parts.js — 파트 템플릿 12종 · 항목 동작 · 보기 설정 적용
   ====================================================================== */
(function (B) {
  "use strict";
  var esc = B.esc, pad = B.pad, icon = B.icon;

  /* 작은 조각 */
  var ACTION = {
    guide: '<button class="icon-btn" data-action="guide" aria-label="답변 가이드" aria-pressed="false">' + icon("bulb") + "</button>",
    translate: '<button class="icon-btn" data-action="translate" aria-label="번역" aria-pressed="false">' + icon("globe") + "</button>",
    listen: '<button class="icon-btn" data-action="listen" aria-label="음성 듣기">' + icon("speaker") + '<span class="eq"><i></i><i></i><i></i></span></button>',
  };
  function actions(names, cls) {
    return '<div class="' + (cls || "actions") + '">' + names.map(function (n) { return ACTION[n]; }).join("") + "</div>";
  }
  function number(n) { return '<span class="badge" data-type="number">' + pad(n) + "</span>"; }
  function question(n) { return '<span class="badge" data-type="question">Q' + n + "</span>"; }
  function chip(text) { return '<p class="chip">' + esc(text) + "</p>"; }
  function translation(text) { return '<p class="book-translation" hidden>' + esc(text) + "</p>"; }
  function tip(text) { return '<div class="book-tip"><span class="tag">TIP</span><span class="book-tip-text">' + esc(text) + "</span></div>"; }
  function answerGuide(en, kr) {
    return '<div class="book-answer-guide" hidden><p class="book-answer-guide-title">답변 가이드</p><p class="book-answer-guide-en">A: ' + esc(en) + '</p><p class="book-answer-guide-kr">A: ' + esc(kr) + "</p></div>";
  }
  function questionCard(n, en, kr, extra, withGuide) {
    return '<div class="book-item book-question">' +
      '<div class="book-question-row">' + question(n) + '<div class="book-question-body"><p class="book-question-text">' + esc(en) + "</p>" + translation(kr) + "</div></div>" +
      actions(withGuide ? ["guide", "translate", "listen"] : ["translate", "listen"], "actions-row") + (extra || "") + "</div>";
  }
  function scenarioBox(s) {
    return '<div class="box book-scenario book-item-unit"><span class="book-box-label">' + esc(s[0]) + '</span><p class="book-read">' + esc(s[1]) + "</p>" + translation(s[2]) + actions(["translate", "listen"], "actions-row") + "</div>";
  }
  /* 본문 그림 : images/content/ 의 picture.src (원본 비율 그대로, 누르면 크게 보기). src 없으면 레슨 사진 */
  function picture(pic) {
    return pic.src
      ? '<button class="book-picture-zoom" type="button" data-zoom aria-label="크게 보기: ' + esc(pic.alt) + '">' +
          '<img class="book-picture" src="' + esc(B.imageUrl(pic.src, "content")) + '" alt="' + esc(pic.alt) + '" loading="lazy" />' +
          '<span class="glass-btn book-zoom-hint" aria-hidden="true">' + icon("expand") + "</span></button>"
      : '<div class="book-picture" role="img" aria-label="' + esc(pic.alt) + '"></div>';
  }

  /* 파트 유형 */
  var RENDER = {
    words: function (p) {
      return '<div class="book-list" data-columns="2">' + chip(p.label) + p.items.map(function (w, i) {
        return '<div class="book-item book-word"><div class="book-head">' + number(i + 1) + '<span class="book-word-text">' + esc(w[0]) + "</span>" + actions(["translate", "listen"]) + "</div>" +
          '<div class="book-indent">' + translation(w[1]) + "</div></div>";
      }).join("") + "</div>";
    },
    qa: function (p) {
      return '<div class="book-list">' + p.items.map(function (q, i) {
        function line(sp, en, kr) { return '<div class="book-qa-line" data-speaker="' + sp + '"><span class="book-qa-speaker">' + sp.toUpperCase() + ':</span><div class="book-qa-text-col"><p class="book-qa-text">' + esc(en) + "</p>" + translation(kr) + "</div></div>"; }
        return '<div class="book-item book-qa"><div class="book-qa-row">' + number(i + 1) + '<div class="book-qa-lines">' + line("a", q[0], q[1]) + line("b", q[2], q[3]) + "</div></div>" + actions(["translate", "listen"], "actions-row") + "</div>";
      }).join("") + "</div>";
    },
    drills: function (p) {
      return '<div class="book-list">' + p.items.map(function (d, i) {
        var sentence = esc(d[1]).replace("( )", '<span class="book-blank"></span>');
        return '<div class="book-item book-drill"><div class="book-head">' + number(i + 1) + chip(d[0]) + actions(["translate", "listen"]) + "</div>" +
          '<div class="book-indent"><p class="book-sentence">' + sentence + "</p>" + translation(d[3]) + tip(d[2]) + "</div></div>";
      }).join("") + "</div>";
    },
    patterns: function (p) {
      return '<div class="book-list">' + p.items.map(function (t, i) {
        return '<div class="book-item book-pattern"><div class="book-pattern-row">' + number(i + 1) + '<div class="book-pattern-body">' +
          '<p class="book-sentence book-speakline"><span></span></p>' + tip(t[0] + " / " + t[1]) +
          '<p class="book-translation book-pattern-answer" hidden>' + esc(t[0] + " " + t[1]) + "</p></div></div></div>";
      }).join("") + "</div>";
    },
    topics: function (p) {
      return '<div class="book-section-label">' + chip(p.label) + '</div><div class="book-list">' + p.items.map(function (q, i) { return questionCard(i + 1, q[0], q[1]); }).join("") + "</div>";
    },
    dialogue: function (p) {
      var NAME = { teacher: "Teacher", me: "Me" };
      return '<div class="book-dialogue">' + p.items.map(function (m) {
        return '<div class="book-message" data-speaker="' + m[0] + '"><p class="book-message-name">' + NAME[m[0]] + "</p>" +
          '<div class="box book-message-bubble"><div class="book-message-text"><p class="book-read">' + esc(m[1]) + "</p>" + translation(m[2]) + "</div>" + actions(["translate", "listen"]) + "</div></div>";
      }).join("") + "</div>";
    },
    expressions: function (p) {
      return '<div class="book-list" data-columns="2">' + p.items.map(function (e, i) {
        return '<div class="book-item book-word"><div class="book-head">' + number(i + 1) + '<span class="book-word-text">' + esc(e[0]) + "</span>" + actions(["translate", "listen"]) + "</div>" +
          '<div class="book-indent">' + translation(e[1]) + '<p class="book-example">' + esc(e[2]) + "</p>" + translation(e[3]) + "</div></div>";
      }).join("") + "</div>";
    },
    phrases: function (p) {
      return p.items.map(function (g) {
        return '<div class="book-phrases">' + tip(g[0]) + '<div class="box"><ul>' + g[1].map(function (t) { return '<li class="book-read">' + esc(t) + "</li>"; }).join("") + "</ul></div></div>";
      }).join("");
    },
    reading: function (p) {
      return '<div class="box book-passage book-item-unit"><p class="book-read">' + esc(p.passage[0]) + "</p>" + translation(p.passage[1]) + actions(["translate", "listen"], "actions-row") + "</div>" +
        '<div class="book-list">' + p.items.map(function (q, i) { return questionCard(i + 1, q[0], q[1]); }).join("") + "</div>";
    },
    describe: function (p) {
      var circled = "①②③④⑤⑥";
      return '<span class="book-test-label">' + esc(p.tests[0]) + "</span>" + '<div class="book-section-label">' + chip(p.label) + "</div>" +
        '<div class="box book-sentence-grid">' + p.sentences.map(function (s, i) { return '<div class="book-read">' + circled[i] + " " + esc(s) + "</div>"; }).join("") + "</div>" +
        '<span class="book-test-label">' + esc(p.tests[1]) + "</span>" + picture(p.picture) +
        '<div class="book-brainstorm" hidden><p class="book-brainstorm-title">Brainstorming</p>' + p.brainstorm.map(function (g) {
          return '<div class="book-brainstorm-group"><h5>' + esc(g[0]) + "</h5>" + g[1].map(function (q) { return "<p>" + esc(q) + "</p>"; }).join("") + "</div>";
        }).join("") + "</div>";
    },
    respond: function (p) {
      return '<span class="book-test-label">' + esc(p.test) + "</span>" + scenarioBox(p.scenario) +
        '<div class="book-list">' + p.items.map(function (q, i) { return questionCard(p.firstQuestion + i, q[0], q[1], answerGuide(q[2], q[3]), true); }).join("") + "</div>";
    },
    survey: function (p) {
      return '<span class="book-test-label">' + esc(p.test) + "</span>" + scenarioBox(p.scenario) + picture(p.picture) +
        '<div class="book-list">' + p.items.map(function (q, i) {
          return '<div class="book-item book-question" data-question="' + esc(q[0]) + '"><div class="book-question-row">' + question(p.firstQuestion + i) +
            '<p class="book-question-text book-question-body is-hidden-question">Listen to the question</p>' +
            '<button class="book-reveal-btn" type="button" data-reveal>' + icon("eye") + "<span>보기</span></button></div>" + answerGuide(q[1], q[2]) + "</div>";
        }).join("") + "</div>";
    },
  };

  /* 파트 그리기 (맨 위 강사 가이드 박스) */
  B.renderParts = function (main, parts) {
    main.innerHTML = parts.map(function (p, i) {
      return '<section class="book-part" data-part="' + (i + 1) + '" hidden><div class="book-part-body">' +
        '<div class="book-teacher-guide" hidden><p class="book-teacher-guide-title">강사 가이드</p><p class="book-teacher-guide-text">' + esc(p.teacher) + "</p></div>" +
        RENDER[p.type](p) + "</div></section>";
    }).join("");
    return main.querySelectorAll(".book-part");
  };

  /* 항목 동작 : 그림 크게 보기 · 번역 · 듣기 · 답변 가이드 · 패턴 정답 · 질문 보기 */
  function unitOf(el) { return el.closest(".book-item, .book-item-unit, .book-message"); }
  function setTranslation(unit, on) {
    unit.querySelectorAll(".book-translation:not(.book-pattern-answer)").forEach(function (t) { t.hidden = !on; });
    var b = unit.querySelector('[data-action="translate"]');
    if (b) { b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); }
  }
  function setGuide(unit, on) {
    unit.querySelectorAll(".book-answer-guide").forEach(function (g) { g.hidden = !on; });
    var b = unit.querySelector('[data-action="guide"]');
    if (b) { b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on); }
  }
  function play(btn) {
    clearTimeout(btn._timer);
    btn.classList.add("is-playing");
    btn._timer = setTimeout(function () { btn.classList.remove("is-playing"); }, 1800); // TODO: 실제 오디오 재생 시간
  }
  B.bindPartActions = function (main) {
    main.addEventListener("click", function (e) {
      var zoom = e.target.closest("[data-zoom]");
      if (zoom) { var img = zoom.querySelector("img"); B.zoom(img.src, img.alt); return; }
      var btn = e.target.closest("[data-action], [data-reveal]");
      if (btn) {
        var unit = unitOf(btn);
        if (btn.dataset.action === "translate") setTranslation(unit, !btn.classList.contains("is-active"));
        else if (btn.dataset.action === "guide") setGuide(unit, !btn.classList.contains("is-active"));
        else if (btn.dataset.action === "listen") play(btn);
        else if (btn.hasAttribute("data-reveal")) {
          var shown = btn.dataset.shown !== "1", line = unit.querySelector(".book-question-text");
          btn.dataset.shown = shown ? "1" : "";
          line.textContent = shown ? unit.dataset.question : "Listen to the question";
          line.classList.toggle("is-hidden-question", !shown);
          btn.innerHTML = icon(shown ? "eyeOff" : "eye") + "<span>" + (shown ? "숨김" : "보기") + "</span>";
        }
        return;
      }
      var pattern = e.target.closest(".book-pattern");
      if (pattern) { var a = pattern.querySelector(".book-pattern-answer"); a.hidden = !a.hidden; }
    });
  };

  /* 보기 설정을 한 파트에 적용 */
  B.applyToPart = function (part, key, on) {
    part.dataset[key] = on ? "1" : "";
    if (key === "guide") {
      part.querySelectorAll(".book-item").forEach(function (u) { setGuide(u, on); });
      part.querySelectorAll(".book-brainstorm").forEach(function (b) { b.hidden = !on; });
    } else if (key === "translate") {
      part.querySelectorAll(".book-item, .book-item-unit, .book-message").forEach(function (u) { setTranslation(u, on); });
    } else if (key === "teacher") {
      part.querySelector(".book-teacher-guide").hidden = !on;
    }
  };
})(window.Book);
