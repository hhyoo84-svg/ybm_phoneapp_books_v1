/* ======================================================================
   classroom.js — 클래스룸 — 입장 카드 · 예습 · 강좌 스와이프 · 예정/종료 탭
   YBMP.add 의 순번은 v1 실행 순서 — 바꾸지 말 것
   ====================================================================== */

YBMP.add(10, '입장 카드 카운트다운 · 예습 유도 팝업', function(){
  "use strict";
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 라이브 카드 카운트다운 + 예습 유도 팝업 (시안2 로직 유지) ---------- */
  var state = { seconds:343, urgentAt:60, prepDone:false, popupShown:false, timerId:null };
  var timeDisplay = document.getElementById('timeDisplay');
  var liveCard = document.getElementById('liveCard');
  var enterBtn = document.getElementById('enterClassBtn');
  var popupOverlay = document.getElementById('popupOverlay');
  var popupTime = document.getElementById('popupTime');

  function fmt(s){ s = Math.max(0,s); var m = Math.floor(s/60), r = s%60; return (m<10?'0':'')+m+':'+(r<10?'0':'')+r; }
  /* 입장 버튼 4단계(26p): >60분 "오늘 19:30 수업 · 5분 전부터 입장" / ≤60분 "수업 시작까지 42:10"
     → ≤5분 "강의실 입장하기 04:59"(활성) → 시작 후 "강의실 입장하기". 입장 전 탭은 토스트로 안내 */
  var ENTER_OPEN_AT = 5 * 60, ENTER_COUNT_AT = 60 * 60;
  function startTime(){ var m = (document.getElementById('liveWhen') || {}).textContent; m = m && m.match(/\d{1,2}:\d{2}/); return m ? m[0] : ''; }
  function render(){
    var far = state.seconds > ENTER_COUNT_AT, ready = state.seconds <= ENTER_OPEN_AT;
    enterBtn.classList.toggle('is-far', far);
    enterBtn.querySelector('.enter-btn-label').textContent = far ? '오늘 ' + startTime() + ' 수업' : '수업 시작까지';
    timeDisplay.textContent = far ? '5분 전부터 입장' : fmt(state.seconds);
    popupTime.textContent = fmt(state.seconds);
    liveCard.classList.toggle('urgent', state.seconds<=state.urgentAt && state.seconds>0);
    if (enterBtn.classList.contains('is-ready') !== ready){
      enterBtn.classList.toggle('is-ready', ready);
      enterBtn.classList.toggle('is-wait', !ready);
      enterBtn.querySelector('.enter-btn-wait').hidden = ready;
      enterBtn.querySelector('.enter-btn-go').hidden = !ready;
    }
    var gt = document.getElementById('enterGoTime');
    gt.textContent = state.seconds > 0 ? fmt(state.seconds) : ''; gt.hidden = state.seconds <= 0;
  }

  var enterToastEl = null, enterToastT = 0;
  function enterToast(hold){
    if (!enterToastEl){ enterToastEl = document.createElement('div'); enterToastEl.className = 'enter-toast'; enterToastEl.setAttribute('role', 'status'); document.body.appendChild(enterToastEl); }
    enterToastEl.textContent = '수업 시작 5분 전부터 강의실에 입장할 수 있어요';
    var nav = document.querySelector('.classroom-bottom-nav, .bottom-nav'), r = nav && nav.getBoundingClientRect();
    enterToastEl.style.bottom = (r && r.height ? Math.max(16, window.innerHeight - r.top + 16) : 96) + 'px';
    clearTimeout(enterToastT); enterToastEl.classList.add('show');
    if (!hold) enterToastT = setTimeout(function(){ enterToastEl.classList.remove('show'); }, 2200);
  }

  enterBtn.addEventListener('click', function(){ if (!enterBtn.classList.contains('is-ready')) enterToast(); });
  /* 화면 목록용: 남은 초를 지정해 상태를 고정해서 본다 */
  window.enterDemo = function(sec, tap){ state.seconds = sec; state.popupShown = true; render(); if (tap) enterToast(true); };

  function tick(){
    if (state.seconds>0) state.seconds--;
    render();
    if (state.seconds<=state.urgentAt && state.seconds>0 && !state.prepDone && !state.popupShown) openPopup();
  }
  function openPopup(){ state.popupShown = true; popupOverlay.classList.add('open'); }
  function closePopup(){ popupOverlay.classList.remove('open'); }

  /* 예습 단계 완료 — 사전 학습(review)을 마치면 예습 유도 팝업을 띄우지 않는다 */
  function setStepDone(stepEl, done){
    if (stepEl && stepEl.getAttribute('data-step-id') === 'review') state.prepDone = done;
  }
  window.__setStepDone = setStepDone;

  function attn(el){ el.classList.remove('attn'); void el.offsetWidth; el.classList.add('attn'); setTimeout(function(){ el.classList.remove('attn'); }, reduceMotion?0:2100); }

  document.getElementById('startPrepBtn').addEventListener('click', function(){
    closePopup();
    var block = document.getElementById('prepBlock'), rv = block && block.querySelector('.classroom-step[data-step-id="review"]');
    setTimeout(function(){
      if (block) block.scrollIntoView({behavior: reduceMotion?'auto':'smooth', block:'center'});
      setTimeout(function(){ setStepDone(rv, true); }, reduceMotion?0:900);
    }, 250);
  });
  document.getElementById('skipPrepBtn').addEventListener('click', function(){
    closePopup();
    document.getElementById('scrollArea').scrollTo({top:0, behavior: reduceMotion?'auto':'smooth'});
    setTimeout(function(){ attn(enterBtn); }, 300);
  });


  render();
  state.timerId = setInterval(tick, 1000);

  /* 상태 탭(수강중/예정/종료) 인디케이터 이동 */
  document.querySelectorAll('[data-rc-tabs]').forEach(function(group){
    var buttons = Array.prototype.slice.call(group.querySelectorAll('button[data-i]'));
    var ind = group.querySelector('.ind');
    buttons.forEach(function(btn){
      btn.addEventListener('click', function(){
        buttons.forEach(function(b){ b.classList.remove('on'); });
        btn.classList.add('on');
        ind.style.transform = 'translateX(' + (Number(btn.getAttribute('data-i')) * 100) + '%)';
      });
    });
  });
});

/* 만족도 카드의 '아쉬웠어요'도 같은 만족도 평가 팝업을 연다 */
  /* 만족도 카드는 카드 전체가 하나의 버튼(#ctaSatisfaction) */
YBMP.add(80, '수강중 강좌 스와이프', function(){
  /* 수강중 강좌 스와이프 — 스크롤 위치로 현재 강좌를 판단해 페이지 표시와 라이브 카드(레슨명)를 함께 바꾼다 */
  var sw = document.getElementById('courseSwiper'); if (!sw) return;
  var slides = Array.prototype.slice.call(sw.querySelectorAll('.course-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('#courseDots button'));
  var live = document.getElementById('liveCard');
  var cur = 0, t = null;
  function target(i){ var max = sw.scrollWidth - sw.clientWidth; return i === slides.length-1 ? max : Math.min(max, slides[i].offsetLeft - slides[0].offsetLeft); }
  function fillLive(idx){
    document.getElementById('liveLessonTitle').textContent = slides[idx].getAttribute('data-lesson');
    document.getElementById('liveLessonNum').textContent = slides[idx].getAttribute('data-lesson-num');
    document.getElementById('liveWhen').textContent = slides[idx].getAttribute('data-when') || '';
  }
  /* instant : 아래 내용이 손가락을 따라 넘어가는 중이면(화면 밖으로 반쯤 나간 순간) 바로 바꾼다 */
  function setActive(idx, instant){
    if (idx === cur) return; cur = idx;
    document.dispatchEvent(new CustomEvent('coursechange', {detail: idx}));
    dots.forEach(function(d,i){ d.classList.toggle('on', i===idx); d.setAttribute('aria-selected', i===idx ? 'true':'false'); });
    if (instant){ fillLive(idx); return; }
    live.classList.add('swapping');
    setTimeout(function(){ fillLive(idx); live.classList.remove('swapping'); }, 180);
  }

  /* 강좌 아래 내용(입장 카드 · 예습 · 리뷰 · 리포트 …)도 강좌명과 같은 거리만큼 함께 넘어간다.
     내용은 강좌마다 따로 있지 않고 한 벌을 바꿔 끼우는 구조라, 반쯤 넘어간 순간 내용을 바꾸고
     반대쪽에서 들어오게 그린다. 이동 중에만 #scrollArea.pane-moving 으로 transform 을 건다. */
  var area = document.getElementById('scrollArea');
  var timeline = area && area.querySelector(':scope > .timeline');
  var panes = [live, timeline].filter(Boolean);
  var raf = 0;
  function nearest(x){ var n = 0, bd = 1e9; slides.forEach(function(sl,i){ var d = Math.abs(target(i) - x); if (d < bd){ bd = d; n = i; } }); return n; }
  function follow(){
    raf = 0; if (!area) return;
    var x = sw.scrollLeft, n = nearest(x), off = x - target(n);
    var nb = Math.max(0, Math.min(slides.length - 1, n + (off >= 0 ? 1 : -1)));
    var w = Math.abs(target(nb) - target(n)) || sw.clientWidth;
    var p = Math.max(-0.5, Math.min(0.5, off / w));
    if (n !== cur) setActive(n, true);
    if (Math.abs(p) < 0.004){ area.classList.remove('pane-moving'); area.style.removeProperty('--pane-x'); area.style.removeProperty('--pane-o'); return; }
    area.classList.add('pane-moving');
    area.style.setProperty('--pane-x', (-p * w).toFixed(1) + 'px');
    area.style.setProperty('--pane-o', (1 - Math.abs(p) * 1.4).toFixed(3));
  }
  sw.addEventListener('scroll', function(){ if (!raf) raf = requestAnimationFrame(follow); }, {passive:true});

  sw.addEventListener('scroll', function(){
    clearTimeout(t);
    t = setTimeout(function(){
      var x = sw.scrollLeft, best = 0, bd = 1e9;
      slides.forEach(function(sl,i){ var d = Math.abs(target(i) - x); if (d < bd){ bd = d; best = i; } });
      setActive(best);
    }, 60);
  }, {passive:true});
  dots.forEach(function(d,i){ d.addEventListener('click', function(){ sw.scrollTo({left: target(i), behavior:'smooth'}); }); });

  /* PC(마우스) : 끌어서 옆 강좌로 — 터치·트랙패드는 기본 가로 스크롤 그대로 쓴다 */
  var drag = null;
  sw.addEventListener('dragstart', function(e){ e.preventDefault(); });
  sw.addEventListener('pointerdown', function(e){
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x:e.clientX, left:sw.scrollLeft, start:cur, moved:false };
    sw.classList.add('dragging');
  });
  window.addEventListener('pointermove', function(e){
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) drag.moved = true;
    sw.scrollLeft = drag.left - dx;
  });
  window.addEventListener('pointerup', function(e){
    if (!drag) return;
    var dx = e.clientX - drag.x, d = drag; drag = null;
    var idx = d.start;
    if (dx < -sw.clientWidth * 0.15) idx = Math.min(slides.length - 1, d.start + 1);
    else if (dx > sw.clientWidth * 0.15) idx = Math.max(0, d.start - 1);
    sw.scrollTo({left: target(idx), behavior:'smooth'});
    setTimeout(function(){ sw.classList.remove('dragging'); }, 450);
    if (d.moved){   /* 끌기 직후 생기는 클릭은 무시 */
      var block = function(ev){ ev.stopPropagation(); ev.preventDefault(); };
      sw.addEventListener('click', block, true);
      setTimeout(function(){ sw.removeEventListener('click', block, true); }, 60);
    }
  });

  /* 터치 : 강좌명 아래 내용을 좌우로 밀어도 강좌가 넘어간다 (세로 스크롤은 그대로 — CSS touch-action:pan-y) */
  if (!area || slides.length < 2) return;
  var tg = null;
  area.addEventListener('pointerdown', function(e){
    if (e.pointerType === 'mouse' || !panes.some(function(pn){ return pn.contains(e.target); })) return;
    tg = { id:e.pointerId, x:e.clientX, y:e.clientY, left:sw.scrollLeft, start:cur, mode:null, t:Date.now() };
  });
  area.addEventListener('pointermove', function(e){
    if (!tg || e.pointerId !== tg.id) return;
    var dx = e.clientX - tg.x, dy = e.clientY - tg.y;
    if (!tg.mode){
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      tg.mode = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y';
      if (tg.mode === 'x') sw.classList.add('dragging');
    }
    if (tg.mode === 'x') sw.scrollLeft = tg.left - dx;
  });
  function endTouch(e){
    if (!tg || e.pointerId !== tg.id) return;
    var g = tg; tg = null;
    if (g.mode !== 'x') return;
    var dx = e.clientX - g.x, fast = Math.abs(dx) / Math.max(1, Date.now() - g.t) > 0.45, idx = g.start;
    if (dx < -sw.clientWidth * 0.2 || (fast && dx < -24)) idx = Math.min(slides.length - 1, g.start + 1);
    else if (dx > sw.clientWidth * 0.2 || (fast && dx > 24)) idx = Math.max(0, g.start - 1);
    sw.scrollTo({left: target(idx), behavior:'smooth'});
    setTimeout(function(){ sw.classList.remove('dragging'); }, 450);
    var block = function(ev){ ev.stopPropagation(); ev.preventDefault(); };   /* 밀기 직후 생기는 클릭은 무시 */
    area.addEventListener('click', block, true);
    setTimeout(function(){ area.removeEventListener('click', block, true); }, 60);
  }
  area.addEventListener('pointerup', endTouch);
  area.addEventListener('pointercancel', endTouch);
});

YBMP.add(90, '강좌 스와이프 힌트', function(){
  /* 강좌 스와이프 힌트 — 강좌가 2개 이상일 때 첫 진입 0.7초 뒤 한 번만 빼꼼빼꼼, 사용자가 먼저 만지면 생략 */
  var sw = document.getElementById('courseSwiper'); if (!sw || sw.querySelectorAll('.course-slide').length < 2) return;
  var touched = false;
  ['pointerdown','touchstart','scroll'].forEach(function(ev){ sw.addEventListener(ev, function(){ touched = true; sw.classList.remove('peek'); }, {passive:true, once:true}); });
  setTimeout(function(){
    if (touched) return;
    sw.classList.add('peek');
    setTimeout(function(){ sw.classList.remove('peek'); }, 1900);
  }, 700);
});

/* ===== 시안2 v3 : 시안1 v3 추가 페이지 연결부 ===== */
YBMP.add(120, '클래스룸 탭(예정·종료 목록) · 출석현황 연결', function(){
  "use strict";
  function openOv(ov){ ov.hidden = false; requestAnimationFrame(function(){ requestAnimationFrame(function(){ ov.classList.add('on'); }); }); }
  function closeOv(ov){ ov.classList.remove('on'); setTimeout(function(){ ov.hidden = true; }, 220); }
  function goNav(key){ var n = document.querySelector('.nav-item[data-nav="'+key+'"]'); if (n) n.click(); }

  /* ---------- 출석현황 팝업 (진행률 · 출석/연기/취소 · 이번 달 수업일) ---------- */
  var ATT_DEMO = YBMP.demo.attendance;
  function strip(d){ var x = new Date(d); x.setHours(0,0,0,0); return x; }
  function addD(d,n){ var x = new Date(d); x.setDate(x.getDate()+n); return x; }
  function same(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
  var TODAY = strip(new Date());
  var attOverlay = document.getElementById('attOverlay');
  function attRender(){
    var pct = Math.round(ATT_DEMO.progressDone / ATT_DEMO.progressTotal * 100);
    document.getElementById('attProgressPct').textContent = pct;
    document.getElementById('attProgressDone').textContent = ATT_DEMO.progressDone;
    document.getElementById('attProgressTotal').textContent = ATT_DEMO.progressTotal;
    document.getElementById('attStatAttend').textContent = ATT_DEMO.attend;
    document.getElementById('attStatPostpone').textContent = ATT_DEMO.postpone;
    document.getElementById('attStatAbsent').textContent = ATT_DEMO.absent;
    var fill = document.getElementById('attProgressFill');
    fill.style.width = '0%'; setTimeout(function(){ fill.style.width = pct + '%'; }, 260);
    var mc = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
    document.getElementById('attCalMonth').textContent = mc.getFullYear()+'년 '+(mc.getMonth()+1)+'월';
    var start = addD(mc, -mc.getDay()), grid = document.getElementById('attCalGrid');
    grid.innerHTML = '';
    for (var i=0;i<35;i++){
      var day = addD(start,i), inM = day.getMonth() === mc.getMonth();
      var isClass = inM && ATT_DEMO.classWeekdays.indexOf(day.getDay()) !== -1;
      var done = isClass && day < TODAY;
      var cell = document.createElement('div');
      cell.className = 'makeup-cal-cell attendance-cal-cell' + (inM?'':' out-range') + (isClass?' class-day':'') + (same(day,TODAY)?' today':'');
      cell.innerHTML = '<span class="makeup-num">'+day.getDate()+'</span>' + (done ? '<span class="attendance-check-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>' : '');
      grid.appendChild(cell);
    }
  }
  window.attOpen = function(){ attRender(); openOv(attOverlay); };
  document.getElementById('attOpenBtn').addEventListener('click', window.attOpen);
  document.getElementById('attCloseBtn').addEventListener('click', function(){ closeOv(attOverlay); });
  attOverlay.addEventListener('click', function(e){ if (e.target === attOverlay) closeOv(attOverlay); });
  document.getElementById('attChangeScheduleBtn').addEventListener('click', function(){ closeOv(attOverlay); goNav('schedule'); });
  document.getElementById('liveCalBtn').addEventListener('click', function(){ goNav('schedule'); });

  /* ---------- 예정 / 종료 탭 페이지 ---------- */
  var IMG = 'https://upsisa.ybmsisa.com/e4u/YBMIngang/ADMIN/files/product/info/D805A4EE-36C7-4F3A-A85C-9430EB0EBBAC.jpg';
  var VIDEO = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="7" height="6" rx="1.5"/><path d="M8 5.25 10.6 3.9a.3.3 0 0 1 .4.27v3.66a.3.3 0 0 1-.4.27L8 6.75"/></svg>';
  var PHONE = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.1 1.5H2.7a1 1 0 0 0-1 1.1c.5 4.3 3.3 7.1 7.6 7.6a1 1 0 0 0 1.1-1V7.9a.6.6 0 0 0-.45-.58l-1.6-.4a.6.6 0 0 0-.56.16l-.8.8A6.2 6.2 0 0 1 4.12 5.04l.8-.8a.6.6 0 0 0 .16-.56l-.4-1.6a.6.6 0 0 0-.58-.45Z"/></svg>';
  /* 예정·종료 카드 : 수강중 강좌 슬라이드와 같은 정보 정렬(유형 칩 → 요일·시간 → 횟수·기간),
     시작일/수강기간은 칩이 아닌 별도 키-값 박스로 분리 */
  var upcoming = YBMP.demo.upcomingCourses;
  var done = YBMP.demo.doneCourses;
  function chip(t){ return '<span class="chip type-chip '+t+'" data-size="small" data-tone="'+(t === 'video' ? 'brand' : 'neutral')+'">'+(t === 'video' ? VIDEO : PHONE)+(t === 'video' ? '화상' : '전화')+'</span>'; }
  function meta(c){ return '<div class="class-meta">'+chip(c.type)+'<span class="class-when">'+c.when+'</span><span class="class-plan">'+c.plan+'</span></div>'; }
  function head(c, cls){ return '<div class="class-course-img"><img src="'+(c.img||IMG)+'" alt=""><div class="class-course-img-scrim" aria-hidden="true"></div><h3 class="'+cls+'">'+c.name+'</h3></div>'; }
  document.getElementById('clsUpcomingList').innerHTML = upcoming.map(function(c){
    return '<div class="class-upcoming-card">' + head(c, 'class-upcoming-title') +
      '<div class="class-upcoming-body">' + meta(c) +
        '<div class="class-kv class-kv-notice"><span class="class-kv-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 9.5h18"/></svg>수업 시작일을 설정하세요</span><span class="class-kv-value">'+c.deadline+'까지</span></div>' +
      '</div></div>';
  }).join('');
  document.getElementById('clsDoneList').innerHTML = done.map(function(c){
    return '<div class="class-done-card">' + head(c, 'class-done-title') +
      '<div class="class-done-body">' + meta(c) +
        '<div class="class-kv"><span class="class-kv-label">수강기간</span><span class="class-kv-value">'+c.period+'</span></div>' +
      '<div class="class-attend-summary">' +
        '<div class="attendance-progress-card"><div class="attendance-progress-head"><span class="attendance-progress-label">진행률</span><span class="attendance-progress-value"><b>'+c.pct+'</b>% · '+c.doneN+'/'+c.total+'회</span></div>' +
        '<div class="attendance-progress-track"><div class="attendance-progress-fill" style="width:'+c.pct+'%"></div></div></div>' +
        '<div class="attendance-stats-row"><div class="attendance-stat-item"><span class="attendance-stat-num">'+c.attend+'</span><span class="attendance-stat-label">출석</span></div>' +
        '<div class="attendance-stat-item"><span class="attendance-stat-num">'+c.postpone+'</span><span class="attendance-stat-label">연기</span></div>' +
        '<div class="attendance-stat-item"><span class="attendance-stat-num">'+c.absent+'</span><span class="attendance-stat-label">취소/결석</span></div></div>' +
      '</div>' +
      '<div class="class-done-actions">' +
        '<button type="button" class="class-done-action-btn" data-done-action="review"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>수업 리뷰</span></button>' +
        '<button type="button" class="class-done-action-btn" data-done-action="report"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V9M13 17V5M17 17v-4"/></svg><span>월말 평가서</span></button>' +
        '<button type="button" class="class-done-action-btn" data-done-action="aihistory"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12a8.5 8.5 0 1 0 2.7-6.2"/><path d="M3.5 4.5v4.3h4.3"/><path d="M12 8v4.5l3 2"/></svg><span>AI 히스토리</span></button>' +
      '</div></div></div>';
  }).join('');
  document.getElementById('clsDoneList').addEventListener('click', function(e){
    var b = e.target.closest('[data-done-action]'); if (!b) return;
    var a = b.getAttribute('data-done-action');
    if (a === 'review' && window.revOpen) window.revOpen();
    else if (a === 'report' && window.crOpen) window.crOpen();
    else if (a === 'aihistory' && window.aihOpen) window.aihOpen();
  });

  var areas = [document.getElementById('scrollArea'), document.getElementById('upcomingArea'), document.getElementById('doneArea')];
  var tabIdx = 0, navKey = 'classroom';
  function syncAreas(){
    areas.forEach(function(a, i){ a.hidden = !(navKey === 'classroom' && i === tabIdx); });
  }
  window.__clsSyncTab = function(key){ navKey = key; if (key === 'classroom') syncAreas(); else { areas[1].hidden = true; areas[2].hidden = true; } };
  Array.prototype.forEach.call(document.querySelectorAll('[data-rc-tabs] button[data-i]'), function(b){
    b.addEventListener('click', function(){ tabIdx = Number(b.getAttribute('data-i')); syncAreas(); areas[tabIdx].scrollTop = 0; });
  });

  /* ---------- 강좌 전환 : 예습 구성(QA#10) · 첨삭 노출(QA#8) ---------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('#courseSwiper .course-slide'));
  var corr = document.getElementById('ctaCorrection');
  function applyCourse(idx){
    var sl = slides[idx]; if (!sl) return;
    if (corr) corr.hidden = sl.getAttribute('data-junior') !== '1';
  }
  document.addEventListener('coursechange', function(e){ applyCourse(e.detail); });
  applyCourse(0);
});

YBMP.add(130, '예습 단계 초기 상태', function(){ if (window.__setStepDone) window.__setStepDone(document.querySelector('.classroom-step[data-step-id="review"]'), true); });

/* 회의 반영(10/14) — 클래스룸 재배치 */
YBMP.add(270, '클래스룸 재배치(예습 로드맵 · 입장 카드 · 첨삭)', function(){
  var $ = function(s, r){ return (r || document).querySelector(s); };
  /* 1) 예습 : 1안 로드맵을 2안 예습 패널 자리에 */
    var block = $('#prepBlock');
  if (block){
    var flow = block.querySelector('#flow'), steps = [].slice.call(flow.querySelectorAll('.classroom-step')), path = flow.querySelector('svg.link path');
    function draw(){
      var fr = flow.getBoundingClientRect(); if (!fr.width) return;
      flow.querySelector('svg.link').setAttribute('viewBox', '0 0 ' + fr.width + ' ' + fr.height);
      var pts = steps.filter(function(s){ return !s.hidden; }).map(function(s){ var r = s.querySelector('.classroom-step-marker').getBoundingClientRect(); return { x:r.left + r.width / 2 - fr.left, y:r.bottom - 4 - fr.top }; });
      if (pts.length < 2){ path.setAttribute('d', ''); return; }
      var d = 'M' + pts[0].x.toFixed(1) + ' ' + pts[0].y.toFixed(1);
      for (var i = 1; i < pts.length; i++){ var a = pts[i - 1], c = pts[i], my = (a.y + c.y) / 2; d += ' C ' + a.x.toFixed(1) + ' ' + my.toFixed(1) + ', ' + c.x.toFixed(1) + ' ' + my.toFixed(1) + ', ' + c.x.toFixed(1) + ' ' + c.y.toFixed(1); }
      path.setAttribute('d', d);
    }
    function refresh(){ draw(); setTimeout(draw, 320); }
    var MSG = { no:'수업의 몰입도를 높이는 스마트한 습관! 교재와 예습, AI 대화로 오늘의 클래스를 가볍게 예열해 보세요.', ok:'사전학습 완료! 꼼꼼하게 준비한 만큼 오늘 수업도 훨씬 알차게 채워질 거예요. 잠시 후 뵙겠습니다!' };
    function progress(){
      var vis = steps.filter(function(s){ return !s.hidden; });
      var done = vis.filter(function(s){ return s.getAttribute('data-completed') === 'true'; }).length;
      $('#s3PrepProgress', block).textContent = done + '/' + vis.length;
      $('#prepEncourageText', block).textContent = done === vis.length ? MSG.ok : MSG.no;
    }
    steps.forEach(function(st){
      var id = st.getAttribute('data-step-id');
      function toggle(){ st.setAttribute('data-active', String(st.getAttribute('data-active') !== 'true')); refresh(); }
      st.querySelector('.classroom-step-marker').addEventListener('click', toggle);
      [].forEach.call(st.querySelectorAll('.classroom-step-title-chip, .classroom-step-done-chip'), function(c){ c.addEventListener('click', toggle); });
      [].forEach.call(st.querySelectorAll('.classroom-popup-go'), function(b){
        b.addEventListener('click', function(e){
          e.stopPropagation(); st.setAttribute('data-completed', 'true'); st.setAttribute('data-active', 'false');
          var nx = steps[steps.indexOf(st) + 1]; if (nx && nx.getAttribute('data-completed') !== 'true') nx.setAttribute('data-active', 'true');
          refresh(); progress();
        });
      });
      /* 전체 보기 → 2안 레슨별 바텀시트(같은 단계) */
      var all = st.querySelector('.classroom-step-popup .classroom-hero-preview');
      if (all) all.addEventListener('click', function(e){ e.stopPropagation(); if (window.openLessonSheet) window.openLessonSheet(st); });
      var hist = st.querySelector('#aiHistorySheetTrigger'); if (hist){ hist.id = 's3AiHist'; hist.addEventListener('click', function(e){ e.stopPropagation(); if (window.aihSheetOpen) window.aihSheetOpen(); }); }
    });
    /* 강좌 전환 : 강좌별 예습 구성(data-prep) — 예) 2번 강좌는 교재 보기 1개만 */
    function applyPrep(idx){
      var sl = document.querySelectorAll('#courseSwiper .course-slide')[idx]; if (!sl) return;
      var items = (sl.getAttribute('data-prep') || 'lesson,review,ai').split(',');
      steps.forEach(function(st){ st.hidden = items.indexOf(st.getAttribute('data-step-id')) === -1; });
      var vis = steps.filter(function(st){ return !st.hidden; });
      if (vis.length && !vis.some(function(st){ return st.getAttribute('data-active') === 'true'; })){
        var nx = vis.filter(function(st){ return st.getAttribute('data-completed') !== 'true'; })[0]; if (nx) nx.setAttribute('data-active', 'true');
      }
      block.classList.toggle('s3-prep-one', vis.length === 1);
      progress(); refresh();
    }
    document.addEventListener('coursechange', function(e){ applyPrep(e.detail); });
    applyPrep(0);
    progress();
    window.addEventListener('resize', draw); window.addEventListener('load', refresh); refresh();
    if ('ResizeObserver' in window) new ResizeObserver(draw).observe(flow);
    window.s3PrepRefresh = refresh;
  }
  /* 입장 카드 : 레슨 번호와 레슨명을 한 줄로 */
  (function(){ var lc = $('#liveCard'), mt = lc && $('.lesson-meta', lc), tt = lc && $('#liveLessonTitle'); if (mt && tt && !lc.querySelector('.s3-lrow')){ var row = document.createElement('div'); row.className = 's3-lrow'; mt.parentNode.insertBefore(row, mt); row.appendChild(mt); row.appendChild(tt); } })();
  /* 2) 입장 카드 : 캐릭터(손 흔들기) — 카드 오른쪽 아래에 걸쳐 앉음. 캐릭터는 추후 교체 가능(images/wawong-26.png만 바꾸면 됨) */
  var live = $('#liveCard');
  if (live && !live.querySelector('.s3-char')) live.insertAdjacentHTML('beforeend', '<img class="s3-char" src="images/wawong-26.png" alt="">');
  /* 과정명 : 길면 … (화상 칩·정보 아이콘은 한 줄 유지) */
  [].forEach.call(document.querySelectorAll('.course-slide .ai-txt .course'), function(c){
    var t = c.firstChild; if (t && t.nodeType === 3 && t.textContent.trim()){ var sp = document.createElement('span'); sp.className = 's3-cname'; sp.textContent = t.textContent; sp.title = t.textContent.trim(); c.replaceChild(sp, t); }
  });
  /* 3) 주니어 첨삭 : 월말 리포트 바로 아래 한 줄 버튼 (첨삭 대상 주니어에게만 노출 — 원래 노출 조건 그대로) */
  var cor = $('#ctaCorrection'), rep = $('#tileReport');
  if (cor && rep){ rep.parentNode.insertBefore(cor, rep.nextSibling); cor.classList.add('s3-cor'); }
});
