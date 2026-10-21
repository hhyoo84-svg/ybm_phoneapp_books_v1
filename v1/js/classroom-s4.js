/* ======================================================================
   시안4 레이아웃 · 와옹이 캐릭터 (회의 10/14 반영)
   이미지 교체는 아래 window.S3C 한 곳 — 키 → images/wawong-N.png
   ====================================================================== */
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
(function(){
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
})();

/* 회의 반영(10/14) — 클래스룸 재배치 */
(function(){
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
})();

/* 회의 반영(10/14) — 스케줄 : 월간이면 좌우 화살표·메뉴 숨김, 클래스명 드롭다운 힌트 */
(function(){
  var month = document.getElementById('scMonthCalendar'), card = document.querySelector('.schedule-topbar-card');
  var prev = document.getElementById('scPrevBtn'), next = document.getElementById('scNextBtn');
  var area = document.getElementById('scheduleArea');
  /* 월간 TODAY : 다시 그리지 않고 이번 달로 부드럽게 스크롤 + 오늘 칸 강조 */
  var tbtn = document.getElementById('scTodayBtn');
  if (tbtn) tbtn.addEventListener('click', function(e){
    var mc = document.getElementById('scMonthCalendar'); if (!mc || mc.hidden || !area) return;
    var heads = [].slice.call(document.querySelectorAll('#scMonthGrid .s3-mhead')), now = new Date();
    var h = heads.filter(function(x){ return x._d && x._d.getFullYear() === now.getFullYear() && x._d.getMonth() === now.getMonth(); })[0];
    if (!h) return; /* 범위 밖이면 원래 동작(다시 그리기) */
    e.stopImmediatePropagation();
    var snapTop = parseFloat(getComputedStyle(area).getPropertyValue('--s3-snap-top')) || 0;
    var top = area.scrollTop + h.getBoundingClientRect().top - area.getBoundingClientRect().top - snapTop;
    area.scrollTo({ top: top, behavior: 'smooth' });
    var tc = document.querySelector('#scMonthGrid .schedule-month-cell.today');
    if (tc){ tc.classList.remove('s3-pulse'); void tc.offsetWidth; tc.classList.add('s3-pulse'); }
  }, true);
  /* 월간 : 강좌명 띠 아래 안내 문구 */
  var mcal = document.getElementById('scMonthCalendar');
  if (mcal && !mcal.querySelector('.s3-mnote')) mcal.insertAdjacentHTML('beforeend', '<div class="s3-mnote"><span>연기, 보강신청 등은 주별 스케줄에서 가능합니다.</span></div>');
  function snapTop(){
    var wr = document.querySelector('.s3-month .schedule-month-weekday-row');
    if (!area || !wr) return;
    var hh = (document.querySelector('#scheduleArea .schedule-hero') || {}).offsetHeight || 0;
    var tb = (document.querySelector('.schedule-week-topbar') || {}).offsetHeight || 0;
    area.style.setProperty('--s3-snap-top', (hh + tb + wr.offsetHeight) + 'px');
  }
  function sync(){ var on = month && !month.hidden; if (card) card.classList.toggle('s3-month', on); if (prev) prev.hidden = on; if (next) next.hidden = on; if (area) area.classList.toggle('s3-snap', on); document.documentElement.classList.toggle('s3-is-month', on); if (on) requestAnimationFrame(snapTop); }
  window.addEventListener('resize', snapTop);
  sync(); if (month) new MutationObserver(sync).observe(month, { attributes:true, attributeFilter:['hidden'] });
  var hero = document.querySelector('.schedule-hero'), area = document.getElementById('scheduleArea');
  /* 드롭다운 : 현재 강좌 표시 */
  var cname = document.getElementById('courseSelectName'), cmenu = document.getElementById('courseMenu');
  function markCur(){ if (!cname || !cmenu) return; var t = cname.textContent.trim(); [].forEach.call(cmenu.querySelectorAll('button'), function(b){ b.classList.toggle('s3-on', b.textContent.trim() === t); }); }
  markCur(); if (cname) new MutationObserver(markCur).observe(cname, { childList:true, characterData:true, subtree:true });
  function heroH(){ if (hero && area) area.style.setProperty('--s3-hero-h', hero.offsetHeight + 'px'); }
  heroH(); window.addEventListener('resize', heroH); if (hero && 'ResizeObserver' in window) new ResizeObserver(heroH).observe(hero);
  if (hero && 'IntersectionObserver' in window){
    new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ hero.classList.remove('s3-hint'); void hero.offsetWidth; setTimeout(function(){ hero.classList.add('s3-hint'); }, 500); } }); }, { threshold:.6 }).observe(hero);
  }
})();

/* 캐릭터 시스템 — 이미지 교체는 window.S3C 한 곳 */
(function(){
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
  var NOTICE = function(t){ return /점검/.test(t) ? 'tired' : /버전|업데이트/.test(t) ? 'up' : 'point'; };
  var ni = $('#noticeIcon'), nt = $('#noticeTitle');
  if (ni && nt){
    var fixN = function(){ var k = NOTICE(nt.textContent); var cur = $('.s3-c', ni); if (cur && cur.getAttribute('data-k') === k) return; ni.classList.add('s3-ci'); ni.innerHTML = img(k); };
    fixN(); new MutationObserver(fixN).observe(nt, { childList:true, characterData:true, subtree:true });
  }
  var dlg = $('#scDlg'), dt = $('#scDlgTitle');
  if (dlg && dt){
    var DLG = { '연기 신청':'hmm', '보강 신청':'plan', '연기 취소':'hmm', '보강 취소':'hmm', '안내사항':'point', '설정 가이드':'point', '장치 테스트 정보':'point' };
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
  function fixEmpty(){ emptyQ = 0; [].forEach.call(document.querySelectorAll(EMPTY), function(e){ if (!e.querySelector('.s3-c')){ e.classList.add('s3-empty'); e.insertAdjacentHTML('afterbegin', img('tired')); } }); }
  fixEmpty(); new MutationObserver(function(){ if (!emptyQ) emptyQ = requestAnimationFrame(fixEmpty); }).observe(document.body, { childList:true, subtree:true });
})();