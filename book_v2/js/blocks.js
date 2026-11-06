/* ======================================================================
   blocks.js — 파트 그리기 · 콘텐츠 블록 템플릿(교재 타입) · 항목 동작 · 보기 설정 적용
   ====================================================================== */
(function (B) {
  "use strict";
  var esc = B.esc, pad = B.pad, icon = B.icon;
  var rich = B.rich;                                                   // 콘텐츠 HTML 정리 (core.js)
  B.ANSWER_LABEL = { show: "정답 보기", hide: "정답 숨기기" };          // 2타입 정답 버튼 문구 (버튼 모양은 blocks.css .book-answer-btn)

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
  function chip(text) { return text ? '<p class="chip">' + esc(text) + "</p>" : ""; }
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

  /* 문장 판단 : 문장 부호(. ? ! 。 ？ ！)로 끝나거나 40자를 넘으면 문장. 태그 · 공백은 빼고 셈 */
  B.SENTENCE_LENGTH = 40;
  function isSentence(html) {
    var t = String(html || "").replace(/<[^>]*>/g, "").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
    return /[.?!。？！]["'”’)]?$/.test(t) || t.length > B.SENTENCE_LENGTH;
  }

  /* 블록 템플릿 — 키 = block.type. 교재 타입(ybmlms 1–13) 대응은 데이터_매칭.md */
  var RENDER = {
    words: function (p) {                                            // 1타입 : 항목 중 하나라도 문장이면 블록 전체를 문장 크기 · 한 줄 배치
      var sentence = p.items.some(function (w) { return isSentence(w[0]); });
      return '<div class="book-list' + (sentence ? ' is-sentence"' : '" data-columns="2"') + ">" + chip(p.label) + p.items.map(function (w, i) {
        return '<div class="book-item book-word"><div class="book-head">' + number(i + 1) + '<span class="book-word-text rich">' + rich(w[0]) + "</span>" + actions(["translate", "listen"]) + "</div>" +
          '<div class="book-indent">' + (w[1] ? '<p class="book-translation rich" hidden>' + rich(w[1]) + "</p>" : "") + "</div></div>";
      }).join("") + "</div>";
    },
    qa: function (p) {                                               // 2타입 듣고 해석하기 : [영문(강사), 한글 정답]
      return '<div class="book-list">' + p.items.map(function (t, i) {
        return '<div class="book-item book-listen"><div class="book-head">' + number(i + 1) + '<p class="book-listen-text rich">' + rich(t[0]) + "</p>" + actions(["listen"]) + "</div>" +
          (t[1] ? '<div class="book-indent"><button class="book-answer-btn" type="button" data-action="translate" aria-pressed="false">' + icon("eye") + '<span class="is-off">' + B.ANSWER_LABEL.show + '</span><span class="is-on">' + B.ANSWER_LABEL.hide + "</span></button>" +
          '<p class="book-translation book-answer rich" hidden>' + rich(t[1]) + "</p></div>" : "") + "</div>";
      }).join("") + "</div>";
    },
    ab: function (p) {                                               // 4타입 A/B : [A원문, A해석, B원문, B해석] — 칸 안의 "A : … <br> B : …" 그대로 표시
      function line(text, trans) { return text ? '<div class="book-qa-text-col"><p class="book-qa-text rich">' + rich(text) + "</p>" + (trans ? '<p class="book-translation rich" hidden>' + rich(trans) + "</p>" : "") + "</div>" : ""; }
      return '<div class="book-list">' + p.items.map(function (q, i) {
        return '<div class="book-item book-qa"><div class="book-qa-row">' + number(i + 1) + '<div class="book-qa-lines">' + line(q[0], q[1]) + line(q[2], q[3]) + "</div></div>" + actions(["translate", "listen"], "actions-row") + "</div>";
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
    dialogue: function (p) {                                         // 7타입 : [위치("gray" 왼쪽 · "blue" 오른쪽), 이름, 내용, 해석]
      return '<div class="book-dialogue">' + p.items.map(function (m) {
        var side = m[0] === "blue" || m[0] === "me" ? "me" : "teacher";
        return '<div class="book-message" data-speaker="' + side + '">' + (m[1] ? '<p class="book-message-name">' + esc(m[1]) + "</p>" : "") +
          '<div class="box book-message-bubble"><div class="book-message-text"><p class="book-read rich">' + rich(m[2]) + "</p>" + (m[3] ? '<p class="book-translation rich" hidden>' + rich(m[3]) + "</p>" : "") + "</div>" +
          actions(m[3] ? ["translate", "listen"] : ["listen"]) + "</div></div>";
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
    sentences: function (p) {                                        // 문장 목록 ①–⑥
      var circled = "①②③④⑤⑥⑦⑧⑨⑩";
      return (p.label ? '<div class="book-section-label">' + chip(p.label) + "</div>" : "") +
        '<div class="box book-sentence-grid">' + p.items.map(function (s, i) { return '<div class="book-read">' + (circled[i] || i + 1 + ".") + " " + esc(s) + "</div>"; }).join("") + "</div>";
    },
    picture: function (p) {                                          // 그림 + 브레인스토밍(가이드 켜면 노출)
      return picture(p.picture) + (p.brainstorm ? '<div class="book-brainstorm" hidden><p class="book-brainstorm-title">Brainstorming</p>' + p.brainstorm.map(function (g) {
        return '<div class="book-brainstorm-group"><h5>' + esc(g[0]) + "</h5>" + g[1].map(function (q) { return "<p>" + esc(q) + "</p>"; }).join("") + "</div>";
      }).join("") + "</div>" : "");
    },
    respond: function (p) {
      return scenarioBox(p.scenario) +
        '<div class="book-list">' + p.items.map(function (q, i) { return questionCard(p.firstQuestion + i, q[0], q[1], answerGuide(q[2], q[3]), true); }).join("") + "</div>";
    },
    survey: function (p) {
      return scenarioBox(p.scenario) + (p.picture ? picture(p.picture) : "") +
        '<div class="book-list">' + p.items.map(function (q, i) {
          return '<div class="book-item book-question" data-question="' + esc(q[0]) + '"><div class="book-question-row">' + question(p.firstQuestion + i) +
            '<p class="book-question-text book-question-body is-hidden-question">Listen to the question</p>' +
            '<button class="book-reveal-btn" type="button" data-reveal>' + icon("eye") + "<span>보기</span></button></div>" + answerGuide(q[1], q[2]) + "</div>";
        }).join("") + "</div>";
    },
  };

  /* 파트 그리기 : 파트 = [강사 가이드] + 블록들. 블록 = heading(블록 소제목) + 교재 타입 템플릿 */
  function renderBlock(b) {
    if (!RENDER[b.type]) { if (window.console) console.warn("[Book] 알 수 없는 블록 type:", b.type); return ""; }
    return '<div class="book-block" data-type="' + esc(b.type) + '">' + (b.heading ? '<span class="book-test-label">' + esc(b.heading) + "</span>" : "") + RENDER[b.type](b) + "</div>";
  }
  B.renderParts = function (main, parts) {
    main.innerHTML = parts.map(function (p, i) {
      return '<section class="book-part" data-part="' + (i + 1) + '" hidden><div class="book-part-body">' +
        (p.teacher ? '<div class="book-teacher-guide" hidden><p class="book-teacher-guide-title">강사 가이드</p><p class="book-teacher-guide-text">' + esc(p.teacher) + "</p></div>" : "") +
        (p.blocks || []).map(renderBlock).join("") + "</div></section>";
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
      var tg = part.querySelector(".book-teacher-guide");
      if (tg) tg.hidden = !on;
    }
  };
})(window.Book);
