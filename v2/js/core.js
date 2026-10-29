/* ======================================================================
   core.js — 공통 — YBMP 네임스페이스(블록 등록 · 실행) · 데모 데이터 접근 · 와옹이 이미지 맵 · 캐릭터 시스템 · 인터랙션 레이어
   YBMP.add 의 순번은 v1 실행 순서 — 바꾸지 말 것
   ====================================================================== */

/* YBMP : 화면 블록 등록 · 실행
   - 각 파일은 YBMP.add(순번, 이름, 함수) 로 블록을 등록만 한다.
   - 모든 스크립트를 읽은 뒤 YBMP.boot() 를 한 번 호출하면 순번대로 실행한다(파일 로드 순서와 무관).
   - 페이지에 없는 화면(예: B2B 에서 스케줄 미사용)의 블록이 오류를 내도 다른 블록은 계속 실행된다.
   - 데모 데이터는 window.YBMP_DEMO(data/demo.json) 를 YBMP.demo 로 읽는다. 개발 시 API 응답으로 교체. */
window.YBMP = window.YBMP || {};
(function(Y){
  var list = [], booted = false;
  Y.demo = window.YBMP_DEMO || {};
  Y.add = function(order, name, fn){ list.push({ order: order, name: name, fn: fn }); if (booted) run(list[list.length - 1]); };
  function run(b){ try { b.fn(); } catch (e) { if (window.console) console.error('[YBMP] ' + b.name, e); } }
  Y.boot = function(){ if (booted) return; booted = true; list.sort(function(a, b){ return a.order - b.order; }).forEach(run); };
})(window.YBMP);


/* 커리큘럼 레슨명 (데모) */
/* 시안3 : 레슨 데이터(커리큘럼 20강) — 과정 시작일(07.07)부터 주 2회 순서대로 */window.S3_LESSONS=YBMP.demo.lessons;window.s3LessonIdx=function(d,on){var n=0,x=new Date(2026,6,7),e=new Date(d.getFullYear(),d.getMonth(),d.getDate());if(!on){return 0;}while(x<e){if(on(new Date(x)).length)n++;x.setDate(x.getDate()+1);}return n%20;};

/* 와옹이 이미지 : 키 → images/wawong-N.png (교체는 이 한 곳) */
window.S3C = {
 "ai": "images/wawong-18.png",
 "book": "images/wawong-13.png",
 "calm": "images/wawong-9.png",
 "check": "images/wawong-21.png",
 "cheer": "images/wawong-29.png",
 "face": "images/wawong-5.png",
 "fire": "images/wawong-8.png",
 "great": "images/wawong-16.png",
 "heart": "images/wawong-30.png",
 "hmm": "images/wawong-24.png",
 "nervous": "images/wawong-11.png",
 "note": "images/wawong-7.png",
 "okcheck": "images/wawong-10.png",
 "paw": "images/wawong-32.png",
 "pawpink": "images/wawong-31.png",
 "plan": "images/wawong-25.png",
 "point": "images/wawong-2.png",
 "question": "images/wawong-15.png",
 "relax": "images/wawong-22.png",
 "retry": "images/wawong-20.png",
 "run": "images/wawong-3.png",
 "sad": "images/wawong-4.png",
 "seeyou": "images/wawong-26.png",
 "speak": "images/wawong-12.png",
 "teach": "images/wawong-27.png",
 "tired": "images/wawong-19.png",
 "up": "images/wawong-23.png",
 "video": "images/wawong-1.png",
 "write": "images/wawong-14.png",
 "yay": "images/wawong-6.png"
};  /* 와옹이 이미지 : 키 → images/wawong-N.png (교체는 이 한 곳) */

/* 시안3 (add_s3) — DOM 재배치 : 기존 기능(핸들러)은 그대로 두고 위치·라벨만 바꾼다 */

/* 인터랙션 레이어(add_motion) — 동작 설명은 add_motion.py 상단 참고 */
YBMP.add(240, '인터랙션 레이어(눌림 · 등장 · 반짝임)', function(){
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var doc = document;

  /* 1) 터치 피드백 */
  var TAP = 'button:not(:disabled), a[href], [role="button"], [role="tab"], .makeup-cal-cell';
  var pressed = null;
  function release(){ if (pressed){ pressed.classList.remove('mo-press'); pressed = null; } }
  doc.addEventListener('pointerdown', function(e){
    var el = e.target.closest(TAP); if (!el || el.getAttribute('aria-disabled') === 'true' && !el.id) return;
    el.classList.add('mo-tap'); if (el.offsetWidth > 280) el.classList.add('mo-big');
    pressed = el; el.classList.add('mo-press');
  }, true);
  ['pointerup','pointercancel','pointerleave','dragstart'].forEach(function(t){ doc.addEventListener(t, release, true); });
  doc.addEventListener('scroll', release, true);
  /* 방금 고른 항목만 한 번 톡 (목록이 다시 그려져도 같은 값을 찾아서) */
  var KEYS = ['data-t','data-day','data-block','data-slot','data-style','data-level','data-unit','data-key','data-time','data-env-tab'];
  doc.addEventListener('click', function(e){
    var el = e.target.closest('[' + KEYS.join('],[') + ']'); if (!el) return;
    var k = KEYS.filter(function(a){ return el.hasAttribute(a); })[0], val = el.getAttribute(k), host = el.parentElement;
    setTimeout(function(){
      var t = host && host.isConnected ? host.querySelector('[' + k + '="' + (window.CSS && CSS.escape ? CSS.escape(val) : val) + '"]') : null; t = t || (el.isConnected ? el : null);
      if (!t) return; var dot = t.querySelector('.makeup-num, .rt-box') || t;
      dot.classList.remove('mo-pop'); void dot.offsetWidth; dot.classList.add('mo-pop');
    }, 0);
  }, true);
  doc.addEventListener('animationend', function(e){ if (e.animationName === 'moPop') e.target.classList.remove('mo-pop'); });

  /* 2) 진입 모션 */
  var RV = ['#classroomBody > section:not(#reviewSection)', '.classroom-fb-list > *', '#scheduleBody > :not(.schedule-fab-wrap):not(#scAgendaSection)', '.schedule-agenda-list > *',
            '#scrollArea > :not(.timeline)', '.timeline > *', '#scheduleArea > :not(#scAgendaSection)'].join(',');
  var io = new IntersectionObserver(function(list){
    var shown = list.filter(function(x){ return x.isIntersecting; }).sort(function(a, b){ return a.boundingClientRect.top - b.boundingClientRect.top; });
    shown.forEach(function(x, i){ var el = x.target; el.style.transitionDelay = Math.min(i, 6) * 60 + 'ms'; el.classList.add('mo-in'); io.unobserve(el); setTimeout(function(){ el.style.transitionDelay = ''; el.classList.add('mo-done'); }, 1000); onReveal(el); });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  function arm(root){
    (root || doc).querySelectorAll(RV).forEach(function(el){ if (el.classList.contains('mo-rv') || (el.parentElement && el.parentElement.closest('.mo-rv'))) return; el.classList.add('mo-rv'); io.observe(el); });
  }
  function replay(){
    doc.querySelectorAll('.mo-rv.mo-in').forEach(function(el){ var r = el.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight){ el.classList.remove('mo-in', 'mo-done'); io.observe(el); } });
    arm();
  }
  arm();
  new MutationObserver(function(ms){ var need = false; ms.forEach(function(m){ if (m.addedNodes.length) need = true; }); if (need) arm(); })
    .observe(doc.body, { childList:true, subtree:true });
  doc.addEventListener('click', function(e){
    if (e.target.closest('#courseStatusTabs button, .classroom-tabs button, .classroom-bottom-nav button, .bottom-nav button, #courseScroll button')) setTimeout(function(){ replay(); scrollHint(true); }, 40);
    if (e.target.closest('#rtBack, #mkBackBtn')){ var b = e.target.closest('.modal'); var body = b && b.querySelector('.modal-body'); if (body){ body.classList.add('mo-back'); setTimeout(function(){ body.classList.remove('mo-back'); }, 350); } }
  }, true);

  /* 탭 밑줄 미끄러짐 (::after 밑줄을 쓰는 탭만) */
  function indFor(tabs){
    var on = tabs.querySelector(':scope > button.on, :scope > button[aria-selected="true"]'); if (!on) return;
    var ind = tabs.querySelector(':scope > .mo-ind');
    if (!ind){ var bg = getComputedStyle(on, '::after').backgroundColor; if (!bg || getComputedStyle(on, '::after').content === 'none') return;
      ind = doc.createElement('span'); ind.className = 'mo-ind'; ind.style.background = bg; tabs.appendChild(ind); tabs.classList.add('mo-has-ind'); }
    ind.style.scale = (on.offsetWidth / 100) + ' 1'; ind.style.translate = on.offsetLeft + 'px 0';
  }
  function allInd(){ doc.querySelectorAll('.tabs:not(.classroom-tabs)').forEach(function(t){ if (t.offsetParent) indFor(t); }); }
  doc.addEventListener('click', function(e){ if (e.target.closest('.tabs')) setTimeout(allInd, 0); });
  addEventListener('resize', allInd); setTimeout(allInd, 300);
  var indRaf = 0; new MutationObserver(function(){ if (!indRaf) indRaf = requestAnimationFrame(function(){ indRaf = 0; allInd(); }); }).observe(doc.body, { attributes:true, subtree:true, attributeFilter:['hidden'] });

  /* 3) 스크롤 유도 */
  function scroller(){ var a = doc.querySelector('#scheduleArea'); if (a && a.offsetParent) return a; a = doc.querySelector('#scrollArea'); if (a && a.offsetParent) return a; return null; }
  var nav = doc.querySelector('.classroom-bottom-nav, .bottom-nav');
  var fade = doc.createElement('div'); fade.className = 'mo-fade'; doc.body.appendChild(fade);
  var more = doc.createElement('button'); more.type = 'button'; more.className = 'mo-more'; more.setAttribute('aria-label', '아래로 더 보기');
  more.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  doc.body.appendChild(more);
  var hinted = {}, hintT = 0, scrolledOnce = false, bgCache = null, lastKey = '';
  function metrics(){
    var sc = scroller(), top, max, bottomEdge, frame;
    if (sc){ top = sc.scrollTop; max = sc.scrollHeight - sc.clientHeight; var r = sc.getBoundingClientRect(); bottomEdge = r.bottom; frame = r; }
    else { top = scrollY; max = doc.documentElement.scrollHeight - innerHeight; bottomEdge = nav ? nav.getBoundingClientRect().top : innerHeight; frame = (doc.querySelector('.classroom-app') || doc.body).getBoundingClientRect(); }
    return { sc:sc, top:top, max:max, bottom:bottomEdge, frame:frame };
  }
  function bgOf(el){ for (var e = el; e; e = e.parentElement){ var c = getComputedStyle(e).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; } return '#fff'; }
  function update(){
    var m = metrics(), left = Math.max(0, m.frame.left), w = Math.min(innerWidth, m.frame.right) - left;
    var overlay = doc.querySelector('.modal-overlay:not([hidden]), .mic-test-overlay:not([hidden]), .perm:not([hidden]), .splash:not([hidden]), .push-screen:not([hidden]), .call-screen:not([hidden])');
    var hasMore = !overlay && m.max - m.top > 24;
    var bg = bgCache || (bgCache = bgOf(m.sc || doc.querySelector('.classroom-body') || doc.body));
    var key = left + '|' + w + '|' + m.bottom + '|' + bg; if (key !== lastKey){ lastKey = key;
    fade.style.left = left + 'px'; fade.style.width = w + 'px'; fade.style.right = 'auto';
    fade.style.top = (m.bottom - 44) + 'px'; fade.style.background = 'linear-gradient(to bottom, ' + bg.replace('rgb(', 'rgba(').replace(')', ', 0)') + ', ' + bg + ')';
    more.style.top = (m.bottom - 52) + 'px'; more.style.left = (left + w / 2) + 'px'; }
    if (fade.classList.contains('on') !== hasMore) fade.classList.toggle('on', hasMore);
    if (!hasMore || m.top > 40) more.classList.remove('on', 'hop');
    var bar = doc.querySelector('.classroom-status-bar') && doc.querySelector('.classroom-status-bar').offsetParent ? doc.querySelector('.classroom-status-bar') : (doc.querySelector('.topbar-sticky') || doc.querySelector('.classroom-topbar'));
    doc.querySelectorAll('.mo-scrolled').forEach(function(x){ if (x !== bar) x.classList.remove('mo-scrolled'); });
    if (bar) bar.classList.toggle('mo-scrolled', m.top > 4);
    doc.querySelectorAll('.modal-overlay:not([hidden]) .modal-body').forEach(function(b){ b.classList.toggle('mo-more-below', b.scrollHeight - b.clientHeight - b.scrollTop > 16); });
  }
  function scrollHint(reset){
    clearTimeout(hintT); more.classList.remove('on', 'hop');
    var key = (scroller() || doc.querySelector('main:not([hidden])') || {}).id || 'page';
    if (hinted[key] && !reset) return;
    hintT = setTimeout(function(){
      var m = metrics(); if (m.top > 40 || m.max < 120 || hinted[key]) return;
      if (doc.querySelector('.modal-overlay:not([hidden]), .mic-test-overlay:not([hidden]), .popup-overlay.open, .perm:not([hidden]), .splash:not([hidden])')) return;
      hinted[key] = true; update(); more.classList.add('on', 'hop');
      setTimeout(function(){ more.classList.remove('on', 'hop'); }, 4200);
    }, 2400);
  }
  more.addEventListener('click', function(){ var m = metrics(), d = Math.round(innerHeight * 0.55); if (m.sc) m.sc.scrollBy({ top:d, behavior:'smooth' }); else scrollBy({ top:d, behavior:'smooth' }); more.classList.remove('on', 'hop'); });
  var raf = 0; function onScroll(){ if (!raf) raf = requestAnimationFrame(function(){ raf = 0; update(); }); }
  doc.addEventListener('scroll', onScroll, true); addEventListener('resize', onScroll);
  new MutationObserver(function(){ bgCache = null; onScroll(); }).observe(doc.body, { attributes:true, subtree:true, attributeFilter:['hidden'] });
  setInterval(function(){ bgCache = null; update(); }, 1200); update(); scrollHint();

  /* 4) 클릭 유도 */
  function shine(btn){
    if (!btn) return; btn.classList.add('mo-shine-host');
    var old = btn.querySelector(':scope > .mo-shine'); if (old) old.remove();
    var s = doc.createElement('span'); s.className = 'mo-shine'; s.setAttribute('aria-hidden', 'true'); btn.appendChild(s);
    setTimeout(function(){ s.remove(); }, 1300);
  }
  function ready(b){ return b && (b.getAttribute('data-state') === 'open' || b.classList.contains('is-ready')); }
  ['heroCta', 'enterClassBtn'].forEach(function(id){
    var b = doc.getElementById(id); if (!b) return; var was = ready(b);
    if (was) setTimeout(function(){ shine(b); }, 700);
    new MutationObserver(function(){ var r = ready(b); if (r && !was) shine(b); was = r; }).observe(b, { attributes:true, attributeFilter:['data-state','class'] });
  });
  var nudged = false;
  function onReveal(el){
    if (nudged || !el.matches('#prepBlock')) return; nudged = true;
    setTimeout(function(){
      var st = Array.prototype.filter.call(doc.querySelectorAll('.classroom-step'), function(x){ return !x.hidden && x.getAttribute('data-completed') !== 'true'; })[0];
      var mk = st && st.querySelector('.classroom-step-marker');
      if (mk){ mk.classList.add('mo-mark'); setTimeout(function(){ mk.classList.remove('mo-mark'); }, 1100); }
    }, 350);
  }
  doc.querySelectorAll('.modal-foot .btn[data-variant="primary"]').forEach(function(b){
    var was = b.disabled;
    new MutationObserver(function(){ if (was && !b.disabled){ b.classList.remove('mo-pop'); void b.offsetWidth; b.classList.add('mo-pop'); } was = b.disabled; }).observe(b, { attributes:true, attributeFilter:['disabled'] });
  });
});

YBMP.add(260, '시안4 레이아웃 재배치(클래스룸 · 스케줄 · 리포트)', function(){
  var I = {"att": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15\" rx=\"3\"/><path d=\"M8 3v4M16 3v4M3.5 10h17\"/><path d=\"M9 15l2 2 4-4\"/></svg>", "cal": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15\" rx=\"3\"/><path d=\"M8 3v4M16 3v4M3.5 10h17\"/></svg>", "qa": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z\"/><path d=\"M10 9.5a2 2 0 1 1 2.6 1.9c-.4.1-.6.5-.6.9v.2M12 14.5h.01\"/></svg>", "sat": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8.5 14.5a4.5 4.5 0 0 0 7 0\"/><path d=\"M9 9.5h.01M15 9.5h.01\"/></svg>", "cor": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 4l6 6L9 21H3v-6z\"/><path d=\"M12 6l6 6\"/></svg>"};
  var $ = function(s, r){ return (r || document).querySelector(s); };
  /* 1) 출석현황 · 스케줄 버튼에 글자 */
  var att = $('#attOpenBtn');
  var acts = att ? att.parentNode.querySelectorAll('.live-act') : [];
  [].forEach.call(acts, function(b){
    var isAtt = b === att; b.innerHTML = (isAtt ? I.att : I.cal) + '<span class="s3-lb">' + (isAtt ? '출석' : '일정') + '</span>';
  });
  /* 3) 스케줄 : 연기/보강 현황 · 수업 루틴 변경 → 달력 카드 안 */
  var card = $('.schedule-topbar-card'), ql = $('#scQuicklinks');
  if (card && ql){
    ql.classList.add('s3-ql');
    card.appendChild(ql);
  }
  /* 5) 월말 리포트 카드 : 장식 아이콘·링크 박스 → 기간 칩 + 항목별 막대 */
  var rep = $('#tileReport');
  if (rep && !rep.querySelector('.s3-bars')){
    var chip = rep.querySelector('.home-chip'); if (chip) chip.textContent = '월말 리포트 · 07.01–07.31';
    var top = rep.querySelector('.home-card-top');
    if (top) top.insertAdjacentHTML('beforeend', '<svg class="s3-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>');
    var inner = rep.querySelector('.home-inner'); if (inner) inner.remove();
    var D = [['이해력',10],['유창성',8],['발음',6],['어휘',4],['문법',4]], mx = Math.max.apply(null, D.map(function(d){ return d[1]; }));
    rep.insertAdjacentHTML('beforeend', '<span class="s3-bars">' + D.map(function(d){
      return '<span class="s3-bar' + (d[1] === mx ? ' top' : '') + '"><b>' + d[1] + '</b><i style="--h:' + (d[1] * 10) + '%"></i><span>' + d[0] + '</span></span>';
    }).join('') + '</span>');
    /* 화면에 들어오면 막대가 아래에서 차오름 (한 번만) */
    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ rep.classList.add('s3-on'); io.disconnect(); } }); }, { threshold:.4 });
      io.observe(rep);
    } else rep.classList.add('s3-on');
  }
  /* 4) 주간 : 이전/다음 주 화살표를 날짜 줄 양옆 / 월간 : 연월 옆으로 되돌림 */
  var strip = $('#scWeekStrip'), prev = $('#scPrevBtn'), next = $('#scNextBtn'), nav = prev && prev.parentNode, month = $('#scMonthCalendar');
  if (strip && prev && next){
    var row = document.createElement('div'); row.className = 's3-strip-row'; strip.parentNode.insertBefore(row, strip);
    row.appendChild(strip);
    function place(){
      var isMonth = month && !month.hidden;
      if (isMonth){ nav.appendChild(prev); nav.appendChild(next); }
      else { row.insertBefore(prev, strip); row.appendChild(next); }
      /* 메뉴 : 월간이면 달력 그리드 바로 아래(안내·Class Report 위), 주간이면 날짜 줄 아래 */
      var foot = month && month.querySelector('.schedule-month-foot');
      if (ql){ if (isMonth && foot) foot.parentNode.insertBefore(ql, foot); else card.appendChild(ql); }
    }
    place(); if (month) new MutationObserver(place).observe(month, { attributes:true, attributeFilter:['hidden'] });
  }
});

/* 캐릭터 시스템 — 이미지 교체는 window.S3C 한 곳 */
YBMP.add(290, '와옹이 캐릭터 시스템', function(){
  var C = window.S3C || {}, $ = function(q, r){ return (r || document).querySelector(q); };
  document.documentElement.classList.add('s3-ch-wy');
  function img(k, cls){ return '<img class="s3-c ' + (cls || 'pop') + '" data-k="' + k + '" src="' + C[k] + '" alt="">'; }
  function iconTo(el, k){ if (!el || el.classList.contains('s3-ci')) return; el.classList.add('s3-ci'); el.innerHTML = img(k); }

  /* 1) 입장 카드 : 수업 상태별 — 60분 이상 커피 / 60분 이내 손 흔들기 / 입장 가능 달리기 / 수업 시작 후 화상수업 */
  var live = $('#liveCard'), btn = $('#enterClassBtn'), go = $('#enterGoTime');
  var ch = live && $('.s3-char', live);
  function liveKey(){
    if (!btn) return 'seeyou';
    if (btn.classList.contains('is-far')) return 'relax';
    if (btn.classList.contains('is-ready')) return (go && go.hidden) ? 'video' : 'cheer';
    return 'seeyou';
  }
  function syncLive(){
    if (!ch) return; var k = liveKey();
    if (ch.getAttribute('data-k') === k) return;
    ch.setAttribute('data-k', k); ch.src = C[k];
    ch.style.animation = 'none'; void ch.offsetWidth; ch.style.animation = '';
  }
  if (ch){ ch.setAttribute('data-k', ''); syncLive(); new MutationObserver(syncLive).observe(btn, { attributes:true, subtree:true, attributeFilter:['class','hidden'] }); }

  /* 2) 완료 · 축하 */
  var pb = $('#prepBlock'), enc = pb && $('.classroom-prep-encourage', pb);
  if (enc){
    enc.insertAdjacentHTML('afterbegin', '<img class="s3-c s3-prep-done" data-k="great" src="' + C.great + '" alt="">');
    var prog = $('#s3PrepProgress', pb);
    var syncPrep = function(){ var m = (prog.textContent || '').match(/(\d+)\/(\d+)/); pb.classList.toggle('s3-all-done', !!m && m[1] === m[2]); };
    syncPrep(); new MutationObserver(syncPrep).observe(prog, { childList:true, characterData:true, subtree:true });
  }
  iconTo($('#satSuccessView .modal-result-icon'), 'heart');
  iconTo($('#satLockedView .modal-result-icon'), 'heart');
  iconTo($('#qaSuccessView .modal-result-icon'), 'heart');

  /* 3) 기능 카드 */
  /* 예습 로드맵 : 기존 캐릭터 3개를 와옹이로 교체(추가 X) */
  [['lesson','book'],['review','write'],['ai','ai']].forEach(function(a){ var m = $('#prepBlock [data-step-id="' + a[0] + '"] .classroom-step-marker img'); if (m){ m.src = C[a[1]]; m.classList.add('s3-wy'); } });

  /* 탭하면 점프 + 반짝 (입장 카드 · 예습 완료 · 빈 스케줄 · 리포트 UP) */
  function spark(el){
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .35, cls = ['', 'p', 'r'];
    for (var i = 0; i < 8; i++){
      var a = Math.PI * 2 * i / 8 + Math.random() * .4, d = 34 + Math.random() * 20, sp = document.createElement('i');
      sp.className = 's3-spark ' + cls[i % 3]; sp.style.left = cx + 'px'; sp.style.top = cy + 'px';
      sp.style.setProperty('--dx', Math.cos(a) * d + 'px'); sp.style.setProperty('--dy', Math.sin(a) * d + 'px');
      document.body.appendChild(sp); setTimeout(function(n){ return function(){ n.remove(); }; }(sp), 760);
    }
  }
  function hop(el){ el.classList.remove('s3-hop'); void el.offsetWidth; el.classList.add('s3-hop'); spark(el); setTimeout(function(){ el.classList.remove('s3-hop'); }, 650); }
  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('.s3-char, .s3-prep-done, .s3-empty > .s3-c');
    if (!t) return; e.stopPropagation(); e.preventDefault(); hop(t);
  }, true);
  /* 상태가 바뀔 때도 반짝 */
  if (ch) new MutationObserver(function(){ spark(ch); }).observe(ch, { attributes:true, attributeFilter:['data-k'] });
  /* 리포트 카드 : 막대 왼쪽 + UP 와옹이 오른쪽 */
  var bars = $('#tileReport .s3-bars');
  if (bars && !bars.parentNode.classList.contains('s3-rep-row')){
    var row = document.createElement('span'); row.className = 's3-rep-row'; bars.parentNode.insertBefore(row, bars); row.appendChild(bars);
    row.insertAdjacentHTML('beforeend', '<span class="s3-up-wrap"><img src="' + C.up + '" alt=""></span>');
  }
  /* 팝업 캐릭터 */
  iconTo($('#mkConfirmOverlay .modal-result-icon'), 'seeyou');
  iconTo($('#rtDoneOverlay .modal-result-icon'), 'great');
  iconTo($('#rtAlertOverlay .modal-result-icon'), 'point');
  iconTo($('#popupOverlay .popup-icon-wrap'), 'speak');
  var NOTICE = function(t){ return /새 버전/.test(t) ? 'up' : 'point'; }; /* 40 선택 업데이트만 UP(wawong-23), 41 강제 업데이트 · 43 점검 · 42 공지는 wawong-2 */
  var ni = $('#noticeIcon'), nt = $('#noticeTitle');
  if (ni && nt){
    var fixN = function(){ var k = NOTICE(nt.textContent); var cur = $('.s3-c', ni); if (cur && cur.getAttribute('data-k') === k) return; ni.classList.add('s3-ci'); ni.innerHTML = img(k); };
    fixN(); new MutationObserver(fixN).observe(nt, { childList:true, characterData:true, subtree:true });
  }
  var dlg = $('#scDlg'), dt = $('#scDlgTitle');
  if (dlg && dt){
    var DLG = { '연기 신청':'hmm', '보강 신청':'plan', '연기 취소':'hmm', '보강 취소':'hmm', '안내사항':'point', '설정 가이드':'point', '장치 테스트 정보':'point', '수업 콜 수신':'point', '알림 허용':'point', '알림 및 리마인더 권한 필요':'point' };
    var dc = document.createElement('img'); dc.className = 's3-c s3-dlg-c'; dc.alt = ''; dc.hidden = true;
    var card = $('.dialog-card', dlg); card.insertBefore(dc, card.firstChild);
    var fixD = function(){ var k = DLG[dt.textContent.trim()]; dc.hidden = !k; card.classList.toggle('s3-has-c', !!k); if (k && dc.getAttribute('data-k') !== k){ dc.setAttribute('data-k', k); dc.src = C[k]; } if (k){ dc.style.animation = 'none'; void dc.offsetWidth; dc.style.animation = ''; } };
    fixD(); new MutationObserver(fixD).observe(dt, { childList:true, characterData:true, subtree:true });
    new MutationObserver(function(){ if (!dlg.hidden) fixD(); }).observe(dlg, { attributes:true, attributeFilter:['hidden'] });
  }
  /* 출석현황 : 달리는 캐릭터 · 도장 · 배지 */
  var steps = document.getElementById('attSteps');
  function decorateAtt(){
    if (!steps) return;
    var fill = document.getElementById('attStepsFill'), n = parseInt((document.getElementById('attStreakN') || {}).textContent, 10) || 0;
    var m = (fill && fill.style.transform || '').match(/scaleX\(([\d.]+)\)/), ratio = m ? parseFloat(m[1]) : 0;
    var k = n === 0 ? 'sad' : n >= 30 ? 'fire' : ([3, 7, 14].indexOf(n) > -1 ? 'yay' : 'run');
    var r = steps.querySelector('.s3-runner');
    if (!r){ r = document.createElement('span'); r.className = 's3-runner'; r.innerHTML = '<img alt="">'; steps.appendChild(r); steps.classList.add('s3-has-run'); }
    r.setAttribute('data-k', k); r.querySelector('img').src = C[k]; r.classList.remove('arrived');
    r.style.transition = 'none'; r.style.left = '0%'; void r.offsetWidth; r.style.transition = '';
    requestAnimationFrame(function(){ r.style.left = (ratio * 100) + '%'; setTimeout(function(){ r.classList.add('arrived'); }, 1300); });
    /* 출석 = 발바닥 도장 / 연기·SKIP = 시무룩 / 결석 = 울먹 (와옹이) */
    var MARK = { attend:'paw', postpone:'sad', skip:'sad', absent:'nervous' };
    /* 데모 : 이번 달에 결석 표시가 하나도 없으면 가장 앞의 지난 출석일을 결석으로 (결석 표현 확인용) */
    if (!document.querySelector('#attCalGrid .st-absent')){
      var fa = document.querySelector('#attCalGrid .st-attend');
      if (fa){ fa.classList.remove('st-attend'); fa.classList.add('st-absent'); fa.setAttribute('data-st', 'absent'); }
    }
    [].forEach.call(document.querySelectorAll('#attCalGrid .class-day'), function(c, i){
      c.style.setProperty('--i', i);
      var k = MARK[c.getAttribute('data-st')];
      var old = c.querySelector('.s3-paw'); if (old) old.remove();
      var num = c.querySelector('.makeup-num');
      if (k && num) num.insertAdjacentHTML('beforeend', '<img class="s3-paw s3-m-' + k + '" src="' + C[k] + '" alt="">');
    });
  }
  var attOv = document.getElementById('attOverlay');
  if (attOv) new MutationObserver(function(){ if (!attOv.hidden) setTimeout(decorateAtt, 30); }).observe(attOv, { attributes:true, attributeFilter:['hidden','class'] });
  document.addEventListener('click', function(e){
    var r = e.target.closest && e.target.closest('.s3-runner'); if (r){ hop(r.querySelector('img')); return; }
    var b = e.target.closest && e.target.closest('.att-badge'); if (!b) return;
    var md = b.querySelector('.att-medal'); if (!md) return;
    if (b.classList.contains('on')) hop(md); else { md.classList.remove('s3-shake'); void md.offsetWidth; md.classList.add('s3-shake'); }
  });
  /* 예습 로드맵
     ① 발자국 : 한 단계를 완료하고 다음 단계로 넘어갈 때만, 그 구간을 한 번 걸어감(지나간 자국은 서서히 사라짐) — 시안4
     ② 예습 유도 : 아직 하나도 안 했을 때 첫 단계 캐릭터에 효과. 수업이 가까울수록 강하게
        60분 이상 남음 → 조용한 펄스 링 / 60분 이내 → 펄스 + 통통(3번 하고 쉼) + 말풍선 / 5분 이내 → 더 자주 + 다급한 말풍선 */
  (function(){
    var flow = document.getElementById('flow'), path = flow && flow.querySelector('svg.link path'); if (!path) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var steps = [].slice.call(flow.querySelectorAll('.classroom-step'));
    var layer = document.createElement('div'); layer.className = 's3-steps-layer'; flow.insertBefore(layer, flow.firstChild);
    function lenAt(marker){
      var svg = path.ownerSVGElement, vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect(), m = marker.getBoundingClientRect();
      var sx = vb && vb.width ? vb.width / r.width : 1, sy = vb && vb.height ? vb.height / r.height : 1;
      var tx = (m.left + m.width / 2 - r.left) * sx, ty = (m.bottom - 4 - r.top) * sy, len = path.getTotalLength(), best = 0, bd = 1e9;
      for (var L = 0; L <= len; L += 4){ var p = path.getPointAtLength(L), d = (p.x - tx) * (p.x - tx) + (p.y - ty) * (p.y - ty); if (d < bd){ bd = d; best = L; } }
      return best;
    }
    function walk(a, b){
      if (reduce) return;
      var from = lenAt(a.querySelector('.classroom-step-marker')) + 18, to = lenAt(b.querySelector('.classroom-step-marker')) - 14, pos = from, side = 1;
      (function step(){
        if (pos > to) return;
        var p = path.getPointAtLength(pos), q = path.getPointAtLength(pos + 2), ang = Math.atan2(q.y - p.y, q.x - p.x);
        var svg = path.ownerSVGElement, vb = svg.viewBox.baseVal, r = svg.getBoundingClientRect(), fr = flow.getBoundingClientRect();
        var sx = vb && vb.width ? r.width / vb.width : 1, sy = vb && vb.height ? r.height / vb.height : 1;
        var nx = -Math.sin(ang) * 6 * side, ny = Math.cos(ang) * 6 * side;
        var el = document.createElement('i'); el.className = 's3-pawstep'; el.style.backgroundImage = 'url(' + C.pawpink + ')';
        el.style.left = (r.left - fr.left + (p.x + nx) * sx) + 'px'; el.style.top = (r.top - fr.top + (p.y + ny) * sy) + 'px';
        el.style.rotate = (ang * 180 / Math.PI + 90) + 'deg';
        layer.appendChild(el); setTimeout(function(){ el.remove(); }, 2300);
        side = -side; pos += 36; setTimeout(step, 280);
      })();
    }
    steps.forEach(function(st, i){
      new MutationObserver(function(){
        if (st.getAttribute('data-completed') === 'true' && !st._walked){ st._walked = true; var nx = steps[i + 1]; if (nx) setTimeout(function(){ walk(st, nx); }, 420); }
      }).observe(st, { attributes:true, attributeFilter:['data-completed'] });
    });
    /* ② 예습 유도 */
    var btn = document.getElementById('enterClassBtn'), td = document.getElementById('timeDisplay'), first = steps[0], mk = first && first.querySelector('.classroom-step-marker');
    if (!mk) return;
    var bub = document.createElement('span'); bub.className = 's3-nudge-bub'; bub.hidden = true; mk.appendChild(bub);
    var hopT = null, hopN = 0;
    function level(){ if (!btn || btn.classList.contains('is-far')) return 1; if (btn.classList.contains('is-ready')) return 3; return 2; }
    function started(){ return steps.some(function(s){ return s.getAttribute('data-completed') === 'true'; }); }
    function text(lv){
      if (lv === 3) return '곧 수업! 교재만 빠르게 볼까?';
      var m = (td && td.textContent.match(/(\d+):(\d+)/)), min = m ? +m[1] : 0;
      return min >= 1 ? min + '분 전! 교재 먼저 볼까?' : '교재 먼저 볼까?';
    }
    function hop(){ var img = mk.querySelector('img'); if (!img) return; img.classList.remove('s3-hop'); void img.offsetWidth; img.classList.add('s3-hop'); setTimeout(function(){ img.classList.remove('s3-hop'); }, 650); }
    function nudge(){
      clearTimeout(hopT);
      if (started()){ mk.classList.remove('s3-nudge', 's3-nudge-2', 's3-nudge-3'); bub.hidden = true; return; }
      var lv = level();
      mk.classList.add('s3-nudge'); mk.classList.toggle('s3-nudge-2', lv >= 2); mk.classList.toggle('s3-nudge-3', lv === 3);
      bub.hidden = true; /* 말풍선은 과해서 사용 안 함(10/15) */
      if (lv >= 2 && !reduce){
        var gap = lv === 3 ? 2200 : 4000;
        (function loop(){ hopN++; hop(); hopT = setTimeout(loop, hopN % 3 === 0 ? (lv === 3 ? 5000 : 10000) : gap); })();
      }
    }
    /* 예습 유도(링·점프·말풍선)는 과해서 사용 안 함(10/15) */
    
  })();
  /* 로딩 : 와옹이 여러 컷이 번갈아 — window.s3Loader(부모요소) 로 어디든 붙일 수 있음 */
  window.s3Loader = function(host){
    var keys = ['speak','book','write','ai','great','cheer'], box = document.createElement('div');
    box.className = 's3-loader'; box.innerHTML = keys.map(function(k, i){ return '<img src="' + C[k] + '" alt=""' + (i ? '' : ' class="on"') + '>'; }).join('');
    var dots = document.createElement('div'); dots.className = 's3-loader-dots'; dots.innerHTML = '<i></i><i></i><i></i>';
    host.appendChild(box); if (!host.querySelector('[class*=dot]')) host.appendChild(dots);
    var n = 0, imgs = box.querySelectorAll('img');
    setInterval(function(){ if (!box.offsetParent) return; imgs[n].classList.remove('on'); n = (n + 1) % imgs.length; imgs[n].classList.add('on'); }, 650);
  };
  var sp = document.getElementById('splash'); if (sp && !sp.querySelector('.s3-loader')) window.s3Loader(sp);
  /* 4) 빈 화면 */
  /* 빈 화면(제공되는 내용이 없을 때) : 엎드린 캐릭터 + 문구 — 스케줄 · 질문 내역 · AI 히스토리 · 보강 시간 · 연기/스킵 현황 · 교재 없음 */
  var EMPTY = '.schedule-agenda-empty, .qa-history-empty, .ai-history-list-empty, .makeup-slot-empty, .makeup-status-empty, #rtBookList > .makeup-guide:only-child';
  var emptyQ = 0;
  function fixEmpty(){ emptyQ = 0; [].forEach.call(document.querySelectorAll(EMPTY), function(e){ if (!e.querySelector('.s3-c')){ e.classList.add('s3-empty'); e.insertAdjacentHTML('afterbegin', img('point')); } }); }
  fixEmpty(); new MutationObserver(function(){ if (!emptyQ) emptyQ = requestAnimationFrame(fixEmpty); }).observe(document.body, { childList:true, subtree:true });
});
