/* ======================================================================
   전화영어 클래스룸 — 공통 기능 (클래스룸 · 스케줄 · 팝업 · 네이티브 화면)
   순서 의존 : 이 파일 → classroom-s4.js → (선택) screen-states.js
   ====================================================================== */
/* 시안3 : 레슨 데이터(커리큘럼 20강) — 과정 시작일(07.07)부터 주 2회 순서대로 */window.S3_LESSONS=["Meeting new faces", "Describing your best friend", "Every morning", "Housing", "The weekend", "Using the telephone", "My favorite sports", "Leisure time", "Going on vacation", "Keeping a pet", "Health problems", "Shopping at the grocery store", "Buying a present", "Online shopping", "Eating out", "Ordering food over the phone", "Talking about an email", "Asking for directions", "Learning a foreign language", "Plans and dreams"];window.s3LessonIdx=function(d,on){var n=0,x=new Date(2026,6,7),e=new Date(d.getFullYear(),d.getMonth(),d.getDate());if(!on){return 0;}while(x<e){if(on(new Date(x)).length)n++;x.setDate(x.getDate()+1);}return n%20;};

(function(){
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
})();

(function(){
  "use strict";
  /* ---------- 레슨별 전체 보기 바텀시트 (DS 팝업 그대로) ----------
     시안2에서는 사전 예습 리스트의 각 단계를 누르면 열린다. 오늘 레슨(Lesson.01)의 버튼을 누르면
     해당 단계가 '완료'로 바뀌고 시트가 닫힌다 — DS 말풍선의 '바로가기 = 완료' 규칙과 동일 */
  var LESSON_SHEET_DATA = {
    lesson: { title:'교재 전체 보기',     cta:'교재 보기' },
    review: { title:'수업 예습 전체 보기', cta:'바로가기' },
    ai:     { title:'AI 대화 연습 전체 보기', cta:'바로가기' }
  };
  var LESSON_SHEET_NUMS = [1,2,3,4,5,6,7,8];
  var TODAY_LESSON_TOPIC = (document.getElementById('liveLessonTitle') || {}).textContent || '';

  var overlay = document.getElementById('lessonSheetOverlay');
  var titleEl = document.getElementById('lessonSheetTitle');
  var listEl = document.getElementById('lessonSheetList');
  var currentStep = null;

  function openLessonSheet(stepEl){
    var d = LESSON_SHEET_DATA[stepEl.getAttribute('data-step-id')];
    if (!d) return;
    currentStep = stepEl;
    titleEl.textContent = d.title;
    listEl.innerHTML = LESSON_SHEET_NUMS.map(function(n, i){
      var isToday = i === 0;
      return (
        '<div class="lesson-sheet-item' + (isToday ? '' : ' disabled') + '">' +
          '<span class="lesson-sheet-info">' +
            '<span class="lesson-sheet-row">' +
              '<span class="lesson-sheet-num">Lesson.' + (n < 10 ? '0' + n : n) + '</span>' +
              (isToday ? '<span class="chip lesson-sheet-today schedule-day-today" data-size="small" data-tone="brand">오늘</span>' : '') +
            '</span>' +
            (isToday ? '<span class="lesson-sheet-topic">' + ((document.getElementById('liveLessonTitle')||{}).textContent||TODAY_LESSON_TOPIC) + '</span>' : '') +
          '</span>' +
          '<button type="button" class="lesson-sheet-go"' + (isToday ? '' : ' disabled') + '>' + d.cta + '</button>' +
        '</div>'
      );
    }).join('');
    if (stepEl.getAttribute('data-step-id') === 'ai'){
      listEl.insertAdjacentHTML('beforeend', '<button type="button" class="lesson-sheet-history" id="aiHistorySheetTrigger">AI 히스토리 보기<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>');
    }
    overlay.hidden = false;
    requestAnimationFrame(function(){ overlay.classList.add('on'); });
  }
  function closeLessonSheet(){
    overlay.classList.remove('on');
    setTimeout(function(){ overlay.hidden = true; }, 220);
  }
  document.getElementById('lessonSheetClose').addEventListener('click', closeLessonSheet);
  overlay.addEventListener('click', function(e){ if (e.target === overlay) closeLessonSheet(); });
  listEl.addEventListener('click', function(e){
    if (e.target.closest('#aiHistorySheetTrigger')){ closeLessonSheet(); if (window.aihSheetOpen) setTimeout(window.aihSheetOpen, 180); return; }
    var go = e.target.closest('.lesson-sheet-go');
    if (!go || go.disabled) return;
    if (currentStep && window.__setStepDone) window.__setStepDone(currentStep, true);
    closeLessonSheet();
  });

  window.openLessonSheet = openLessonSheet;  /* 예습 로드맵 「전체 보기」·푸시 카드에서 호출 */
})();

(function(){
  "use strict";
  /* ---------- 스케줄 : 시안1 v2 캘린더 구조(년월 피커 · TODAY · 주간/월간 전환 · 공휴일 · 주간 리스트) ---------- */
  var courses = [
    { role:'Speaking Practice with YBM 초급', period:'2026.07.07 ~ 2026.12.31', when:'화·목 19:30', type:'video', report:true },
    { role:'Speaking Practice with YBM 초중급',   period:'2026.09.01 ~ 2027.02.28', when:'월·수·금 07:00', type:'phone', report:false },
    { role:'데일리 프리토킹',    period:'2026.08.01 ~ 2026.10.31', when:'월~금 22:00', type:'phone', report:false },
    { role:'여행 영어 회화',     period:'2026.06.01 ~ 2026.11.30', when:'수 20:30', type:'video', report:false },
    { role:'Speaking Practice with YBM 중급',   period:'2026.09.05 ~ 2026.12.26', when:'토 10:00', type:'video', report:false }
  ];
  /* ---------- 스케줄 화면 ---------- */
  /* 날짜 helper */
  function stripTime(d){ var x = new Date(d); x.setHours(0,0,0,0); return x; }
  function addDays(d,n){ var x = new Date(d); x.setDate(x.getDate()+n); return x; }
  function pad2(n){ return n < 10 ? '0'+n : ''+n; }
  function ymd(d){ return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); }
  function sameDay(a,b){ return ymd(a) === ymd(b); }
  var WD_LABEL = ['일','월','화','수','목','금','토'];
  function monthFmt(d){ return d.getFullYear()+'년 '+(d.getMonth()+1)+'월'; }

  var SC_TODAY = stripTime(new Date());

  /* 2026년 대한민국 공휴일 — 상태 칩과는 별도로, 날짜 자체를 옅은 산호색으로 표시하기 위한 데이터.
     제헌절은 2008년부터 공휴일(휴일)이 아니라서 제외했다 */
  var SC_HOLIDAYS = {
    '2026-01-01':'신정',
    '2026-02-16':'설날연휴','2026-02-17':'설날','2026-02-18':'설날연휴',
    '2026-03-02':'삼일절 대체',
    '2026-05-05':'어린이날',
    '2026-05-25':'부처님오신날 대체',
    '2026-06-03':'지방선거일',
    '2026-06-06':'현충일',
    '2026-08-17':'광복절 대체',
    '2026-09-24':'추석연휴','2026-09-25':'추석','2026-09-26':'추석연휴',
    '2026-10-03':'개천절',
    '2026-10-05':'개천절 대체',
    '2026-10-09':'한글날',
    '2026-12-25':'크리스마스'
  };
  function scHolidayName(d){ return SC_HOLIDAYS[ymd(d)] || ''; }

  /* 데모용 수업 일정 — 클래스룸 화면의 강좌명을 그대로 재사용.
     월간 달력에서 기본 선택 강좌(Speaking Practice with YBM 초급)만으로도 출석/연기/결석/예정 4가지 칩이 골고루 보이도록 분산 배치 */
  var SC_CLASSES = [
    { d: addDays(SC_TODAY,-13), time:'19:30', subject:'Speaking Practice with YBM 초급', status:'absent' },
    { d: addDays(SC_TODAY,-10), time:'19:30', subject:'Speaking Practice with YBM 초급', status:'postponed' },
    { d: addDays(SC_TODAY,-1),  time:'19:30', subject:'Speaking Practice with YBM 초급', status:'skip' },
    { d: addDays(SC_TODAY,4),   time:'07:00', subject:'Speaking Practice with YBM 초급', status:'upcoming' },
    { d: addDays(SC_TODAY,-6),  time:'19:30', subject:'Speaking Practice with YBM 초급', status:'attended' },
    { d: addDays(SC_TODAY,-3),  time:'19:30', subject:'Speaking Practice with YBM 초급', status:'attended' },
    { d: addDays(SC_TODAY,0),   time:'19:30', subject:'Speaking Practice with YBM 초급', status:'upcoming' },
    { d: addDays(SC_TODAY,0),   time:'07:00', subject:'Speaking Practice with YBM 초급', status:'upcoming', makeupOf:{ d: addDays(SC_TODAY,-10), time:'19:30' } },
    /* 보강 수업으로 대체된 예정 수업 — 원수업(연기/결석된 수업)이 언제였는지, 취소 시 그 수업으로 원복된다는 안내가 카드에 함께 표시된다 */
    { d: addDays(SC_TODAY,4),   time:'19:30', subject:'Speaking Practice with YBM 초급', status:'upcoming', makeupOf:{ d: addDays(SC_TODAY,-7), time:'10:00' } },
    { d: addDays(SC_TODAY,9),   time:'19:30', subject:'Speaking Practice with YBM 초급', status:'upcoming' },
    { d: addDays(SC_TODAY,2),   time:'20:00', subject:'Speaking Practice with YBM 초중급',   status:'upcoming' },
    { d: addDays(SC_TODAY,-7),  time:'20:30', subject:'Speaking Practice with YBM 초중급',   status:'absent' },
    { d: addDays(SC_TODAY,4),   time:'19:00', subject:'데일리 프리토킹',    status:'upcoming' },
    { d: addDays(SC_TODAY,-7),  time:'20:30', subject:'여행 영어 회화',     status:'postponed' }
  ].map(function(c){ c.key = ymd(c.d); return c; });

  var SC_STATUS_BADGE = {
    upcoming:  { label:'예정', cls:'upcoming'  },
    attended:  { label:'출석', cls:'attended'  },
    postponed: { label:'연기', cls:'postponed' },
    absent:    { label:'결석', cls:'absent'    },
    cancelled: { label:'취소', cls:'cancelled' },
    makeup:    { label:'보강', cls:'makeup'    },
    skip:      { label:'SKIP', cls:'skip'      }
  };

  var scCourseIndex = 0; /* 스케줄 화면에서 고른 강좌 — courses 배열(클래스룸 강좌 목록)의 인덱스 */

  function scClassesOn(d){
    var key = ymd(d);
    var subject = courses[scCourseIndex].role;
    return SC_CLASSES.filter(function(c){ return c.key === key && c.subject === subject; }).sort(function(a,b){ return a.time.localeCompare(b.time); });
  }
  function scHasClassOn(d){
    var key = ymd(d);
    var subject = courses[scCourseIndex].role;
    return SC_CLASSES.some(function(c){ return c.key === key && c.subject === subject; });
  }
  /* 하단 리스트는 선택된 하루가 아니라 그 주(週) 전체를, 강좌 구분 없이 날짜순으로 모두 보여준다 */
  function scClassesInWeek(weekStart){
    var weekEnd = addDays(weekStart,6);
    var subject = courses[scCourseIndex].role;
    return SC_CLASSES.filter(function(c){
      return c.d >= weekStart && c.d <= weekEnd && c.subject === subject;
    }).sort(function(a,b){
      var byDate = ymd(a.d).localeCompare(ymd(b.d));
      return byDate !== 0 ? byDate : a.time.localeCompare(b.time);
    });
  }

  var scSelectedDate = SC_TODAY;
  var scMonthCursor = new Date(SC_TODAY.getFullYear(), SC_TODAY.getMonth(), 1);
  var scViewMode = 'week'; /* 'week' | 'month' — 팝업 없이 같은 자리에서 전환 */

  function scBuildCardHTML(c){
    var badge = (c.makeupOf && c.status === 'upcoming') ? { label:'보강', cls:'makeup' } : (SC_STATUS_BADGE[c.status] || SC_STATUS_BADGE.upcoming);
    /* 보강으로 대체된 예정 수업은 "보강 취소"가 최우선 액션 — 리뷰보기/연기신청/보강신청보다 먼저 확인 */
    /* CTA 색은 더 이상 상태별로 나누지 않는다 — 버튼은 항상 같은 톤(.btn:where([data-size="sm"]) 기본 스타일=블랙), 텍스트만 상태에 따라 달라진다 */
    var ctaText;
    if (c.makeupOf || c.status === 'makeup'){ ctaText = '보강 취소'; }
    else if (c.status === 'attended' || c.status === 'absent'){ ctaText = '리뷰보기'; }
    else if (c.status === 'postponed' || c.status === 'cancelled' || c.status === 'skip'){ ctaText = '보강신청'; }
    else { ctaText = '연기신청'; }
    /* 보강 수업 안내 — 박스 콜아웃 없이 리스트와 같은 톤의 캡션 두 줄로 간단히: 원수업 일시+취소 시 동작 / 예외 조건 */
    var noteHTML = '';
    if (c.makeupOf){
      var od = c.makeupOf.d;
      var origLabel = (od.getMonth()+1)+'.'+od.getDate()+'('+WD_LABEL[od.getDay()]+') '+c.makeupOf.time;
      noteHTML =
        '<div class="class-card-makeup-note">' +
          '<span class="class-card-note-line">원수업 '+origLabel+' · 취소 시 원복됩니다.</span>' +
          '<span class="class-card-note-sub">원수업 스케줄이 있는 경우 취소가 불가합니다.</span>' +
        '</div>';
    }
    return (
      '<div class="schedule-class-card status-'+c.status+'">' +
        '<div class="class-card-time"><span class="class-card-time-val">'+c.time+'</span><span class="badge" data-status="'+badge.cls+'">'+badge.label+'</span></div>' +
        '<div class="class-card-body">' +
          '<span class="s3-card-top"><span class="s3-lno">Lesson.'+('0'+(window.s3LessonIdx((c.makeupOf||c).d,scClassesOn)+1)).slice(-2)+'</span></span>' +
          '<div class="class-card-subject">'+window.S3_LESSONS[window.s3LessonIdx((c.makeupOf||c).d,scClassesOn)]+'</div>' +
        '</div>' +
        ((c.status === 'postponed' && !c.makeupOf && c.d >= SC_TODAY)
          ? '<span class="class-card-ctas"><button type="button" class="btn" data-variant="secondary" data-size="sm" data-act="보강신청">보강신청</button><button type="button" class="btn" data-variant="outlined" data-size="sm" data-act="연기 취소">연기 취소</button></span>'
          : '<button type="button" class="btn" data-variant="secondary" data-size="sm" data-act="'+ctaText+'">'+ctaText+'</button>') +
        noteHTML +
      '</div>'
    );
  }

  /* 시안2: 같은 날짜의 수업을 한 그룹(날짜 헤더 + 흰 카드)으로 묶어 날짜 반복을 없앤다 */
  function scBuildGroupedHTML(list){
    var html='', i=0;
    while(i<list.length){
      var d=list[i].d, rows='';
      while(i<list.length && sameDay(list[i].d,d)){ rows+=scBuildCardHTML(list[i]); i++; }
      var label=(d.getMonth()+1)+'.'+d.getDate()+' '+WD_LABEL[d.getDay()]+'요일';
      html+='<div class="schedule-day-group'+(sameDay(d,SC_TODAY)?' is-today':'')+'">'+
        '<div class="schedule-day-head">'+(sameDay(d,SC_TODAY)?'<span class="chip schedule-day-today" data-size="small" data-tone="brand">오늘</span>':'')+label+'</div>'+
        '<div class="schedule-day-rows">'+rows+'</div></div>';
    }
    return html;
  }

  function scRenderCourseInfo(){
    var c = courses[scCourseIndex], el = document.getElementById('scCourseInfo');
    if (el && c && c.period){
      var typeIc = { video:'<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="7" height="6" rx="1.5"/><path d="M8 5.25 10.6 3.9a.3.3 0 0 1 .4.27v3.66a.3.3 0 0 1-.4.27L8 6.75"/></svg>', phone:'<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.1 1.5H2.7a1 1 0 0 0-1 1.1c.5 4.3 3.3 7.1 7.6 7.6a1 1 0 0 0 1.1-1V7.9a.6.6 0 0 0-.45-.58l-1.6-.4a.6.6 0 0 0-.56.16l-.8.8A6.2 6.2 0 0 1 4.12 5.04l.8-.8a.6.6 0 0 0 .16-.56l-.4-1.6a.6.6 0 0 0-.58-.45Z"/></svg>' };
      el.innerHTML = '<span>'+c.period+'</span><i></i><span>'+c.when+'</span><span class="chip type-chip '+c.type+'" data-size="small" data-tone="'+(c.type === 'video' ? 'brand' : 'neutral')+'">'+typeIc[c.type]+(c.type === 'video' ? '화상' : '전화')+'</span>';
    }
  }

  function scRenderTopLabel(){
    scRenderCourseInfo();
    /* 시안2: 오늘이 이미 보이고 있으면 TODAY 버튼은 숨긴다 */
    var tb=document.getElementById('scTodayBtn');
    document.getElementById('scPrevBtn').setAttribute('aria-label', scViewMode==='week' ? '이전 주' : '이전 달');
    document.getElementById('scNextBtn').setAttribute('aria-label', scViewMode==='week' ? '다음 주' : '다음 달');
    if(tb){ var onToday = scViewMode==='week' ? sameDay(scSelectedDate,SC_TODAY)
      : (scMonthCursor.getFullYear()===SC_TODAY.getFullYear() && scMonthCursor.getMonth()===SC_TODAY.getMonth());
      tb.hidden = onToday; }
    var label = document.getElementById('scTopLabel');
    label.textContent = scViewMode === 'week' ? monthFmt(scSelectedDate) : monthFmt(scMonthCursor);
  }

  function scRenderWeek(){
    /* 월간 보기와 동일하게 일~토 달력 주 단위로 표시 — 요일 위치(칼럼)가 월간 그리드와 그대로 맞도록 한다 */
    /* 선택일(기본 오늘)이 항상 가운데(4번째) 칸 — ±3일 롤링 */
    var weekStart = addDays(scSelectedDate, -3);

    var strip = document.getElementById('scWeekStrip');
    strip.innerHTML = '';
    for (var i=0;i<7;i++){
      var day = addDays(weekStart,i);
      var dow = day.getDay();
      var isToday = sameDay(day,SC_TODAY);
      var isSel = sameDay(day,scSelectedDate);
      var has = scHasClassOn(day);
      var isHoliday = !!scHolidayName(day);
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'schedule-week-day' + (isToday?' today':'') + (isSel?' selected':'') + (dow===0?' sun':'') + (dow===6?' sat':'') + (isHoliday?' holiday':'');
      cell.innerHTML =
        '<span class="week-day-label">'+WD_LABEL[dow]+'</span>' +
        '<span class="week-day-num">'+day.getDate()+'</span>' +
        '<span class="week-day-dot'+(has?'':' hidden')+'"></span>';
      cell.addEventListener('click', function(dd){ return function(){ scSelectedDate = dd; scRenderWeek(); scRenderTopLabel(); }; }(day));
      strip.appendChild(cell);
    }

    /* 그 주에 있는 수업을 요일과 상관없이 날짜순으로 전부 보여준다 */
    var list = scClassesInWeek(weekStart);
    var listEl = document.getElementById('scAgendaList');
    listEl.innerHTML = list.length === 0
      ? '<div class="schedule-agenda-empty">예정된 수업이 없어요</div>'
      : scBuildGroupedHTML(list);
    /* 리스트 항목 클릭 시 선택일만 그 날짜로 이동(주는 그대로) — 위쪽 스트립이 함께 갱신된다 */
    Array.prototype.forEach.call(listEl.querySelectorAll('.schedule-class-card'), function(card, idx){
      card.addEventListener('click', function(){ scSelectedDate = list[idx].d; scRenderWeek(); scRenderTopLabel(); });
    });
    /* 스케줄 플로우(기획서 Schedule_040~050) : 버튼별 동작은 scFlow에서 처리 */
    Array.prototype.forEach.call(listEl.querySelectorAll('.schedule-class-card'), function(card, idx){
      Array.prototype.forEach.call(card.querySelectorAll('.btn'), function(btn){
        btn.addEventListener('click', function(e){ e.stopPropagation(); if (window.scFlow) window.scFlow(btn.getAttribute('data-act'), list[idx]); });
      });
    });
  }

  window.__scApi = { list:function(){ return SC_CLASSES; }, refresh:function(){ scRefreshCurrentView(); }, course:function(){ return courses[scCourseIndex].role; }, wd:WD_LABEL, sameDay:sameDay };

  /* 월간 보기 — 팝업이 아니라 주간 보기와 같은 자리에서 전환된다. 날짜를 클릭하면 그 날이 포함된 주간 보기로 이동 */
  function scRenderMonth(){
    var grid = document.getElementById('scMonthGrid');
    grid.innerHTML = '';
    var base = scMonthCursor, cur = null;
    for (var k = -2; k <= 3; k++){
      var m0 = new Date(base.getFullYear(), base.getMonth() + k, 1);
      var head = document.createElement('div');
      head.className = 's3-mhead' + (k === 0 ? ' is-cur' : ''); head.setAttribute('aria-label', monthFmt(m0)); head.setAttribute('role', 'separator');
      head.textContent = (m0.getFullYear() !== SC_TODAY.getFullYear() ? m0.getFullYear() + '년 ' : '') + (m0.getMonth() + 1) + '월';
      head._d = m0; grid.appendChild(head); if (k === 0) cur = head;
      var firstDow = m0.getDay(), dim = new Date(m0.getFullYear(), m0.getMonth() + 1, 0).getDate();
      for (var b = 0; b < firstDow; b++){ var bl = document.createElement('span'); bl.className = 'schedule-month-cell s3-blank'; grid.appendChild(bl); }
      for (var dn = 1; dn <= dim; dn++){
        var day = new Date(m0.getFullYear(), m0.getMonth(), dn);
        var isToday = sameDay(day,SC_TODAY), isSel = sameDay(day,scSelectedDate);
        var dayClasses = scClassesOn(day), hasClass = dayClasses.length > 0;
        var holidayName = scHolidayName(day), isHoliday = !!holidayName, markHTML;
        if (!hasClass){ markHTML = '<span class="month-cell-dot hidden"></span>'; }
        else {
          var st = dayClasses[0].status;
          markHTML = '<span class="chip month-cell-chip time-chip status-'+st+(dayClasses.length > 1 ? ' has-more' : '')+'" data-size="small" data-tone="'+({attended:'neutral',postponed:'warning',skip:'warning',absent:'danger',cancelled:'neutral',makeup:'info'}[st] || 'brand')+'">'+dayClasses[0].time+(dayClasses.length > 1 ? ' <b>+'+(dayClasses.length-1)+'</b>' : '')+'</span>';
        }
        var cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'schedule-month-cell' + (hasClass?' has-class':'') + (isToday?' today':'') + (isSel?' selected':'') + (isHoliday?' holiday':'');
        cell.innerHTML = '<span class="month-cell-num">'+day.getDate()+'</span>' + (isHoliday ? '<span class="month-cell-holiday-name">'+holidayName+'</span>' : '') + markHTML;
        cell.addEventListener('click', function(dd){ return function(){ scSelectedDate = dd; scSetViewMode('week'); }; }(day));
        if (dayClasses.length >= 2){ (function(cls, chip){ if (!chip) return; chip.addEventListener('click', function(ev){ ev.stopPropagation(); scToggleMonthTooltip(chip, cls); }); })(dayClasses, cell.querySelector('.month-cell-chip.has-more')); }
        grid.appendChild(cell);
      }
    }
    /* 스크롤 위치에 따라 상단 연·월 라벨을 지금 보이는 달로 */
    var label = document.getElementById('scTopLabel'), heads = [].slice.call(grid.querySelectorAll('.s3-mhead'));
    var sc = grid.closest('.scroll-area') || document.scrollingElement;
    function sync(){
      if (scViewMode !== 'month') return;
      var top = sc.getBoundingClientRect ? sc.getBoundingClientRect().top : 0, pick = heads[0];
      var hh0 = (document.querySelector('#scheduleArea .schedule-hero') || {}).offsetHeight || 0; heads.forEach(function(h){ if (h.getBoundingClientRect().top - top < 150 + hh0) pick = h; });
      if (pick && label) label.textContent = monthFmt(pick._d);
      /* 보이는 달이 이번 달이 아니면 TODAY 노출 */
      var tb = document.getElementById('scTodayBtn'); if (tb && pick) tb.hidden = pick._d.getFullYear() === SC_TODAY.getFullYear() && pick._d.getMonth() === SC_TODAY.getMonth();
    }
    if (sc._s3sync) sc.removeEventListener('scroll', sc._s3sync);
    sc._s3sync = sync; sc.addEventListener('scroll', sync, { passive:true });
    /* 처음엔 현재 달이 위로 오게 */
    requestAnimationFrame(function(){
      if (!cur || scViewMode !== 'month') return;
      var card = document.querySelector('.schedule-topbar-card');
      var hh = (document.querySelector('#scheduleArea .schedule-hero') || {}).offsetHeight || 0; var off = cur.getBoundingClientRect().top - sc.getBoundingClientRect().top - 84 - hh;
      sc.scrollTop += off; sync();
    });
  }

  /* 월간 "+N" 칩 툴팁 (시안1 v3 이식) */
  var scMonthTooltipChip = null;
  var SC_ST_LABEL = { upcoming:'예정', attended:'출석', postponed:'연기', absent:'결석', cancelled:'취소', makeup:'보강', skip:'SKIP' };
  function scShowMonthTooltip(chipEl, dayClasses){
    var tip = document.getElementById('scMonthTooltip'); if (!tip) return;
    tip.innerHTML = dayClasses.map(function(c){ return c.time + ' · ' + (c.makeupOf ? '보강' : (SC_ST_LABEL[c.status] || '예정')); }).join('<br>');
    tip.hidden = false; scMonthTooltipChip = chipEl;
    requestAnimationFrame(function(){
      var r = chipEl.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
      var left = Math.min(Math.max(8, r.left + r.width/2 - tw/2), window.innerWidth - tw - 8);
      var top = r.top - th - 8; if (top < 8) top = r.bottom + 8;
      tip.style.left = left + 'px'; tip.style.top = top + 'px'; tip.classList.add('on');
    });
  }
  function scHideMonthTooltip(){
    var tip = document.getElementById('scMonthTooltip'); if (!tip) return;
    tip.classList.remove('on'); scMonthTooltipChip = null;
    setTimeout(function(){ if (!tip.classList.contains('on')) tip.hidden = true; }, 150);
  }
  function scToggleMonthTooltip(chipEl, cls){ if (scMonthTooltipChip === chipEl) scHideMonthTooltip(); else scShowMonthTooltip(chipEl, cls); }
  document.addEventListener('click', function(e){
    var tip = document.getElementById('scMonthTooltip');
    if (!tip || tip.hidden) return;
    if (!tip.contains(e.target) && !e.target.closest('.month-cell-chip.has-more')) scHideMonthTooltip();
  });
  document.addEventListener('scroll', scHideMonthTooltip, true);

  /* 년월 선택 바텀시트 — 상단 라벨을 탭하면 연/월을 스크롤 휠로 고른다 */
  var SC_PICKER_ITEM_H = 36;
  var SC_PICKER_YEARS = (function(){
    var base = SC_TODAY.getFullYear();
    var arr = [];
    for (var y = base - 3; y <= base + 3; y++) arr.push(y);
    return arr;
  })();
  var SC_PICKER_MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12];
  var scPickerScrollTimers = {};

  function scBuildPickerCol(containerId, list, formatFn){
    var inner = document.getElementById(containerId);
    inner.innerHTML = list.map(function(v){
      return '<div class="schedule-picker-item" data-value="'+v+'">'+formatFn(v)+'</div>';
    }).join('');
  }
  function scScrollPickerTo(colEl, index, smooth){
    colEl.scrollTo({ top: index * SC_PICKER_ITEM_H, behavior: smooth ? 'smooth' : 'auto' });
  }
  function scSyncPickerActive(colEl){
    var items = colEl.querySelectorAll('.schedule-picker-item');
    var idx = Math.round(colEl.scrollTop / SC_PICKER_ITEM_H);
    idx = Math.max(0, Math.min(items.length-1, idx));
    Array.prototype.forEach.call(items, function(it,i){ it.classList.toggle('active', i===idx); });
    return idx;
  }
  function scOpenPicker(){
    var year = scViewMode === 'week' ? scSelectedDate.getFullYear() : scMonthCursor.getFullYear();
    var month = (scViewMode === 'week' ? scSelectedDate.getMonth() : scMonthCursor.getMonth()) + 1;

    scBuildPickerCol('scPickerYearInner', SC_PICKER_YEARS, function(v){ return v+'년'; });
    scBuildPickerCol('scPickerMonthInner', SC_PICKER_MONTHS, function(v){ return v+'월'; });

    var yearCol = document.getElementById('scPickerYearCol');
    var monthCol = document.getElementById('scPickerMonthCol');
    var yearIdx = SC_PICKER_YEARS.indexOf(year); if (yearIdx < 0) yearIdx = 3;
    var monthIdx = month - 1;

    var overlay = document.getElementById('scPickerOverlay');
    overlay.hidden = false;
    /* 오픈 애니메이션이 끝난 뒤 레이아웃이 확정된 상태에서 스크롤 위치를 맞춘다 */
    requestAnimationFrame(function(){
      scScrollPickerTo(yearCol, yearIdx, false);
      scScrollPickerTo(monthCol, monthIdx, false);
      scSyncPickerActive(yearCol);
      scSyncPickerActive(monthCol);
      requestAnimationFrame(function(){ overlay.classList.add('on'); });
    });
  }
  function scClosePicker(){
    var overlay = document.getElementById('scPickerOverlay');
    overlay.classList.remove('on');
    setTimeout(function(){ overlay.hidden = true; }, 220);
  }
  function scPickerColScrollHandler(colEl, key){
    return function(){
      clearTimeout(scPickerScrollTimers[key]);
      scPickerScrollTimers[key] = setTimeout(function(){ scSyncPickerActive(colEl); }, 90);
    };
  }
  (function initScPicker(){
    var trigger = document.getElementById('scMonthTrigger');
    var overlay = document.getElementById('scPickerOverlay');
    var yearCol = document.getElementById('scPickerYearCol');
    var monthCol = document.getElementById('scPickerMonthCol');

    trigger.addEventListener('click', scOpenPicker);
    document.getElementById('scPickerCancel').addEventListener('click', scClosePicker);
    overlay.addEventListener('click', function(e){ if (e.target === overlay) scClosePicker(); });

    yearCol.addEventListener('scroll', scPickerColScrollHandler(yearCol, 'year'));
    monthCol.addEventListener('scroll', scPickerColScrollHandler(monthCol, 'month'));

    /* 항목을 직접 탭하면 그 항목이 가운데로 스크롤되며 선택된다 */
    yearCol.addEventListener('click', function(e){
      var item = e.target.closest('.schedule-picker-item'); if (!item) return;
      scScrollPickerTo(yearCol, Array.prototype.indexOf.call(yearCol.querySelectorAll('.schedule-picker-item'), item), true);
    });
    monthCol.addEventListener('click', function(e){
      var item = e.target.closest('.schedule-picker-item'); if (!item) return;
      scScrollPickerTo(monthCol, Array.prototype.indexOf.call(monthCol.querySelectorAll('.schedule-picker-item'), item), true);
    });

    document.getElementById('scPickerConfirm').addEventListener('click', function(){
      var year = SC_PICKER_YEARS[scSyncPickerActive(yearCol)];
      var month = SC_PICKER_MONTHS[scSyncPickerActive(monthCol)];
      if (scViewMode === 'week'){
        var lastDay = new Date(year, month, 0).getDate();
        var day = Math.min(scSelectedDate.getDate(), lastDay);
        scSelectedDate = new Date(year, month-1, day);
        scRenderWeek();
      } else {
        scMonthCursor = new Date(year, month-1, 1);
        scRenderMonth();
      }
      scRenderTopLabel();
      scClosePicker();
    });
  })();

  /* 주간 ↔ 월간 보기 전환 — 팝업 없이 같은 영역이 바뀐다. 세그먼트 두 버튼 중 하나를 누르면 그 모드로 바뀐다 */
  function scSetViewMode(mode){
    scViewMode = mode;
    var isWeek = mode === 'week';
    document.getElementById('scWeekStrip').hidden = !isWeek;
    document.getElementById('scAgendaSection').hidden = !isWeek;
    document.getElementById('scMonthCalendar').hidden = isWeek;
    Array.prototype.forEach.call(document.querySelectorAll('.segment'), function(seg){
      var on = seg.getAttribute('data-mode') === mode;
      seg.classList.toggle('on', on);
      seg.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (isWeek){ scRenderWeek(); }
    else { scMonthCursor = new Date(scSelectedDate.getFullYear(), scSelectedDate.getMonth(), 1); scRenderMonth(); }
    scRenderTopLabel();
  }
  Array.prototype.forEach.call(document.querySelectorAll('.segment'), function(seg){
    seg.addEventListener('click', function(){
      var mode = seg.getAttribute('data-mode');
      if (mode !== scViewMode) scSetViewMode(mode);
    });
  });
  /* 주단위 이동 : 주간 = ±7일(선택일 가운데 유지), 월간 = ±1달. 주간 스트립은 좌우 스와이프도 지원 */
  function scStep(dir){
    if (scViewMode === 'week'){ scSelectedDate = addDays(scSelectedDate, 7*dir); scRenderWeek(); }
    else { scMonthCursor = new Date(scMonthCursor.getFullYear(), scMonthCursor.getMonth()+dir, 1); scRenderMonth(); }
    scRenderTopLabel();
  }
  document.getElementById('scPrevBtn').addEventListener('click', function(){ scStep(-1); });
  document.getElementById('scNextBtn').addEventListener('click', function(){ scStep(1); });
  (function(){
    var strip = document.getElementById('scWeekStrip'), x0 = null, y0 = null;
    strip.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, {passive:true});
    strip.addEventListener('touchend', function(e){
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) scStep(dx < 0 ? 1 : -1);
    });
  })();

  /* 오늘로 바로 이동 — 현재 보기 모드를 유지한 채 선택일/월 커서를 오늘로 되돌린다 */
  document.getElementById('scTodayBtn').addEventListener('click', function(){
    scSelectedDate = SC_TODAY;
    if (scViewMode === 'week'){ scRenderWeek(); }
    else { scMonthCursor = new Date(SC_TODAY.getFullYear(), SC_TODAY.getMonth(), 1); scRenderMonth(); }
    scRenderTopLabel();
  });

  /* 강좌 선택 : 클래스룸 강좌명 스크롤과 동일한 알약 탭. 목록은 클래스룸 홈과 동일한 courses 배열을 그대로 사용한다.
     탭은 요일 점(dot)·월간 표시의 기준 강좌만 바꾸고, 주간 리스트는 항상 그 주 전체 강좌를 보여준다 */
  var scCourseScroll = document.getElementById('scCourseScroll');

  function scRenderCourseTabs(){
    if (!scCourseScroll) return; /* 시안2는 강좌 칩 대신 상단 드롭다운 */
    scCourseScroll.innerHTML = '';
    courses.forEach(function(c, i){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role','tab');
      btn.textContent = c.role;
      if (i === scCourseIndex) { btn.classList.add('on'); btn.setAttribute('aria-selected','true'); }
      else btn.setAttribute('aria-selected','false');
      btn.addEventListener('click', function(){
        scCourseIndex = i;
        scRenderCourseTabs();
        scRefreshCurrentView();
      });
      scCourseScroll.appendChild(btn);
    });
  }

  function scRefreshCurrentView(){
    if (scViewMode === 'week'){ scRenderWeek(); } else { scRenderMonth(); }
    scRenderTopLabel();
  }

  scRenderCourseTabs();
  scRefreshCurrentView();

  /* 시안2 상단 강좌 드롭다운 → 캘린더 기준 강좌 변경 */
  var courseSelectBtn = document.getElementById('courseSelectBtn');
  var courseMenu = document.getElementById('courseMenu');
  courseSelectBtn.addEventListener('click', function(e){ e.stopPropagation(); courseSelectBtn.classList.toggle('open'); courseMenu.classList.toggle('open'); });
  courseMenu.querySelectorAll('button').forEach(function(b){
    b.addEventListener('click', function(){
      var name = b.getAttribute('data-course');
      document.getElementById('courseSelectName').textContent = name;
      var idx = courses.findIndex(function(c){ return c.role === name; });
      if (idx > -1){ scCourseIndex = idx; scRefreshCurrentView(); }
      courseSelectBtn.classList.remove('open'); courseMenu.classList.remove('open');
    });
  });
  document.addEventListener('click', function(){ courseSelectBtn.classList.remove('open'); courseMenu.classList.remove('open'); });

  /* 하단 내비 화면 전환 */
  var screens = { classroom: document.getElementById('scrollArea'), schedule: document.getElementById('scheduleArea') };
  var NAV_TITLES = { classroom:'클래스룸', schedule:'스케줄', attendance:'출석체크' };
  var topTitle = document.querySelector('.classroom-topbar-title');
  var tabsNav = document.querySelector('.classroom-tabs');
  document.querySelectorAll('.nav-item[data-nav]').forEach(function(item){
    item.addEventListener('click', function(){
      var key = item.getAttribute('data-nav');
      if (key === 'attendance'){ if (window.attOpen) window.attOpen(); return; }
      document.querySelectorAll('.nav-item[data-nav]').forEach(function(i){ i.classList.remove('active'); });
      item.classList.add('active');
      if (screens[key]) Object.keys(screens).forEach(function(k){ screens[k].hidden = (k !== key); });
      if (window.__clsSyncTab) window.__clsSyncTab(key);
      topTitle.textContent = NAV_TITLES[key] || topTitle.textContent;
      tabsNav.hidden = key !== 'classroom';
      if (key === 'schedule') scRefreshCurrentView();
    });
  });
})();

(function(){
  "use strict";
  var qaOverlay = document.getElementById('qaOverlay');
  if (!qaOverlay) return;

  var qaWriteView = document.getElementById('qaWriteView');
  var qaHistoryView = document.getElementById('qaHistoryView');
  var qaSuccessView = document.getElementById('qaSuccessView');
  var qaFootWrite = document.getElementById('qaFootWrite');
  var qaFootSuccess = document.getElementById('qaFootSuccess');
  var qaTabs = document.getElementById('qaTabs');
  var qaTabsWrap = document.getElementById('qaTabsWrap');
  var qaBody = document.getElementById('qaBody');

  var qaInputTitle = document.getElementById('qaInputTitle');
  var qaInputContent = document.getElementById('qaInputContent');
  var qaInputEmail = document.getElementById('qaInputEmail');

  /* 나의 질문 내역 데모 데이터 — 최근 작성일 순. 제출에 성공하면 맨 위에 새 항목이 추가된다 */
  var qaHistory = [
    { date:'2026-09-10', title:'리스닝 파트 학습법 문의', content:'회화 수업 중 리스닝 파트를 더 효율적으로 연습하는 방법이 궁금합니다. 관련 자료도 추천해 주시면 감사하겠습니다.' },
    { date:'2026-08-22', title:'수업 교재 관련 질문', content:'이번 주 교재 3번째 유닛에 나온 표현을 실제 대화에서 어떻게 활용하면 좋을지 여쭤봅니다.' }
  ];

  function qaFmtDate(d){
    var p = function(n){ return (n<10?'0':'')+n; };
    return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());
  }

  function qaEsc(s){
    return s.replace(/[&<>]/g, function(c){ return c==='&' ? '&amp;' : (c==='<' ? '&lt;' : '&gt;'); });
  }

  function qaRenderHistory(){
    var list = document.getElementById('qaHistoryList');
    if (!qaHistory.length){
      list.innerHTML = '<p class="qa-history-empty">아직 남긴 질문이 없어요.</p>';
      return;
    }
    list.innerHTML = qaHistory.map(function(h){
      return (
        '<div class="qa-history-item">' +
          '<div class="qa-h-date">'+h.date+'</div>' +
          '<div class="qa-h-title">'+qaEsc(h.title)+'</div>' +
          '<div class="qa-h-content">'+qaEsc(h.content)+'</div>' +
        '</div>'
      );
    }).join('');
  }

  /* 질문하기(작성) ↔ 나의 질문 내역 — 클래스룸 상단 상태 탭(진행/예정/완료)과 같은 밑줄 탭으로 전환 */
  function qaSetTab(tab){
    var isWrite = tab === 'write';
    qaWriteView.hidden = !isWrite;
    qaHistoryView.hidden = isWrite;
    qaFootWrite.hidden = !isWrite;
    Array.prototype.forEach.call(qaTabs.querySelectorAll('button'), function(seg){
      var on = seg.getAttribute('data-qa-tab') === tab;
      seg.classList.toggle('on', on);
      seg.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    qaBody.scrollTop = 0;
  }
  Array.prototype.forEach.call(qaTabs.querySelectorAll('button'), function(seg){
    seg.addEventListener('click', function(){ qaSetTab(seg.getAttribute('data-qa-tab')); });
  });

  function qaClearErrors(){
    ['qaFieldTitle','qaFieldContent','qaFieldEmail'].forEach(function(id){
      document.getElementById(id).classList.remove('error');
    });
  }
  function qaShowError(fieldId){ document.getElementById(fieldId).classList.add('error'); }

  var QA_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* 알럿 대신 필드별 인라인 에러로 안내 — 제목/내용/이메일 미입력 시 각각의 입력창 아래 표시 */
  function qaValidate(){
    qaClearErrors();
    var title = qaInputTitle.value.trim();
    var content = qaInputContent.value.trim();
    var email = qaInputEmail.value.trim();
    var firstInvalid = null;

    if (!email || !QA_EMAIL_RE.test(email)){ qaShowError('qaFieldEmail'); firstInvalid = firstInvalid || qaInputEmail; }
    if (!content){ qaShowError('qaFieldContent'); firstInvalid = firstInvalid || qaInputContent; }
    if (!title){ qaShowError('qaFieldTitle'); firstInvalid = firstInvalid || qaInputTitle; }

    if (firstInvalid){ firstInvalid.focus(); return false; }
    return true;
  }

  function qaResetForm(){
    qaInputTitle.value = '';
    qaInputContent.value = '';
    qaInputEmail.value = '';
    qaClearErrors();
  }

  function qaShowSuccess(){
    qaTabsWrap.hidden = true;
    qaWriteView.hidden = true;
    qaHistoryView.hidden = true;
    qaFootWrite.hidden = true;
    qaSuccessView.hidden = false;
    qaFootSuccess.hidden = false;
  }

  document.getElementById('qaSubmitBtn').addEventListener('click', function(){
    if (!qaValidate()) return;
    qaHistory.unshift({
      date: qaFmtDate(new Date()),
      title: qaInputTitle.value.trim(),
      content: qaInputContent.value.trim()
    });
    qaRenderHistory();
    qaShowSuccess();
  });

  function qaOpen(){
    qaRenderHistory();
    qaTabsWrap.hidden = false;
    qaSuccessView.hidden = true;
    qaFootSuccess.hidden = true;
    qaSetTab('write');
    qaOverlay.hidden = false;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ qaOverlay.classList.add('on'); });
    });
  }
  function qaClose(){
    qaOverlay.classList.remove('on');
    setTimeout(function(){
      qaOverlay.hidden = true;
      qaResetForm();
    }, 220);
  }

  document.getElementById('qaCloseBtn').addEventListener('click', qaClose);
  document.getElementById('qaCancelBtn').addEventListener('click', qaClose);
  document.getElementById('qaSuccessConfirmBtn').addEventListener('click', qaClose);
  qaOverlay.addEventListener('click', function(e){ if (e.target === qaOverlay) qaClose(); });

  var qaTrigger = document.getElementById('ctaAskQuestion');
  if (qaTrigger) qaTrigger.addEventListener('click', qaOpen);
})();

(function(){
  "use strict";
  var satOverlay = document.getElementById('satOverlay');
  if (!satOverlay) return;

  var satFormView = document.getElementById('satFormView');
  var satLockedView = document.getElementById('satLockedView');
  var satSuccessView = document.getElementById('satSuccessView');
  var satFootForm = document.getElementById('satFootForm');
  var satFootDone = document.getElementById('satFootDone');
  var satErrorBanner = document.getElementById('satErrorBanner');
  var satList = document.getElementById('satList');

  /* 기획서(Slide 19) 문항 6개 — ※ 3번과 4번 문구가 원본 기획서에도 동일하게 실려 있음(원본 중복으로 추정,
     실제 서비스 반영 전 기획팀 확인 필요). 지금은 원문 그대로 둔다 */
  var SAT_QUESTIONS = [
    '강사님과의 수업이 재미있으셨나요?',
    '수업 내용에 대해 이해할 수 있도록, 강사님이 잘 설명해 주셨나요?',
    '회원님의 발음과 문법 등에 대해, 강사님이 잘 교정해 주셨나요?',
    '회원님의 발음과 문법 등에 대해, 강사님이 잘 교정해 주셨나요?',
    '수업 시작시간과 종료시간은 잘 준수되었나요?',
    '마지막으로, 현재의 강사님과 지속적으로 수업하기를 원하시나요?'
  ];

  /* 데모 상태 — 한 번 제출하면 "이미 참여" 잠김 화면으로 바뀐다(기획서의 "수강 기간 중 1회 제한").
     ※ "수업 시작 7일 이후에만 평가 가능" 게이트는 실제 수업 시작일 데이터가 있어야 판단할 수 있어
     지금은 데모에 넣지 않음 — 실 연동 시 이 조건을 오픈 시점에 추가하면 된다 */
  var satCompleted = false;
  var satAnswers = SAT_QUESTIONS.map(function(){ return 0; });


  function satRenderList(){
    satList.innerHTML = SAT_QUESTIONS.map(function(q, qi){
      var stars = '';
      for (var v = 1; v <= 5; v++){
        stars += '<button type="button" class="satisfaction-star satisfaction-num" data-q="'+qi+'" data-v="'+v+'" aria-label="'+v+'점" aria-pressed="false"><span class="num">'+v+'</span></button>';
      }
      return (
        '<div class="satisfaction-item" id="satItem'+qi+'">' +
          '<p class="satisfaction-q"><span class="satisfaction-q-num">'+(qi+1)+'.</span><span class="satisfaction-q-text">'+q+'</span></p>' +
          '<div class="satisfaction-stars satisfaction-nums">'+stars+'</div>' +
          '<div class="satisfaction-scale"><span>전혀 아니에요</span><span>매우 그래요</span></div>' +
        '</div>'
      );
    }).join('');
  }

  function satRenderDots(qi){
    var item = document.getElementById('satItem'+qi);
    Array.prototype.forEach.call(item.querySelectorAll('.satisfaction-star'), function(star){
      var on = +star.getAttribute('data-v') <= satAnswers[qi]; /* 시안2: 고른 단계까지 앞의 박스도 함께 채워짐 */
      star.classList.toggle('filled', on); star.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* 별 터치 — n번째를 누르면 1~n이 모두 채워진다(기획서 예시: 3번째 클릭 시 1·2·3 모두 채워짐) */
  satList.addEventListener('click', function(e){
    var star = e.target.closest('.satisfaction-star');
    if (!star) return;
    var qi = +star.getAttribute('data-q');
    satAnswers[qi] = +star.getAttribute('data-v');
    satRenderDots(qi);
    document.getElementById('satItem'+qi).classList.remove('error');
  });

  /* 알럿 대신 미입력 문항을 빨간 텍스트로 표시 + 상단 배너 — 기획서 알럿 "평가하지 않은 항목을 확인해 주세요" */
  function satValidate(){
    var firstInvalid = null;
    SAT_QUESTIONS.forEach(function(_, qi){
      var item = document.getElementById('satItem'+qi);
      var ok = satAnswers[qi] > 0;
      item.classList.toggle('error', !ok);
      if (!ok) firstInvalid = firstInvalid || item;
    });
    satErrorBanner.classList.toggle('on', !!firstInvalid);
    if (firstInvalid) firstInvalid.scrollIntoView({ block:'center', behavior:'smooth' });
    return !firstInvalid;
  }

  function satShowView(view){
    satFormView.hidden = view !== 'form';
    satLockedView.hidden = view !== 'locked';
    satSuccessView.hidden = view !== 'success';
    satFootForm.hidden = view !== 'form';
    satFootDone.hidden = view === 'form';
  }

  document.getElementById('satSubmitBtn').addEventListener('click', function(){
    if (!satValidate()) return;
    satCompleted = true;
    satShowView('success');
  });

  function satOpen(){
    if (satCompleted){
      satShowView('locked');
    } else {
      satAnswers = SAT_QUESTIONS.map(function(){ return 0; });
      satErrorBanner.classList.remove('on');
      satRenderList();
      satShowView('form');
    }
    satOverlay.hidden = false;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ satOverlay.classList.add('on'); });
    });
  }
  function satClose(){
    satOverlay.classList.remove('on');
    setTimeout(function(){ satOverlay.hidden = true; }, 220);
  }

  document.getElementById('satCloseBtn').addEventListener('click', satClose);
  document.getElementById('satCancelBtn').addEventListener('click', satClose);
  document.getElementById('satDoneConfirmBtn').addEventListener('click', satClose);
  satOverlay.addEventListener('click', function(e){ if (e.target === satOverlay) satClose(); });

  var satTrigger = document.getElementById('ctaSatisfaction');
  if (satTrigger) satTrigger.addEventListener('click', satOpen);
})();

(function(){
  "use strict";
  var revOverlay = document.getElementById('revOverlay');
  if (!revOverlay) return;

  /* 발음 확인 2건(단어) / 교정 문장 1건 — 클래스룸 홈 카드의 칩 숫자("발음 확인 2", "교정 문장 1")와 맞춘다.
     발음 확인은 기획안 근거로 문장이 아닌 단어 단위 리스트로 구성(각 단어마다 듣기/재평가 아이콘) */
  var REV_PRON = [
    { word:'taste' },
    { word:'noodles' }
  ];
  var REV_GRAM = [
    { orig:"She don't have any hobby these day.", fix:"She doesn't have any hobbies these days." }
  ];

  var ICON_SPEAK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  var ICON_MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/></svg>';

  function revEsc(s){
    return s.replace(/[&<>]/g, function(c){ return c==='&' ? '&amp;' : (c==='<' ? '&lt;' : '&gt;'); });
  }

  /* 듣기(스피커)/재평가(마이크) 아이콘 버튼 공통 동작 — 실제 오디오·음성 인식 없이 아이콘이 잠깐
     활성 상태로 바뀌는 것으로 "재생 중"/"평가 중" 느낌만 시뮬레이션한다 */
  function revBindIconBtns(root){
    /* 듣기 : 재생 중 이퀄라이저 / 마이크 : 다시 평가 팝업(단어 2지표 · 문장 4지표) */
    Array.prototype.forEach.call(root.querySelectorAll('.review-speak-btn'), function(btn){
      btn.insertAdjacentHTML('beforeend', '<span class="review-eq" aria-hidden="true"><i></i><i></i><i></i></span>');
      btn.addEventListener('click', function(){
        var on = !btn.classList.contains('playing');
        Array.prototype.forEach.call(document.querySelectorAll('.review-speak-btn.playing'), function(b){ b.classList.remove('playing'); clearTimeout(b._t); });
        if (on){ btn.classList.add('playing'); btn._t = setTimeout(function(){ btn.classList.remove('playing'); }, 2200); }
      });
    });
    Array.prototype.forEach.call(root.querySelectorAll('.review-mic-btn'), function(btn){
      btn.addEventListener('click', function(){
        var pron = btn.closest('.review-pron-item'), gram = btn.closest('.review-gram-item');
        if (pron && window.veOpen) window.veOpen(pron.querySelector('.review-pron-word').textContent, false);
        else if (gram && window.veOpen){ var fx = gram.querySelector('.review-sent.fix').cloneNode(true); var tg = fx.querySelector('.review-sent-tag'); if (tg) tg.remove(); window.veOpen(fx.textContent.trim(), true); }
      });
    });
  }

  function revRenderPron(){
    var list = document.getElementById('revPronList');
    list.innerHTML = REV_PRON.map(function(item){
      return (
        '<div class="review-pron-item">' +
          '<span class="review-pron-word">'+revEsc(item.word)+'</span>' +
          '<div class="review-pron-actions">' +
            '<button type="button" class="review-speak-btn" aria-label="'+revEsc(item.word)+' 발음 듣기">'+ICON_SPEAK+'</button>' +
            '<button type="button" class="review-mic-btn" aria-label="'+revEsc(item.word)+' 발음 다시 평가하기">'+ICON_MIC+'</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');
    revBindIconBtns(list);
  }

  function revRenderGram(){
    var list = document.getElementById('revGramList');
    list.innerHTML = REV_GRAM.map(function(item){
      return (
        '<div class="review-gram-item">' +
          '<p class="review-sent orig"><span class="chip review-sent-tag" data-size="base" data-tone="neutral">원문</span>'+revEsc(item.orig)+'</p>' +
          '<p class="review-sent fix"><span class="chip review-sent-tag" data-size="base" data-tone="brand">교정문</span>'+revEsc(item.fix)+'</p>' +
          '<div class="review-gram-actions">' +
            '<button type="button" class="review-speak-btn" aria-label="교정 문장 듣기">'+ICON_SPEAK+'</button>' +
            '<button type="button" class="review-mic-btn" aria-label="교정 문장 다시 말해보기">'+ICON_MIC+'</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');
    revBindIconBtns(list);
  }

  /* 오늘 수업 다시듣기 — 아이콘·라벨이 바뀌며 재생/일시정지 토글(실제 오디오 없이 상태만 시뮬레이션) */
  var revReplayBtn = document.getElementById('revReplayBtn');
  var revReplayLabel = revReplayBtn.querySelector('.review-replay-label');
  revReplayBtn.addEventListener('click', function(){
    var playing = revReplayBtn.classList.toggle('playing');
    revReplayLabel.textContent = playing ? '재생 중' : '지난 수업 다시 듣기';
    revReplayBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
  });

  function revOpen(){
    revRenderPron();
    revRenderGram();
    revReplayBtn.classList.remove('playing');
    revReplayLabel.textContent = '지난 수업 다시 듣기';
    revOverlay.hidden = false;
    revOverlay.querySelector('.modal-body').scrollTop = 0;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ revOverlay.classList.add('on'); });
    });
  }
  function revClose(){
    revOverlay.classList.remove('on');
    setTimeout(function(){ revOverlay.hidden = true; }, 220);
  }

  document.getElementById('revCloseBtn').addEventListener('click', revClose);
  document.getElementById('revCloseFootBtn').addEventListener('click', revClose);
  revOverlay.addEventListener('click', function(e){ if (e.target === revOverlay) revClose(); });

  /* 마이크 테스트 — 발음 확인 섹션의 마이크 하드웨어 사전 점검 보조 팝업. 문장별 재평가(.review-mic-btn)와는 별개.
     녹음 시뮬레이션 후 인식 성공/실패를 토스트로 안내한다(실제 음성 인식 없이 데모용으로 랜덤 판정). */
  var mtOverlay = document.getElementById('revMicTestOverlay');
  if (mtOverlay) {
    var mtMic = document.getElementById('revMicTestBtn');
    var mtToast = document.getElementById('revMicTestToast');
    var mtBusy = false;

    function mtOpen(){
      mtBusy = false;
      mtMic.classList.remove('recording');
      mtToast.className = 'mic-test-toast';
      mtToast.innerHTML = '';
      mtOverlay.hidden = false;
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){ mtOverlay.classList.add('on'); });
      });
    }
    function mtClose(){
      mtOverlay.classList.remove('on');
      setTimeout(function(){ mtOverlay.hidden = true; }, 200);
    }
    function mtShowToast(ok){
      mtToast.className = 'mic-test-toast ' + (ok ? 'success' : 'fail');
      mtToast.innerHTML = ok
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span>마이크 테스트에 성공했어요</span>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9L2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg><span>음성 인식이 되지 않았습니다.<br>마이크 상태를 확인해 주세요.</span>';
      requestAnimationFrame(function(){ mtToast.classList.add('show'); });
      setTimeout(function(){ mtToast.classList.remove('show'); }, 2600);
    }
    mtMic.addEventListener('click', function(){
      if (mtBusy) return;
      mtBusy = true;
      mtToast.classList.remove('show');
      mtMic.classList.add('recording');
      setTimeout(function(){
        mtMic.classList.remove('recording');
        mtShowToast(Math.random() > 0.25);
        mtBusy = false;
      }, 1300);
    });
    document.getElementById('revMicTestCloseBtn').addEventListener('click', mtClose);
    mtOverlay.addEventListener('click', function(e){ if (e.target === mtOverlay) mtClose(); });
    var mtTrigger = document.getElementById('revMicTestTrigger');
    if (mtTrigger) mtTrigger.addEventListener('click', mtOpen);
  }

  var revGotoTrigger = document.getElementById('tileReview');
  var revReplayTrigger = document.getElementById('fbReviewReplayBtn');
  window.revOpen = revOpen;
  if (revGotoTrigger) revGotoTrigger.addEventListener('click', revOpen);
  if (revReplayTrigger) revReplayTrigger.addEventListener('click', revOpen);
})();

(function(){
  "use strict";
  var crOverlay = document.getElementById('crOverlay');
  if (!crOverlay) return;

  /* 클래스룸 홈 Class Report 카드는 세로 막대(간략 미리보기)지만, 팝업 안에서는 5개 항목의 균형을
     한눈에 보여주는 방사형 그래프로 확대해서 보여준다. 카드(#fbReportBars)에 이미 표시 중인 값을
     그대로 읽어와 그린다 — 데이터를 중복으로 들고 있지 않고 항상 카드와 같은 값을 보여주기 위함 */
  function crPolarPoint(cx, cy, r, i, n){
    var angle = (-90 + (360 / n) * i) * Math.PI / 180;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  function crBuildRadar(){
    var items = [
      { label:'이해력', val:10 }, { label:'유창성', val:8 }, { label:'발음', val:6 },
      { label:'어휘', val:4 }, { label:'문법', val:4 }
    ];
    var n = items.length;
    if (!n) return;

    var cx = 150, cy = 148, R = 90;
    var levels = [0.25, 0.5, 0.75, 1];

    var gridSvg = levels.map(function(lv, li){
      var pts = [];
      for (var i = 0; i < n; i++){
        var p = crPolarPoint(cx, cy, R * lv, i, n);
        pts.push(p[0].toFixed(1) + ',' + p[1].toFixed(1));
      }
      return '<polygon points="' + pts.join(' ') + '" class="report-radar-ring"' + (li === levels.length - 1 ? ' data-outer="1"' : '') + '/>';
    }).join('');

    var axisSvg = '';
    var dataPts = [];
    var labelSvg = '';
    for (var i = 0; i < n; i++){
      var outer = crPolarPoint(cx, cy, R, i, n);
      axisSvg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + outer[0].toFixed(1) + '" y2="' + outer[1].toFixed(1) + '" class="report-radar-axis"/>';

      var pct = Math.max(0, Math.min(1, items[i].val / 10));
      var dp = crPolarPoint(cx, cy, R * pct, i, n);
      dataPts.push(dp[0].toFixed(1) + ',' + dp[1].toFixed(1));

      var lp = crPolarPoint(cx, cy, R + 26, i, n);
      var anchor = 'middle';
      if (lp[0] > cx + 4) anchor = 'start';
      else if (lp[0] < cx - 4) anchor = 'end';
      labelSvg +=
        '<text x="' + lp[0].toFixed(1) + '" y="' + (lp[1] - 3).toFixed(1) + '" text-anchor="' + anchor + '" class="report-radar-label">' + items[i].label + '</text>' +
        '<text x="' + lp[0].toFixed(1) + '" y="' + (lp[1] + 13).toFixed(1) + '" text-anchor="' + anchor + '" class="report-radar-val">' + items[i].val + '</text>';
    }

    var dotsSvg = dataPts.map(function(p){
      var xy = p.split(',');
      return '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="4" class="report-radar-dot"/>';
    }).join('');

    document.getElementById('crRadarWrap').innerHTML =
      '<svg viewBox="0 0 300 296" class="report-radar-svg" role="img" aria-label="이번 달 5개 항목 평가 결과">' +
        '<defs><linearGradient id="crRadarGrad" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" style="stop-color:var(--brand-text-link)"/>' +
          '<stop offset="100%" style="stop-color:var(--brand-interactive-hover)"/>' +
        '</linearGradient></defs>' +
        gridSvg + axisSvg +
        '<polygon points="' + dataPts.join(' ') + '" class="report-radar-fill"/>' +
        dotsSvg + labelSvg +
      '</svg>';
  }

  function crBuildPeriod(){
    var dateEl = document.getElementById('fbReportDate');
    var periodEl = document.getElementById('crPeriod');
    /* 날짜(칩)와 튜터명(별도 텍스트)이 마크업으로 분리돼 있어, 여기서는 날짜 칩 텍스트만 채운다 */
    if (dateEl && periodEl) periodEl.textContent = '평가 기간 ' + dateEl.textContent.trim();
  }

  function crOpen(){
    crBuildPeriod();
    crBuildRadar();
    crOverlay.hidden = false;
    crOverlay.querySelector('.modal-body').scrollTop = 0;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ crOverlay.classList.add('on'); });
    });
  }
  function crClose(){
    crOverlay.classList.remove('on');
    setTimeout(function(){ crOverlay.hidden = true; }, 220);
  }

  document.getElementById('crCloseBtn').addEventListener('click', crClose);
  crOverlay.addEventListener('click', function(e){ if (e.target === crOverlay) crClose(); });

  var crGotoTrigger = document.getElementById('tileReport');
  window.crOpen = crOpen;
  if (crGotoTrigger) crGotoTrigger.addEventListener('click', crOpen);
})();

/* 만족도 카드의 '아쉬웠어요'도 같은 만족도 평가 팝업을 연다 */
  /* 만족도 카드는 카드 전체가 하나의 버튼(#ctaSatisfaction) */

(function(){
  /* 수강중 강좌 스와이프 — 스크롤 위치로 현재 강좌를 판단해 페이지 표시와 라이브 카드(레슨명)를 함께 바꾼다 */
  var sw = document.getElementById('courseSwiper'); if (!sw) return;
  var slides = Array.prototype.slice.call(sw.querySelectorAll('.course-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('#courseDots button'));
  var live = document.getElementById('liveCard');
  var cur = 0, t = null;
  function target(i){ var max = sw.scrollWidth - sw.clientWidth; return i === slides.length-1 ? max : Math.min(max, slides[i].offsetLeft - slides[0].offsetLeft); }
  function setActive(idx){
    if (idx === cur) return; cur = idx;
    document.dispatchEvent(new CustomEvent('coursechange', {detail: idx}));
    dots.forEach(function(d,i){ d.classList.toggle('on', i===idx); d.setAttribute('aria-selected', i===idx ? 'true':'false'); });
    live.classList.add('swapping');
    setTimeout(function(){
      document.getElementById('liveLessonTitle').textContent = slides[idx].getAttribute('data-lesson');
      document.getElementById('liveLessonNum').textContent = slides[idx].getAttribute('data-lesson-num');
      document.getElementById('liveWhen').textContent = slides[idx].getAttribute('data-when') || '';
      live.classList.remove('swapping');
    }, 180);
  }
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
})();

(function(){
  /* 강좌 스와이프 힌트 — 강좌가 2개 이상일 때 첫 진입 0.7초 뒤 한 번만 빼꼼빼꼼, 사용자가 먼저 만지면 생략 */
  var sw = document.getElementById('courseSwiper'); if (!sw || sw.querySelectorAll('.course-slide').length < 2) return;
  var touched = false;
  ['pointerdown','touchstart','scroll'].forEach(function(ev){ sw.addEventListener(ev, function(){ touched = true; sw.classList.remove('peek'); }, {passive:true, once:true}); });
  setTimeout(function(){
    if (touched) return;
    sw.classList.add('peek');
    setTimeout(function(){ sw.classList.remove('peek'); }, 1900);
  }, 700);
})();

(function(){
  "use strict";
  var aihOverlay = document.getElementById('aihOverlay');
  if (!aihOverlay) return;

  var aihListBody = document.getElementById('aihListBody');

  /* 2026-10-01: AI 히스토리 데모 데이터 — 날짜 내림차순. "대화결과"는 완료/진행중 두 상태만 둔다 */
  var aihHistory = [
    { date:'2026-09-29', lesson:'Lesson 12', popcorn:420, result:'완료' },
    { date:'2026-09-24', lesson:'Lesson 11', popcorn:380, result:'완료' },
    { date:'2026-09-17', lesson:'Lesson 10', popcorn:510, result:'완료' },
    { date:'2026-09-10', lesson:'Lesson 9',  popcorn:290, result:'완료' }
  ];

  function aihRenderList(){
    if (!aihHistory.length){
      aihListBody.innerHTML = '<p class="ai-history-list-empty">아직 AI Y버디와 나눈 대화가 없어요.</p>';
      return;
    }
    aihListBody.innerHTML = aihHistory.map(function(h){
      return (
        '<div class="ai-history-list-item">' +
          '<span>'+h.date+'</span>' +
          '<span class="ai-history-lesson">'+h.lesson+'</span>' +
          '<span class="ai-history-popcorn">'+h.popcorn.toLocaleString()+'</span>' +
          '<span>'+h.result+'</span>' +
        '</div>'
      );
    }).join('');
  }

  function aihOpen(){
    aihRenderList();
    aihOverlay.hidden = false;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ aihOverlay.classList.add('on'); });
    });
  }
  function aihClose(){
    aihOverlay.classList.remove('on');
    setTimeout(function(){ aihOverlay.hidden = true; }, 220);
  }
  window.aihOpen = aihOpen; /* "종료" 탭 리스트 카드에서 호출하는 풀스크린 버전 */

  document.getElementById('aihCloseBtn').addEventListener('click', aihClose);
  aihOverlay.addEventListener('click', function(e){ if (e.target === aihOverlay) aihClose(); });

  /* QA #6 — "AI로 말해보기" 스텝 팝업의 "히스토리 보기"에서 여는 바텀시트 버전.
     같은 데모 데이터(aihHistory)를 그대로 재사용하고, 셸(바텀시트)과 트리거만 다르다 */
  var aihSheetOverlay = document.getElementById('aihSheetOverlay');
  var aihSheetListBody = document.getElementById('aihSheetListBody');
  if (aihSheetOverlay && aihSheetListBody){
    aihSheetListBody.innerHTML = aihHistory.length
      ? aihHistory.map(function(h){
          return (
            '<div class="ai-history-list-item">' +
              '<span>'+h.date+'</span>' +
              '<span class="ai-history-lesson">'+h.lesson+'</span>' +
              '<span class="ai-history-popcorn">'+h.popcorn.toLocaleString()+'</span>' +
              '<span>'+h.result+'</span>' +
            '</div>'
          );
        }).join('')
      : '<p class="ai-history-list-empty">아직 AI Y버디와 나눈 대화가 없어요.</p>';

    var aihSheetOpen = function(){
      aihSheetOverlay.hidden = false;
      requestAnimationFrame(function(){ aihSheetOverlay.classList.add('on'); });
    };
    var aihSheetClose = function(){
      aihSheetOverlay.classList.remove('on');
      setTimeout(function(){ aihSheetOverlay.hidden = true; }, 220);
    };
    document.getElementById('aihSheetClose').addEventListener('click', aihSheetClose);
    aihSheetOverlay.addEventListener('click', function(e){ if (e.target === aihSheetOverlay) aihSheetClose(); });

    window.aihSheetOpen = aihSheetOpen;
    var aihSheetTrigger = document.getElementById('aiHistorySheetTrigger');
    if (aihSheetTrigger){
      aihSheetTrigger.addEventListener('click', function(e){
        e.stopPropagation();
        aihSheetOpen();
      });
    }
  }
})();

(function(){
  "use strict";
  var mkOverlay = document.getElementById('mkOverlay');
  if (!mkOverlay) return;

  function mkStripTime(d){ var x = new Date(d); x.setHours(0,0,0,0); return x; }
  function mkAddDays(d,n){ var x = new Date(d); x.setDate(x.getDate()+n); return x; }
  function mkSameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
  function mkPad2(n){ return n < 10 ? '0'+n : ''+n; }
  var MK_TODAY = mkStripTime(new Date());
  var MK_WD = ['일','월','화','수','목','금','토'];

  var MK_BLOCKS = [
    { key:'6-9',   label:'06 - 09', start:6  },
    { key:'9-12',  label:'09 - 12', start:9  },
    { key:'12-15', label:'12 - 15', start:12 },
    { key:'15-18', label:'15 - 18', start:15 },
    { key:'18-21', label:'18 - 21', start:18 },
    { key:'21-24', label:'21 - 24', start:21 }
  ];
  var MK_TUTORS = ['Sarah','Grace','James','Helen','Daniel','Emily'];

  var mkStep1 = document.getElementById('mkStep1');
  var mkStep2 = document.getElementById('mkStep2');
  var mkBody = document.getElementById('mkBody');
  var mkBackBtn = document.getElementById('mkBackBtn');
  var mkHeadSpacer = document.getElementById('mkHeadSpacer');
  var mkCloseBtn = document.getElementById('mkCloseBtn');
  var mkCalMonth = document.getElementById('mkCalMonth');
  var mkCalGrid = document.getElementById('mkCalGrid');
  var mkSelDateChip = document.getElementById('mkSelDateChip');
  var mkTutorSwitch = document.getElementById('mkTutorSwitch');
  var mkBlockGrid = document.getElementById('mkBlockGrid');
  var mkSlotSection = document.getElementById('mkSlotSection');
  var mkSlotGrid = document.getElementById('mkSlotGrid');
  var mkSubmitBtn = document.getElementById('mkSubmitBtn');
  var mkConfirmOverlay = document.getElementById('mkConfirmOverlay');
  var mkConfirmDesc = document.getElementById('mkConfirmDesc');
  var mkConfirmBtn = document.getElementById('mkConfirmBtn');

  var mkStep = 1;
  var mkCourseLabel = '';
  var mkMinDate = null, mkMaxDate = null;
  var mkSelectedDate = null;
  var mkSelectedBlock = null;
  var mkSelectedSlot = null;
  var mkSelectedTutor = null;

  function mkDateLabel(d){
    return (d.getMonth()+1)+'월 '+d.getDate()+'일('+MK_WD[d.getDay()]+')';
  }

  /* 1단계 : 날짜 선택 달력 — 오늘 기준 2주(내일~14일 후)만 선택 가능, 그 외 날짜는 흐리게 비활성 */
  function mkRenderCalendar(){
    var base = mkSelectedDate || mkMinDate;
    var monthCursor = new Date(base.getFullYear(), base.getMonth(), 1);
    mkCalMonth.textContent = monthCursor.getFullYear()+'년 '+(monthCursor.getMonth()+1)+'월';
    var firstDow = monthCursor.getDay();
    var gridStart = mkAddDays(monthCursor, -firstDow);
    mkCalGrid.innerHTML = '';
    for (var i=0;i<35;i++){
      var day = mkAddDays(gridStart,i);
      var inRange = day >= mkMinDate && day <= mkMaxDate;
      var isToday = mkSameDay(day, MK_TODAY);
      var isSel = mkSelectedDate && mkSameDay(day, mkSelectedDate);
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'makeup-cal-cell' + (inRange?'':' out-range') + (isToday?' today':'') + (isSel?' selected':'');
      cell.innerHTML = '<span class="makeup-num">'+day.getDate()+'</span>';
      if (!inRange) cell.disabled = true;
      cell.addEventListener('click', function(dd){ return function(){
        mkSelectedDate = dd;
        mkSelectedBlock = null; mkSelectedSlot = null; mkSelectedTutor = null;
        mkRenderCalendar();
        mkUpdateSubmitState();
      }; }(day));
      mkCalGrid.appendChild(cell);
    }
  }

  /* 2단계 : 수업 시간(블록) 선택 */
  function mkRenderBlocks(){
    mkBlockGrid.innerHTML = MK_BLOCKS.map(function(b){
      var on = mkSelectedBlock === b.key;
      return '<button type="button" class="makeup-block-btn'+(on?' on':'')+'" data-key="'+b.key+'">'+b.label+'</button>';
    }).join('');
    Array.prototype.forEach.call(mkBlockGrid.querySelectorAll('.makeup-block-btn'), function(btn){
      btn.addEventListener('click', function(){
        mkSelectedBlock = btn.getAttribute('data-key');
        mkSelectedSlot = null; mkSelectedTutor = null;
        mkRenderBlocks();
        mkRenderSlots();
        mkUpdateSubmitState();
      });
    });
  }

  /* 블록당 30분 간격 6개 시간을 만들고, "내 강사 검색" 여부에 따라 선택 가능한 슬롯 수를 다르게
     시뮬레이션한다(ON=기존 이력 강사 위주로 좁혀짐, OFF=전체 강사라 더 많이 열림) — 참고 레퍼런스
     (미우미우 사이즈 그리드)처럼 선택 불가 항목은 줄긋기로 표시 */
  function mkGenSlots(block){
    var out = [];
    for (var i=0;i<6;i++){
      var totalMin = i*30;
      out.push({ h: block.start + Math.floor(totalMin/60), m: totalMin % 60 });
    }
    return out;
  }
  /* "내 강사 검색" ON일 때의 가능 슬롯은 항상 OFF(전체 강사)일 때의 부분집합이 되도록
     계산 — 필터링을 켜면 결과가 같거나 더 좁아지기만 해야 자연스럽다 */
  function mkSlotAvailable(blockKey, idx, filtered){
    var seed = (blockKey.charCodeAt(0) + idx*7) % 5;
    var anyTutor = seed % 4 !== 0;
    if (!filtered) return anyTutor;
    return anyTutor && (seed % 2 === 0);
  }

  function mkRenderSlots(){
    if (!mkSelectedBlock){ mkSlotSection.hidden = true; mkSlotGrid.innerHTML = ''; return; }
    var block = MK_BLOCKS.filter(function(b){ return b.key === mkSelectedBlock; })[0];
    var filtered = mkTutorSwitch.classList.contains('on');
    var slots = mkGenSlots(block);
    var html = '';
    var anyAvail = false;
    slots.forEach(function(s, idx){
      var avail = mkSlotAvailable(block.key, idx, filtered);
      if (avail) anyAvail = true;
      var timeStr = mkPad2(s.h)+':'+mkPad2(s.m);
      var tutor = MK_TUTORS[(idx + block.start) % MK_TUTORS.length];
      var sel = avail && mkSelectedSlot === timeStr;
      html += '<button type="button" class="makeup-slot-btn'+(avail?'':' disabled')+(sel?' on':'')+'"'+(avail?'':' disabled')+' data-time="'+timeStr+'" data-tutor="'+tutor+'">'+
        '<span class="makeup-slot-time">'+timeStr+'</span><span class="makeup-slot-tutor">'+tutor+'</span></button>';
    });
    mkSlotSection.hidden = false;
    if (!anyAvail){
      mkSlotGrid.innerHTML = '<div class="makeup-slot-empty" style="grid-column:1/-1;">이 시간대에는 가능한 강사가 없어요.<br>다른 시간을 선택해 주세요.</div>';
    } else {
      mkSlotGrid.innerHTML = html;
    }
    Array.prototype.forEach.call(mkSlotGrid.querySelectorAll('.makeup-slot-btn'), function(btn){
      btn.addEventListener('click', function(){
        mkSelectedSlot = btn.getAttribute('data-time');
        mkSelectedTutor = btn.getAttribute('data-tutor');
        mkRenderSlots();
        mkUpdateSubmitState();
      });
    });
  }

  function mkUpdateSubmitState(){
    mkSubmitBtn.disabled = mkStep === 1 ? !mkSelectedDate : !mkSelectedSlot;
  }

  function mkShowStep(step){
    mkStep = step;
    mkStep1.hidden = step !== 1;
    mkStep2.hidden = step !== 2;
    mkBackBtn.hidden = step === 1;
    mkHeadSpacer.hidden = step !== 1;
    mkBody.scrollTop = 0;
    mkUpdateSubmitState();
  }

  function mkOpen(c){
    mkCourseLabel = (c && c.subject) || '';
    window.__mkClass = c || null;
    mkMinDate = mkAddDays(MK_TODAY, 1);
    mkMaxDate = mkAddDays(MK_TODAY, 14);
    mkSelectedDate = null; mkSelectedBlock = null; mkSelectedSlot = null; mkSelectedTutor = null;
    mkTutorSwitch.classList.add('on'); mkTutorSwitch.setAttribute('aria-checked','true');
    mkShowStep(1);
    mkRenderCalendar();
    mkOverlay.hidden = false;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ mkOverlay.classList.add('on'); });
    });
  }
  function mkClose(){
    mkOverlay.classList.remove('on');
    setTimeout(function(){ mkOverlay.hidden = true; }, 220);
  }
  window.mkOpenForClass = mkOpen;


  mkCloseBtn.addEventListener('click', mkClose);
  mkOverlay.addEventListener('click', function(e){ if (e.target === mkOverlay) mkClose(); });
  mkBackBtn.addEventListener('click', function(){ mkShowStep(1); });

  mkTutorSwitch.addEventListener('click', function(){
    var on = !mkTutorSwitch.classList.contains('on');
    mkTutorSwitch.classList.toggle('on', on);
    mkTutorSwitch.setAttribute('aria-checked', on ? 'true' : 'false');
    mkSelectedSlot = null; mkSelectedTutor = null;
    mkRenderSlots();
    mkUpdateSubmitState();
  });

  function mkOpenConfirm(){
    var dateStr = mkSelectedDate ? mkDateLabel(mkSelectedDate) : '';
    mkConfirmDesc.textContent = (mkCourseLabel ? mkCourseLabel+'\n' : '') + dateStr + ' ' + mkSelectedSlot + ' / ' + (mkSelectedTutor || 'TUTOR');
    mkConfirmOverlay.hidden = false;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ mkConfirmOverlay.classList.add('on'); });
    });
  }
  function mkCloseConfirm(){
    mkConfirmOverlay.classList.remove('on');
    setTimeout(function(){ mkConfirmOverlay.hidden = true; }, 200);
  }
  mkConfirmBtn.addEventListener('click', mkCloseConfirm);

  mkSubmitBtn.addEventListener('click', function(){
    if (mkStep === 1){
      if (!mkSelectedDate) return;
      mkSelDateChip.textContent = mkDateLabel(mkSelectedDate);
      mkSelectedBlock = null; mkSelectedSlot = null; mkSelectedTutor = null;
      mkRenderBlocks();
      mkSlotSection.hidden = true; mkSlotGrid.innerHTML = '';
      mkShowStep(2);
    } else {
      if (!mkSelectedSlot) return;
      mkClose();
      document.dispatchEvent(new CustomEvent('mkdone', { detail:{ date:mkSelectedDate, time:mkSelectedSlot, tutor:mkSelectedTutor } }));
      mkOpenConfirm();
    }
  });
})();

/* ===== 시안2 v3 : 시안1 v3 추가 페이지 연결부 ===== */
(function(){
  "use strict";
  function openOv(ov){ ov.hidden = false; requestAnimationFrame(function(){ requestAnimationFrame(function(){ ov.classList.add('on'); }); }); }
  function closeOv(ov){ ov.classList.remove('on'); setTimeout(function(){ ov.hidden = true; }, 220); }
  function goNav(key){ var n = document.querySelector('.nav-item[data-nav="'+key+'"]'); if (n) n.click(); }

  /* ---------- 출석현황 팝업 (진행률 · 출석/연기/취소 · 이번 달 수업일) ---------- */
  var ATT_DEMO = { classWeekdays:[2,4], progressDone:50, progressTotal:120, attend:46, postpone:2, absent:2 };
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
  var upcoming = [
    { img:'https://upsisa.ybmsisa.com/e4u/YBMIngang/ADMIN/files/product/info/D805A4EE-36C7-4F3A-A85C-9430EB0EBBAC.jpg', name:'1:1 영어회화 필리핀 강사님', type:'phone', when:'월·수·금 10:00', plan:'주 5회 10분 · 6개월', deadline:'2026.08.30' },
    { img:'https://upsisa.ybmsisa.com/e4u/YBMIngang/ADMIN/files/product/info/D58A3D2F-BCCE-435F-87D7-176C464817B0.jpg', name:'1:1 비즈니스 영어회화',       type:'video', when:'화·목 19:30',    plan:'주 2회 25분 · 3개월', deadline:'2026.08.30' }
  ];
  var done = [
    { img:'https://upsisa.ybmsisa.com/e4u/YBMIngang/ADMIN/files/product/info/6DECE5EA-380F-4C9A-B246-1C7E3F183199.jpg', name:'비즈니스 영어회화', type:'phone', when:'월~금 10:00', plan:'주 5회 10분', period:'2026.07.07 ~ 2026.12.31',
      pct:42, doneN:50, total:120, attend:46, postpone:2, absent:2 }
  ];
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
})();

(function(){ if (window.__setStepDone) window.__setStepDone(document.querySelector('.classroom-step[data-step-id="review"]'), true); })();

/* ===== 스케줄 플로우 : 연기 신청 → 보강 신청 / 연기 취소 / 보강 취소 / 연기·보강 현황 / 안내사항 ===== */
(function(){
  "use strict";
  var api = window.__scApi; if (!api) return;
  var dlg = document.getElementById('scDlg'), dTitle = document.getElementById('scDlgTitle'), dMsg = document.getElementById('scDlgMsg'),
      dBtns = document.getElementById('scDlgBtns'), dLink = document.getElementById('scDlgLink'),
      dBack = document.getElementById('scDlgBack'), dClose = document.getElementById('scDlgClose');
  var onBack = null;
  function md(d){ return (d.getMonth()+1)+'/'+d.getDate(); }
  function mdw(d){ return (d.getMonth()+1)+'.'+d.getDate()+'('+api.wd[d.getDay()]+')'; }
  function closeDlg(){ dlg.classList.remove('on'); setTimeout(function(){ dlg.hidden = true; }, 180); }
  /* o = { title, msg(text), html(bool), back(fn), close(bool), buttons:[{text, ghost, fn}], link:{text, fn} } */
  function openDlg(o){
    dTitle.textContent = o.title || '';
    dMsg.className = 'dialog-msg' + (o.info ? ' info' : '');
    if (o.html) dMsg.innerHTML = o.msg; else dMsg.textContent = o.msg || '';
    dBtns.innerHTML = '';
    (o.buttons || []).forEach(function(b){
      var el = document.createElement('button'); el.type = 'button';
      el.className = 'btn'; el.setAttribute('data-variant', b.ghost ? 'secondary' : 'primary'); el.textContent = b.text;
      el.addEventListener('click', function(){ closeDlg(); if (b.fn) setTimeout(b.fn, 190); });
      dBtns.appendChild(el);
    });
    dLink.hidden = !o.link;
    if (o.link){ dLink.textContent = o.link.text; dLink.onclick = function(){ closeDlg(); if (o.link.fn) setTimeout(o.link.fn, 190); }; }
    onBack = o.back || null; dBack.hidden = !o.back;
    dClose.hidden = o.close === false;
    dlg.hidden = false; requestAnimationFrame(function(){ requestAnimationFrame(function(){ dlg.classList.add('on'); }); });
  }
  dBack.addEventListener('click', function(){ var f = onBack; closeDlg(); if (f) setTimeout(f, 190); });
  dClose.addEventListener('click', closeDlg);
  dlg.addEventListener('click', function(e){ if (e.target === dlg) closeDlg(); });
  window.scDlgOpen = openDlg;

  function refresh(){ api.refresh(); if (!pm.hidden) pmRender(); }
  function openMk(c){ if (window.mkOpenForClass) window.mkOpenForClass(c); }

  /* ---------- 연기 신청 (예정 카드) ---------- */
  function askPostpone(c){
    openDlg({ title:'연기 신청', msg:md(c.d)+'일 수업 연기를 신청하시겠습니까?',
      buttons:[{ text:'확인', fn:function(){ c.status = 'postponed'; refresh(); askMakeupAfterPostpone(c); } }],
      link:{ text:'다음에 하기' } });
  }
  function askMakeupAfterPostpone(c){
    openDlg({ title:'보강 신청', msg:md(c.d)+'일 수업이 연기되었습니다.\n연기한 수업은 보강 신청이 필요해요.',
      back:function(){ c.status = 'upcoming'; refresh(); askPostpone(c); },
      buttons:[{ text:'보강 신청', fn:function(){ openMk(c); } }],
      link:{ text:'다음에 하기' } });
  }
  /* ---------- 연기 취소 : 원 스케줄이 비어 있으면 원복, 있으면 보강 신청으로 ---------- */
  function askCancelPostpone(c){
    var occupied = api.list().some(function(x){ return x !== c && x.subject === c.subject && api.sameDay(x.d, c.d) && x.time === c.time; });
    if (occupied){
      openDlg({ title:'연기 취소', msg:md(c.d)+'일 원 수업 스케줄이 있습니다.\n보강 신청을 해주세요.',
        buttons:[{ text:'확인', fn:function(){ openMk(c); } }] });
    } else {
      openDlg({ title:'연기 취소', msg:md(c.d)+'일 수업 연기를 취소하시겠습니까?',
        buttons:[{ text:'확인', fn:function(){ c.status = 'upcoming'; refresh(); } }],
        link:{ text:'다음에 하기' } });
    }
  }
  /* ---------- 보강 취소 : 확인 시 보강 수업 삭제 + 원수업 원복 ---------- */
  function askCancelMakeup(c){
    openDlg({ title:'보강 취소', msg:md(c.d)+'일 보강 수업을 취소하시겠습니까?', back:function(){}, close:false,
      buttons:[{ text:'취소', ghost:true }, { text:'확인', fn:function(){
        var L = api.list(), i = L.indexOf(c); if (i > -1) L.splice(i, 1);
        if (c.makeupOf){
          var o = c.makeupOf.orig || { d:c.makeupOf.d, time:c.makeupOf.time, subject:c.subject, status:'skip' };
          if (L.indexOf(o) === -1){ o.key = o.key || (o.d.getFullYear()+'-'+('0'+(o.d.getMonth()+1)).slice(-2)+'-'+('0'+o.d.getDate()).slice(-2)); L.push(o); }
        } else if (c.special){ specialLeft++; updateQuick(); }
        refresh();
      } }] });
  }
  window.scFlow = function(act, c){
    if (act === '보강신청') openMk(c);
    else if (act === '연기신청') askPostpone(c);
    else if (act === '연기 취소') askCancelPostpone(c);
    else if (act === '보강 취소') askCancelMakeup(c);
    else if (act === '리뷰보기' && window.revOpen) window.revOpen();
  };

  /* ---------- 보강 신청 완료 → 주별 리스트에 보강 수업 등록, 원수업(SKIP/연기)은 리스트에서 빠짐 ---------- */
  document.addEventListener('mkdone', function(e){
    var orig = window.__mkClass, det = e.detail, L = api.list();
    var d = new Date(det.date); d.setHours(0,0,0,0);
    var nc = { d:d, time:det.time, subject:(orig && orig.subject) || api.course(), status:'makeup', tutor:det.tutor };
    nc.key = d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
    if (orig && !orig.special){
      nc.makeupOf = { d:orig.d, time:orig.time, orig:orig };
      var i = L.indexOf(orig); if (i > -1) L.splice(i, 1);
    } else { nc.special = true; specialLeft = Math.max(0, specialLeft - 1); updateQuick(); }
    L.push(nc);
    refresh();
  });

  /* ---------- 연기/보강 현황 ---------- */
  var pm = document.getElementById('pmOverlay');
  var specialLeft = 2;
  var quick = document.querySelector('#scQuicklinks .schedule-quicklink-item');
  function updateQuick(){
    if (!quick) return;
    var nodes = Array.prototype.filter.call(quick.childNodes, function(n){ return n.nodeType === 3 && n.textContent.trim(); });
    if (nodes[0]) nodes[0].textContent = ' 연기/보강 현황 · 특별보강 '+specialLeft+'회 가능 ';
    document.getElementById('pmSpecialLeft').textContent = specialLeft;
  }
  var ST = { skip:'스킵', postponed:'연기', cancelled:'취소' };
  function row(a, b, c){ return '<div class="makeup-status-row"><span>'+a+'</span><span>'+b+'</span><span>'+c+'</span></div>'; }
  var HEAD = '<div class="makeup-status-row head"><span>정규수업일</span><span>연기</span><span>보강</span></div>';
  function pmRender(){
    var course = api.course(), L = api.list().filter(function(c){ return c.subject === course; });
    var rows = [];
    L.forEach(function(c){
      if (ST[c.status] && !c.makeupOf) rows.push({ d:c.d, st:ST[c.status], c:c });
      if (c.makeupOf) rows.push({ d:c.makeupOf.d, st:ST[(c.makeupOf.orig||{}).status] || '스킵', mk:c });
    });
    rows.sort(function(a,b){ return a.d - b.d; });
    var tb = document.getElementById('pmTable');
    tb.innerHTML = HEAD + (rows.length ? rows.map(function(r, i){
      var right = r.mk ? '<span class="makeup-status-done">'+mdw(r.mk.d)+' 보강수업</span>' : '<button type="button" class="btn" data-variant="secondary" data-size="sm" data-pm="'+i+'">보강 신청</button>';
      return row(mdw(r.d), '<span class="makeup-status-st">'+r.st+'</span>', right);
    }).join('') : '<p class="makeup-status-empty">연기 · 스킵된 수업이 없어요.</p>');
    Array.prototype.forEach.call(tb.querySelectorAll('[data-pm]'), function(b){
      b.addEventListener('click', function(){ var r = rows[Number(b.getAttribute('data-pm'))]; closePm(); setTimeout(function(){ openMk(r.c); }, 200); });
    });
    var used = L.filter(function(c){ return c.special; });
    var sp = document.getElementById('pmSpecialTable'), html = HEAD;
    used.forEach(function(c){ html += row('<span class="makeup-status-dash">-</span>', '', '<span class="makeup-status-done">'+mdw(c.d)+' 보강수업</span>'); });
    for (var k=0;k<specialLeft;k++) html += row('<span class="makeup-status-dash">-</span>', '', '<button type="button" class="btn" data-variant="secondary" data-size="sm" data-sp="1">보강 신청</button>');
    sp.innerHTML = html;
    Array.prototype.forEach.call(sp.querySelectorAll('[data-sp]'), function(b){
      b.addEventListener('click', function(){ closePm(); setTimeout(function(){ openMk({ special:true, subject:api.course() }); }, 200); });
    });
    document.getElementById('pmSpecialLeft').textContent = specialLeft;
  }
  function openPm(){ pmRender(); pm.hidden = false; pm.querySelector('.modal-body').scrollTop = 0; requestAnimationFrame(function(){ requestAnimationFrame(function(){ pm.classList.add('on'); }); }); }
  function closePm(){ pm.classList.remove('on'); setTimeout(function(){ pm.hidden = true; }, 220); }
  if (quick) quick.addEventListener('click', openPm);
  document.getElementById('pmCloseBtn').addEventListener('click', closePm);
  pm.addEventListener('click', function(e){ if (e.target === pm) closePm(); });
  document.getElementById('pmInfoBtn').addEventListener('click', function(){
    openDlg({ title:'안내사항', info:true, html:true,
      msg:'<h4>연기 가능 시간</h4><ul><li>수업 시작 10분 전까지</li></ul><p class="warn">※ 연기 취소 버튼이 있는 경우 가능</p>' +
          '<h4>보강수업</h4><ul><li>연기한 수업은 보강 수업으로 다시 신청할 수 있습니다.</li><li>보강 수업은 수강 종료일까지 신청 및 수강해야 합니다.</li><li>보강 수업은 내일부터 2주 이내 일정에서 직접 신청할 수 있습니다. (단, 수강 기간 내)</li></ul>',
      buttons:[{ text:'확인' }] });
  });
  updateQuick();
})();

/* ===== 발음·문장 다시 평가 / 듣기 재생 / 수업환경 테스트 ===== */
(function(){
  "use strict";
  function openOv(o){ o.hidden = false; requestAnimationFrame(function(){ requestAnimationFrame(function(){ o.classList.add('on'); }); }); }
  function closeOv(o){ o.classList.remove('on'); setTimeout(function(){ o.hidden = true; }, 220); }

  /* ---------- 다시 평가 ---------- */
  var ve = document.getElementById('veOverlay'), veSample = document.getElementById('veSample'), veMic = document.getElementById('veMicBtn'),
      veState = document.getElementById('veState'), veResult = document.getElementById('veResult'), veTimer = null, veKeys = [];
  function veRows(vals){
    veResult.innerHTML = veKeys.map(function(k, i){
      var v = vals ? vals[i] : null;
      return '<div class="voice-eval-row"><span class="voice-eval-label">'+k+'</span><span class="voice-eval-track"><span class="voice-eval-fill'+(v !== null && v < 50 ? ' low' : '')+'"></span></span><span class="voice-eval-val'+(v === null ? ' empty' : '')+'">'+(v === null ? '–' : v+'%')+'</span></div>';
    }).join('');
    if (vals) requestAnimationFrame(function(){ requestAnimationFrame(function(){
      Array.prototype.forEach.call(veResult.querySelectorAll('.voice-eval-fill'), function(f, i){ f.style.width = vals[i] + '%'; });
    }); });
  }
  window.veOpen = function(text, isSentence){
    clearTimeout(veTimer); veMic.classList.remove('recording');
    veSample.textContent = isSentence ? '“'+text+'”' : text;
    veSample.classList.toggle('sentence', !!isSentence);
    veKeys = isSentence ? ['Timing','Word','Intonation','Stress'] : ['Intonation','Stress'];
    veState.textContent = '마이크를 눌러 녹음을 시작하세요'; veState.classList.remove('rec');
    veRows(null); openOv(ve);
  };
  veMic.addEventListener('click', function(){
    if (veMic.classList.contains('recording')) return;
    veRows(null);
    veMic.classList.add('recording'); veState.textContent = '듣고 있어요…'; veState.classList.add('rec');
    veTimer = setTimeout(function(){
      veMic.classList.remove('recording'); veState.classList.remove('rec');
      veState.textContent = '평가가 완료되었어요. 다시 녹음할 수 있어요.';
      veRows(veKeys.map(function(){ return 30 + Math.round(Math.random()*14)*5; }));
    }, 2200);
  });
  document.getElementById('veCloseBtn').addEventListener('click', function(){ clearTimeout(veTimer); veMic.classList.remove('recording'); closeOv(ve); });
  ve.addEventListener('click', function(e){ if (e.target === ve){ clearTimeout(veTimer); veMic.classList.remove('recording'); closeOv(ve); } });

  /* ---------- 수업환경 테스트 ---------- */
  var env = document.getElementById('envOverlay'), meter = document.getElementById('envMeter'), meterTimer = null;
  for (var i=0;i<22;i++){ meter.appendChild(document.createElement('i')); }
  var bars = Array.prototype.slice.call(meter.children);
  function meterRun(on){
    clearInterval(meterTimer);
    if (!on){ bars.forEach(function(b){ b.style.height = '8px'; }); return; }
    var t = 0;
    meterTimer = setInterval(function(){
      t += .35; var amp = (Math.sin(t) + 1.2) / 2.2;
      bars.forEach(function(b, k){ b.style.height = Math.max(6, Math.round((Math.sin(t*2 + k*.6) * .5 + .5) * 56 * amp + Math.random()*8)) + 'px'; });
    }, 110);
  }
  function envTab(tab){
    Array.prototype.forEach.call(env.querySelectorAll('[data-env-tab]'), function(b){ var on = b.getAttribute('data-env-tab') === tab; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    Array.prototype.forEach.call(env.querySelectorAll('[data-env-pane]'), function(p){ p.hidden = p.getAttribute('data-env-pane') !== tab; });
    env.querySelector('.env-cam').hidden = tab !== 'video';
    env.querySelector('.env-aud').hidden = tab !== 'audio';
    meterRun(tab === 'audio');
  }
  Array.prototype.forEach.call(env.querySelectorAll('[data-env-tab]'), function(b){ b.addEventListener('click', function(){ envTab(b.getAttribute('data-env-tab')); }); });
  document.getElementById('envCamSel').addEventListener('change', function(e){ document.getElementById('envCamName').textContent = e.target.value; });
  var play = document.getElementById('envPlayBtn'), playT = null;
  play.addEventListener('click', function(){
    var on = !play.classList.contains('playing'); play.classList.toggle('playing', on);
    play.querySelector('.env-play-label').textContent = on ? '재생 중' : '테스트 사운드 재생';
    clearTimeout(playT); if (on) playT = setTimeout(function(){ play.click(); }, 3000);
  });
  function envOpen(){ envTab('video'); openOv(env); }
  function envClose(){ meterRun(false); closeOv(env); }
  document.getElementById('envCloseBtn').addEventListener('click', envClose);
  env.addEventListener('click', function(e){ if (e.target === env) envClose(); });
  var link = document.getElementById('envTestLink'); if (link) link.addEventListener('click', envOpen);
  document.getElementById('envInfoBtn').addEventListener('click', function(){
    if (window.scDlgOpen) window.scDlgOpen({ title:'장치 테스트 정보', info:true, html:true, buttons:[{ text:'확인' }],
      msg:'<h4>수업 전 확인해 주세요</h4><ul><li>카메라와 마이크 접근을 허용해 주세요.</li><li>이어폰(마이크 포함)을 사용하면 더 깨끗하게 들려요.</li><li>조용하고 밝은 곳에서 수업해 주세요.</li></ul>' });
  });
  document.getElementById('envGuideBtn').addEventListener('click', function(){
    if (window.scDlgOpen) window.scDlgOpen({ title:'설정 가이드', info:true, html:true, buttons:[{ text:'확인' }],
      msg:'<h4>카메라가 보이지 않을 때</h4><ul><li>설정 &gt; 앱 &gt; 전화화상 &gt; 카메라 권한을 켜 주세요.</li><li>다른 앱에서 카메라를 사용 중이면 종료해 주세요.</li></ul><h4>소리가 들리지 않을 때</h4><ul><li>기기 볼륨과 무음 모드를 확인해 주세요.</li><li>이어폰 연결 상태를 확인해 주세요.</li></ul>' });
  });
})();

/* 33·34 수업 콜(VoIP) : 수신 → [통화하기] 강의실 연결 / [거절하기] 통화 종료(강사가 최대 3회까지 다시 걸어요) */
(function(){
  var cs = document.getElementById('callScreen'), toast = document.getElementById('callToast');
  var eyebrow = document.getElementById('callEyebrow'), ring = eyebrow.textContent, tt;
  function open(){
    cs.dataset.state = 'ring'; eyebrow.textContent = ring;
    cs.hidden = false; requestAnimationFrame(function(){ cs.classList.add('show'); });
  }
  function close(){ cs.classList.remove('show'); setTimeout(function(){ cs.hidden = true; }, 250); }
  function connect(){ cs.dataset.state = 'connect'; eyebrow.textContent = '강의실에 연결하고 있어요'; }
  function say(html){
    toast.innerHTML = html; toast.classList.add('show');
    clearTimeout(tt); tt = setTimeout(function(){ toast.classList.remove('show'); }, 3200);
  }
  document.getElementById('callAccept').addEventListener('click', connect);
  document.getElementById('callCancel').addEventListener('click', close);
  document.getElementById('callDecline').addEventListener('click', function(){
    close(); say('<b>수업 콜을 거절했어요</b>강사님이 잠시 후 다시 걸 수 있어요');
  });
  window.callOpen = open;
  window.callConnect = function(){ open(); connect(); };
})();

/* 35~38 수업 전 알림 푸시 : 40분 전 사전 학습 / 20분 전 교재 미리보기 / 10분 전 · 5·3·1분 전 수업 시간
   알림 터치 → 앱 실행 후 사전 학습·교재(오늘 단계) 또는 클래스룸으로 이동 */
(function(){
  var CLS = '19:30';
  var P = {
    pre40:  { min:40, step:'review', title:'40분 후 수업이 시작됩니다', text:'수업 전 사전 학습자료가 준비되었어요. 가벼운 마음으로 확인해 볼까요?' },
    book20: { min:20, step:'lesson', title:'20분 후 수업이 시작됩니다', text:'수업에 앞서 오늘 수업 교재를 미리 살펴볼까요?' },
    cls10:  { min:10, step:null, title:'10분 후 수업이 시작됩니다', text:'오늘 배울 내용(TO-DO)을 미리 확인해 보세요. 강의실은 5분 전부터 입장할 수 있어요.' },
    cls5:   { min:5,  step:null, title:'5분 후 수업이 시작됩니다', text:'지금 바로 강의실에 입장해 주세요!' }
  };
  var ps = document.getElementById('pushScreen'), cur = null;
  function at(min){ var t = CLS.split(':'), m = (+t[0]) * 60 + (+t[1]) - min; return (m / 60 | 0) + ':' + ('0' + (m % 60)).slice(-2); }
  function open(key){
    cur = P[key]; if (!cur) return;
    document.getElementById('pushTime').textContent = at(cur.min);
    document.getElementById('pushTitle').textContent = cur.title;
    document.getElementById('pushText').textContent = cur.text;
    ps.hidden = false; requestAnimationFrame(function(){ ps.classList.add('show'); });
  }
  function close(){ ps.classList.remove('show'); setTimeout(function(){ ps.hidden = true; }, 250); }
  function go(step){ var m = document.querySelector('.classroom-step[data-step-id="' + (step === 'lesson' ? 'lesson' : 'review') + '"]'); if (!m || !window.openLessonSheet) return; m.scrollIntoView({block:'center'}); window.openLessonSheet(m); }
  document.getElementById('pushCard').addEventListener('click', function(){
    var step = cur && cur.step; close();
    var sc = document.getElementById('scrollArea') || document.scrollingElement; if (sc) sc.scrollTop = 0;
    if (step) setTimeout(function(){ go(step); }, 300);
  });
  window.pushOpen = open;
})();

/* 39 스플래시 : 앱 실행 → 1.8초 노출(세션·자동 로그인·버전 체크) → 클래스룸. hold=true면 닫지 않음(화면 목록용) */
(function(){
  var sp = document.getElementById('splash');
  window.splashOpen = function(hold){
    sp.classList.remove('out'); sp.hidden = false;
    if (!hold) setTimeout(function(){ sp.classList.add('out'); setTimeout(function(){ sp.hidden = true; }, 350); }, 1800);
  };
})();

/* 40~43 업데이트 · 시스템 공지
   업데이트(선택): [나중에 하기] 닫고 홈 / [업데이트 하기] 스토어 — 업데이트 없이 돌아오면 다시 노출
   업데이트(강제): [업데이트 하기]만 / 공지: [확인] 닫힘, 오늘 하루·일주일 보지 않기 / 점검·긴급: [확인] 앱 종료 */
(function(){
  var ov = document.getElementById('noticeOverlay');
  var $ = function(id){ return document.getElementById(id); };
  var UPDATE_LIST = '<div class="notice-box list"><span class="notice-box-title">이번 업데이트</span><ul><li>클래스룸 · 스케줄 화면 개선</li><li>수업 알림 설정 추가</li><li>앱 안정성 개선</li></ul></div>';
  var K = {
    update: { icon:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M12 16V4"/><path d="M6.5 9.5L12 4l5.5 5.5"/><path d="M5 20h14"/></svg>', title:'새 버전이 나왔어요',
      body:'<p>업데이트하고 더 편리해진<br>전화화상을 이용해 보세요.</p>' + UPDATE_LIST, main:'업데이트 하기', sub:'나중에 하기' },
    force: { icon:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M12 14V3"/><path d="M7.5 7.5L12 3l4.5 4.5"/><path d="M4 13v7h16v-7"/></svg>', title:'업데이트가 필요해요',
      body:'<p>새 버전으로 업데이트해야<br>이용할 수 있어요.</p>' + UPDATE_LIST, main:'업데이트 하기' },
    notice: { icon:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M6 17v-6a6 6 0 0 1 12 0v6"/><path d="M4 17h16"/><path d="M10 21h4"/></svg>', title:'추석 연휴 수업 안내',
      body:'<div class="notice-text"><p>10월 3일(금) ~ 10월 9일(목) 추석 연휴<br>기간에는 정규 수업이 진행되지 않습니다.</p><p>연휴 기간 수업은 자동으로 연기 처리됩니다.</p><p>보강은 스케줄 &gt; 연기/보강 현황에서<br>신청할 수 있습니다.</p></div>', main:'확인', skip:true },
    maint: { icon:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M4 6h9"/><path d="M19 6h1"/><path d="M4 12h3"/><path d="M11 12h9"/><path d="M4 18h11"/><path d="M19 18h1"/><path d="M14 4h3v4h-3z"/><path d="M8 10h3v4H8z"/><path d="M16 16h3v4h-3z"/></svg>', title:'시스템 정기점검 안내',
      body:'<p>점검 시간에는 서비스 이용이<br>일시 중단돼요.</p><div class="notice-box when"><span class="notice-box-title">점검 시간</span><strong>2026년 10월 20일 (화)<br>02:00 ~ 06:00</strong></div>', main:'확인' }
  };
  function close(){ ov.classList.remove('on'); setTimeout(function(){ ov.hidden = true; }, 220); }
  window.noticeOpen = function(kind){
    var k = K[kind]; if (!k) return;
    $('noticeIcon').innerHTML = k.icon; $('noticeTitle').textContent = k.title; $('noticeBody').innerHTML = k.body;
    $('noticeMain').textContent = k.main;
    $('noticeSub').hidden = !k.sub; if (k.sub) $('noticeSub').textContent = k.sub;
    $('noticeSkip').hidden = !k.skip;
    ov.hidden = false; requestAnimationFrame(function(){ requestAnimationFrame(function(){ ov.classList.add('on'); }); });
  };
  $('noticeMain').addEventListener('click', close);
  $('noticeSub').addEventListener('click', close);
  $('noticeSkip').addEventListener('click', function(e){ if (e.target.closest('button')) close(); });
})();

/* 44·45 접근 권한 안내 : AOS(필수 마이크 / 선택 카메라·알림) · iOS(선택 알림·마이크·카메라)
   [확인] → OS 권한 팝업(AOS 오디오 → 알림 / iOS 알림 → 마이크 → 카메라) → 로그인 */
(function(){
  var ps = document.getElementById('permScreen');
  var G = { aos:'<div class="perm-group"><span class="perm-label">필수 접근 권한</span><ul class="perm-list"><li class="perm-item"><span class="perm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M9 3h6v10H9z"/><path d="M5 11v1a7 7 0 0 0 14 0v-1"/><path d="M12 19v2"/></svg></span><span><span class="perm-name">마이크</span><span class="perm-desc">수업 음성 연결, AI 튜터 학습</span></span></li></ul></div><div class="perm-group"><span class="perm-label">선택 접근 권한</span><ul class="perm-list"><li class="perm-item"><span class="perm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M3 6h12v12H3z"/><path d="M15 10l6-3v10l-6-3"/></svg></span><span><span class="perm-name">카메라</span><span class="perm-desc">화상 수업</span></span></li><li class="perm-item"><span class="perm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M6 17v-6a6 6 0 0 1 12 0v6"/><path d="M4 17h16"/><path d="M10 21h4"/></svg></span><span><span class="perm-name">알림</span><span class="perm-desc">수업 시간 알림, 수업 콜</span></span></li></ul></div>', ios:'<div class="perm-group"><span class="perm-label">선택 접근 권한</span><ul class="perm-list"><li class="perm-item"><span class="perm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M6 17v-6a6 6 0 0 1 12 0v6"/><path d="M4 17h16"/><path d="M10 21h4"/></svg></span><span><span class="perm-name">알림</span><span class="perm-desc">수업 시간 알림, 수업 콜</span></span></li><li class="perm-item"><span class="perm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M9 3h6v10H9z"/><path d="M5 11v1a7 7 0 0 0 14 0v-1"/><path d="M12 19v2"/></svg></span><span><span class="perm-name">마이크</span><span class="perm-desc">전화 · 화상 수업</span></span></li><li class="perm-item"><span class="perm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M3 6h12v12H3z"/><path d="M15 10l6-3v10l-6-3"/></svg></span><span><span class="perm-name">카메라</span><span class="perm-desc">화상 수업</span></span></li></ul></div>' };
  var PATH = { aos:'휴대폰 설정 > 애플리케이션 > YBM 전화화상', ios:'설정 > YBM 전화화상' };
  window.permOpen = function(os){
    document.getElementById('permGroups').innerHTML = G[os] || G.aos;
    document.getElementById('permPath').textContent = PATH[os] || PATH.aos;
    ps.querySelector('.perm-body').scrollTop = 0; ps.hidden = false;
  };
  document.getElementById('permOk').addEventListener('click', function(){ ps.hidden = true; });
})();

/* 46 내 강의 정보 : 과정명 옆 ⓘ → 지금 강좌의 수강기간 · 수업 일정 · 수업 방식(전화/화상 · 주 N회 · N분) · 강사 */
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var ov = $('infoOverlay');
  function read(){ 
    var slides = [].slice.call(document.querySelectorAll('#courseSwiper .course-slide'));
    var sw = $('courseSwiper'), i = sw ? Math.round(sw.scrollLeft / (slides[0] ? slides[0].offsetWidth : 1)) : 0;
    var sl = slides[Math.max(0, Math.min(i, slides.length - 1))];
    var co = sl.querySelector('.course'), chip = co.querySelector('.chip');
    var title = co.firstChild.textContent.trim(), when = sl.querySelector('.when').textContent.trim();
    var tt = sl.querySelector('.tutor').cloneNode(true); [].forEach.call(tt.querySelectorAll('.when, .att-streak-chip'), function(x){ x.remove(); }); var tutor = tt.textContent.trim();
    var PERIOD = {'Speaking Practice with YBM 초급':'2026.07.07 ~ 2026.12.31','Speaking Practice with YBM 초중급':'2026.09.01 ~ 2027.02.28','데일리 프리토킹':'2026.08.01 ~ 2026.10.31','여행 영어 회화':'2026.06.01 ~ 2026.11.30','Speaking Practice with YBM 중급':'2026.09.05 ~ 2026.12.26'};
    return { title:title, typeHTML: chip ? chip.outerHTML : '', type: chip ? chip.textContent.trim() : '', tutor:tutor, when:when, period:PERIOD[title] || '' };
  }
  function plan(c){
    var days = (c.when.match(/^[^0-9]+/) || [''])[0].trim(), n;
    var r = days.match(/([월화수목금토일])\s*~\s*([월화수목금토일])/), D = '월화수목금토일';
    n = r ? D.indexOf(r[2]) - D.indexOf(r[1]) + 1 : days.split(/[·\/,\s]+/).filter(function(x){ return D.indexOf(x) >= 0 && x.length === 1; }).length;
    var t = c.when.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/), mins = t ? (+t[3] * 60 + +t[4]) - (+t[1] * 60 + +t[2]) : 0;
    return (n ? '주 ' + n + '회' : '') + (mins ? ' ' + mins + '분' : '');
  }
  window.infoOpen = function(){
    var c = read();
    $('infoTitle').textContent = c.title; $('infoType').innerHTML = c.typeHTML;
    $('infoTutor').textContent = c.tutor;
    $('infoPeriod').textContent = c.period; $('infoWhen').textContent = c.when.replace(/\s*[–-]\s*\d{1,2}:\d{2}/, '').replace(/\s*\/\s*/g, '·'); $('infoPlan').textContent = plan(c);
    ov.hidden = false; requestAnimationFrame(function(){ requestAnimationFrame(function(){ ov.classList.add('on'); }); });
  };
  function close(){ ov.classList.remove('on'); setTimeout(function(){ ov.hidden = true; }, 220); }
  $('infoOk').addEventListener('click', close);
  ov.addEventListener('click', function(e){ if (e.target === ov) close(); });
  document.addEventListener('click', function(e){ var b = e.target.closest('.course-info-btn'); if (b){ e.stopPropagation(); window.infoOpen(); } }, true);
})();

/* 50~63 수업 루틴 변경 : 메뉴 → (전체) 시작일 → 요일·시간 → 강사 → 완료 / (강사) 시작일 → 강사 → 완료
   (교재) 시작일 → 레벨 → 교재 → 유닛 → 완료 / (전화번호) 번호 → 완료. 뒤로가기는 화면 단위 스택 */
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var CHECK = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 13l4 4L19 7\"/></svg>";
  var FREQ = 2, CUR_TIME = "19:30";
  var WD = ['일','월','화','수','목','금','토'];
  var ov = $('rtOverlay'), body = $('rtBody');
  var TITLE = { menu:'수업 루틴 변경', detail:'상세 스케줄 변경', tutor:'강사 변경', style:'수업 스타일 설정', level:'교재 변경', books:'교재 변경', unit:'교재 변경', phone:'전화번호 변경' };
  var DATE = { all:['스케줄 변경','바뀐 일정이 시작될 날을 선택하세요.<br>내일부터 2주 안에서 고를 수 있어요.'],
               tutor:['강사 변경','새 강사와 수업을 시작할 날을 선택하세요.<br>내일부터 2주 안에서 고를 수 있어요.'],
               book:['교재 변경','새 교재로 수업을 시작할 날을 선택하세요.<br>내일부터 2주 안에서 고를 수 있어요.'] };
  var BLOCKS = [['6-9','06 - 09',6],['9-12','09 - 12',9],['12-15','12 - 15',12],['15-18','15 - 18',15],['18-21','18 - 21',18],['21-24','21 - 24',21]];
  var TUTORS = [
    {n:'Sarah Jenkins', m:'미국 · 비즈니스 회화', cur:true, edu:'University of Michigan · 경영학', car:'비즈니스 영어 강의 8년', intro:'회의 · 이메일 · 발표처럼 실제 업무 상황 위주로 수업해요.'},
    {n:'Michael Brown', m:'캐나다 · 프리토킹', edu:'University of Toronto · 영문학', car:'성인 회화 강의 6년', intro:'편하게 대화하면서 자연스러운 표현을 익히도록 도와요.'},
    {n:'Olivia Park', m:'미국 · 발음 교정', edu:'UCLA · 언어학', car:'발음 · 억양 코칭 5년', intro:'말할 때 자주 틀리는 발음을 하나씩 짚어 드려요.'},
    {n:'Daniel Kim', m:'호주 · 초중급 회화', edu:'University of Sydney · 교육학', car:'초중급 회화 강의 4년', intro:'천천히, 쉬운 표현부터 차근차근 늘려 가요.'}];
  var PAST = [
    {n:'Grace Lee', m:'미국 · 비즈니스 회화', edu:'NYU · 커뮤니케이션', car:'비즈니스 영어 강의 7년', intro:'상황별 롤플레이로 실전 감각을 키워요.'},
    {n:'James Wilson', m:'영국 · 프리토킹', off:true, edu:'University of Leeds · 사회학', car:'성인 회화 강의 5년', intro:'시사 주제로 생각을 영어로 말하는 연습을 해요.'}];
  var STYLE = [['수업 방식',['내가 주도','강사가 주도']],['대화 속도',['천천히','원어민 속도']],['수업 방향',['교재 위주','프리토킹 위주']],['피드백',['실시간','수업 끝나고']]];
  var LEVELS = [['전체',''],['첫걸음','Level 1'],['첫걸음 정복','Level 2'],['초급','Level 3'],['초중급','Level 4'],['중급','Level 5'],['중상급','Level 6']];
  var BOOKS = [['생활회화',[['초급','Everyday English 1'],['초중급','Everyday English 2']]],['비즈니스',[['중급','Business Talk Basics'],['중급','Meetings & Presentations']]],['토픽회화',[['초중급','Topic Talk: Daily Life']]]];
  var UNITS = ['Greetings & Introductions','Talking about Work','Making Plans','Ordering Food','Asking for Directions','Shopping','Travel Plans'];

  var st, stack;
  function reset(){ st = { flow:null, date:null, days:[], block:null, slot:null, levels:['전체'], book:null, unit:3, style:[0,0,1,0] }; stack = []; }
  function ini(n){ return n.split(' ').map(function(x){ return x[0]; }).join(''); }
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function strip(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function add(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  var TODAY = strip(new Date()), MIN = add(TODAY, 1), MAX = add(TODAY, 14);
  function dlabel(d){ return (d.getMonth()+1) + '월 ' + d.getDate() + '일(' + WD[d.getDay()] + ')'; }
  function dshort(d){ return (d.getMonth()+1) + '월 ' + d.getDate() + '일부터'; }

  function show(view, push){
    if (push !== false && st.view) stack.push(st.view);
    st.view = view;
    [].forEach.call(body.querySelectorAll('.rt-view'), function(el){ el.hidden = el.getAttribute('data-view') !== view; });
    $('rtTitle').textContent = view === 'date' ? DATE[st.flow][0] : TITLE[view];
    $('rtBack').hidden = !stack.length; $('rtSpacer').hidden = !!stack.length;
    body.scrollTop = 0; render(view); foot();
  }
  function back(){ if (!stack.length) return; st.view = null; show(stack.pop(), false); }

  function foot(){
    var v = st.view, f = $('rtFoot'), m = $('rtMain'), sub = $('rtSub');
    sub.hidden = true; f.hidden = false; m.disabled = false;
    if (v === 'menu' || v === 'books') { f.hidden = true; return; }
    if (v === 'date'){ m.textContent = '다음'; m.disabled = !st.date; }
    else if (v === 'detail'){ m.textContent = '다음'; m.disabled = !st.slot; }
    else if (v === 'tutor'){ sub.hidden = false; sub.textContent = '강사 변경 안 함'; m.textContent = '자동 매칭'; sub.hidden = st.flow !== 'all'; }
    else if (v === 'style'){ m.textContent = '저장'; }
    else if (v === 'level'){ m.textContent = '다음'; m.disabled = !st.levels.length; }
    else if (v === 'unit'){ m.textContent = '변경'; }
    else if (v === 'phone'){ m.textContent = '변경'; }
  }

  function render(v){
    if (v === 'date') renderCal();
    if (v === 'detail') renderDetail();
    if (v === 'tutor') renderTutors();
    if (v === 'style') renderStyle();
    if (v === 'level') renderLevels();
    if (v === 'books') renderBooks();
    if (v === 'unit') renderUnits();
  }
  function renderCal(){
    $('rtDateGuide').innerHTML = DATE[st.flow][1];
    var base = st.date || MIN, m0 = new Date(base.getFullYear(), base.getMonth(), 1), start = add(m0, -m0.getDay());
    $('rtCalMonth').textContent = m0.getFullYear() + '년 ' + (m0.getMonth()+1) + '월';
    var h = '';
    for (var i = 0; i < 35; i++){
      var d = add(start, i), inR = d >= MIN && d <= MAX, sel = st.date && +d === +st.date;
      h += '<button type="button" class="makeup-cal-cell' + (inR ? '' : ' out-range') + (+d === +TODAY ? ' today' : '') + (sel ? ' selected' : '') + '"' + (inR ? '' : ' disabled') + ' data-t="' + (+d) + '"><span class="makeup-num">' + d.getDate() + '</span></button>';
    }
    $('rtCalGrid').innerHTML = h;
  }
  function renderDetail(){
    $('rtDateChip').textContent = dshort(st.date);
    $('rtDayGrid').innerHTML = ['월','화','수','목','금','토','일'].map(function(d){ return '<button type="button" class="makeup-block-btn' + (st.days.indexOf(d) >= 0 ? ' on' : '') + '" data-day="' + d + '">' + d + '</button>'; }).join('');
    $('rtDayCount').textContent = st.days.length;
    $('rtBlockGrid').innerHTML = BLOCKS.map(function(b){ return '<button type="button" class="makeup-block-btn' + (st.block === b[0] ? ' on' : '') + '" data-block="' + b[0] + '">' + b[1] + '</button>'; }).join('');
    var sec = $('rtSlotSec'); sec.hidden = !st.block; if (!st.block) return;
    var b = BLOCKS.filter(function(x){ return x[0] === st.block; })[0], h = '';
    for (var i = 0; i < 6; i++){
      var t = pad(b[2] + Math.floor(i / 2)) + ':' + (i % 2 ? '30' : '00'), n = (b[2] * 3 + i * 5) % 6, ok = n > 0;
      h += '<button type="button" class="makeup-slot-btn' + (ok ? '' : ' disabled') + (st.slot === t ? ' on' : '') + '"' + (ok ? '' : ' disabled') + ' data-slot="' + t + '"><span class="makeup-slot-time">' + t + '</span><span class="makeup-slot-tutor">' + (ok ? '강사 ' + n + '명' : '마감') + '</span></button>';
    }
    $('rtSlotGrid').innerHTML = h;
  }
  function tutorCard(t, i, grp){
    return '<div class="rt-tutor' + (t.off ? ' off' : '') + '"><span class="rt-av">' + ini(t.n) + '</span><div class="rt-tutor-txt"><strong>' + t.n + (t.cur ? ' <span class="rt-tag">현재 강사</span>' : '') + '</strong><span>' + t.m + '</span><button type="button" data-tinfo="' + grp + i + '">강사 정보</button></div>' +
      '<button type="button" class="rt-pick" data-tpick="' + grp + i + '"' + (t.off || t.cur ? ' disabled' : '') + '>' + (t.off ? '불가' : t.cur ? '현재' : '선택') + '</button></div>';
  }
  function renderTutors(){
    $('rtTutorSum').textContent = st.flow === 'all' ? dshort(st.date) + ' · ' + sortDays().join('·') + ' ' + st.slot : dshort(st.date) + ' · ' + "\ud654\u00b7\ubaa9" + ' ' + CUR_TIME;
    $('rtTutorN').textContent = TUTORS.length + '명';
    $('rtTutorList').innerHTML = TUTORS.map(function(t, i){ return tutorCard(t, i, 'a'); }).join('');
    $('rtTutorPast').innerHTML = PAST.map(function(t, i){ return tutorCard(t, i, 'p'); }).join('');
  }
  function renderStyle(){
    $('rtStyleRows').innerHTML = STYLE.map(function(r, i){ return '<div class="rt-style-row"><p class="makeup-section-title">' + r[0] + '</p><div class="rt-seg">' + r[1].map(function(o, j){ return '<button type="button" class="makeup-block-btn' + (st.style[i] === j ? ' on' : '') + '" data-style="' + i + ',' + j + '">' + o + '</button>'; }).join('') + '</div></div>'; }).join('');
  }
  function box(on, radio){ return '<span class="rt-box' + (radio ? ' radio' : '') + '">' + (radio ? '' : CHECK) + '</span>'; }
  function renderLevels(){
    $('rtBookDate').textContent = dshort(st.date) + ' 새 교재로 수업';
    $('rtLevelList').innerHTML = LEVELS.map(function(l){ var on = st.levels.indexOf(l[0]) >= 0; return '<button type="button" class="rt-check' + (on ? ' on' : '') + '" data-level="' + l[0] + '">' + box(on) + l[0] + (l[1] ? '<small>' + l[1] + '</small>' : '') + '</button>'; }).join('');
  }
  function renderBooks(){
    var all = st.levels.indexOf('전체') >= 0;
    var h = BOOKS.map(function(g){
      var items = g[1].filter(function(b){ return all || st.levels.indexOf(b[0]) >= 0; });
      if (!items.length) return '';
      return '<div class="rt-book-group"><span class="rt-label">' + g[0] + '</span>' + items.map(function(b){
        return '<div class="rt-book"><span class="rt-book-cover">' + b[0] + '</span><div class="rt-tutor-txt"><strong>' + b[1] + '</strong><span>' + b[0] + ' · 유닛 ' + UNITS.length + '개</span><button type="button" data-preview>미리보기</button></div><button type="button" class="rt-pick" data-book="' + b[0] + '|' + b[1] + '">선택</button></div>';
      }).join('') + '</div>';
    }).join('');
    $('rtBookList').innerHTML = h || '<p class="makeup-guide">선택한 레벨의 교재가 없어요.</p>';
  }
  function renderUnits(){
    $('rtBookName').textContent = '[' + st.book[0] + '] ' + st.book[1];
    $('rtUnitList').innerHTML = UNITS.map(function(u, i){ var on = st.unit === i; return '<button type="button" class="rt-check' + (on ? ' on' : '') + '" data-unit="' + i + '">' + box(on, true) + 'UNIT ' + (i + 1) + ' · ' + u + '</button>'; }).join('');
  }
  function sortDays(){ var O = '월화수목금토일'; return st.days.slice().sort(function(a, b){ return O.indexOf(a) - O.indexOf(b); }); }

  function pop(id){ var o = $(id); o.hidden = false; requestAnimationFrame(function(){ requestAnimationFrame(function(){ o.classList.add('on'); }); }); }
  function unpop(id){ var o = $(id); o.classList.remove('on'); setTimeout(function(){ o.hidden = true; }, 220); }
  function alertMsg(t, d){ $('rtAlertTitle').textContent = t; $('rtAlertDesc').innerHTML = d; pop('rtAlertOverlay'); }
  function done(title, kv){
    $('rtDoneTitle').textContent = title;
    $('rtDoneKv').innerHTML = kv.map(function(r){ return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('');
    pop('rtDoneOverlay');
  }
  function finishTutor(name){
    var start = dlabel(st.date);
    if (st.flow === 'all') done('수업 루틴이 변경되었어요', [['시작일', start], ['요일', sortDays().join(' · ')], ['시간', st.slot], ['강사', name]]);
    else done('강사가 변경되었어요', [['시작일', start], ['강사', name]]);
  }
  function tutorInfo(key){
    var t = (key[0] === 'a' ? TUTORS : PAST)[+key.slice(1)];
    $('rtTpAv').textContent = ini(t.n); $('rtTpName').textContent = t.n; $('rtTpMeta').textContent = t.m;
    $('rtTpKv').innerHTML = '<div><dt>학력 · 전공</dt><dd>' + t.edu.replace(' · ', '<br>') + '</dd></div><div><dt>경력</dt><dd>' + t.car + '</dd></div>';
    $('rtTpIntro').textContent = t.intro; pop('rtTutorOverlay');
  }

  body.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (!b) return;
    var a;
    if ((a = b.getAttribute('data-rt-flow'))){ st.flow = a; show(a === 'phone' ? 'phone' : 'date'); return; }
    if ((a = b.getAttribute('data-rt-go'))){ show(a); return; }
    if ((a = b.getAttribute('data-t'))){ st.date = new Date(+a); renderCal(); foot(); return; }
    if ((a = b.getAttribute('data-day'))){ var i = st.days.indexOf(a); if (i >= 0) st.days.splice(i, 1); else st.days.push(a); renderDetail(); return; }
    if ((a = b.getAttribute('data-block'))){ st.block = a; st.slot = null; renderDetail(); foot(); return; }
    if ((a = b.getAttribute('data-slot'))){ st.slot = a; renderDetail(); foot(); return; }
    if ((a = b.getAttribute('data-tinfo'))){ tutorInfo(a); return; }
    if ((a = b.getAttribute('data-tpick'))){ finishTutor((a[0] === 'a' ? TUTORS : PAST)[+a.slice(1)].n); return; }
    if ((a = b.getAttribute('data-style'))){ var p = a.split(','); st.style[+p[0]] = +p[1]; renderStyle(); return; }
    if ((a = b.getAttribute('data-level'))){
      if (a === '전체') st.levels = st.levels.indexOf('전체') >= 0 ? [] : ['전체'];
      else { st.levels = st.levels.filter(function(x){ return x !== '전체'; }); var k = st.levels.indexOf(a); if (k >= 0) st.levels.splice(k, 1); else st.levels.push(a); }
      renderLevels(); foot(); return; }
    if ((a = b.getAttribute('data-book'))){ st.book = a.split('|'); st.unit = 0; show('unit'); return; }
    if ((a = b.getAttribute('data-unit'))){ st.unit = +a; renderUnits(); return; }
  });
  $('rtMain').addEventListener('click', function(){
    var v = st.view;
    if (v === 'date') show(st.flow === 'all' ? 'detail' : st.flow === 'tutor' ? 'tutor' : 'level');
    else if (v === 'detail'){
      if (st.days.length !== FREQ) alertMsg('주 ' + FREQ + '회 수업이에요', '요일을 ' + FREQ + '개 선택해 주세요.');
      else show('tutor');
    }
    else if (v === 'tutor') finishTutor('자동 매칭 (변경일 전 안내)');
    else if (v === 'style') back();
    else if (v === 'level') show('books');
    else if (v === 'unit') done('교재가 변경되었어요', [['시작일', dlabel(st.date)], ['레벨', st.book[0]], ['교재', st.book[1]], ['시작 유닛', 'UNIT ' + (st.unit + 1)]]);
    else if (v === 'phone'){
      var n = $('rtPhone').value.replace(/\D/g, '');
      if (!/^0\d{8,10}$/.test(n)) alertMsg('전화번호를 확인해 주세요', '올바른 전화번호를 입력해 주세요.');
      else done('전화번호가 변경되었어요', [['변경 번호', n.replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, '$1-$2-$3')]]);
    }
  });
  $('rtSub').addEventListener('click', function(){ finishTutor('Sarah Jenkins (유지)'); });
  $('rtPhone').addEventListener('input', function(){ this.value = this.value.replace(/\D/g, ''); });
  $('rtBack').addEventListener('click', back);
  function close(){ ov.classList.remove('on'); setTimeout(function(){ ov.hidden = true; }, 220); }
  $('rtClose').addEventListener('click', close);
  $('rtAlertOk').addEventListener('click', function(){ unpop('rtAlertOverlay'); });
  $('rtTpOk').addEventListener('click', function(){ unpop('rtTutorOverlay'); });
  $('rtDoneOk').addEventListener('click', function(){ unpop('rtDoneOverlay'); close(); });
  ['rtAlertOverlay','rtTutorOverlay'].forEach(function(id){ $(id).addEventListener('click', function(e){ if (e.target === this) unpop(id); }); });

  window.rtOpen = function(){ reset(); st.view = null; show('menu', false); ov.hidden = false; requestAnimationFrame(function(){ requestAnimationFrame(function(){ ov.classList.add('on'); }); }); };
  document.addEventListener('click', function(e){ if (e.target.closest('.schedule-quicklink-action')){ e.stopPropagation(); window.rtOpen(); } }, true);

  /* 화면 목록용 : 단계별 상태를 바로 만든다 */
  window.rtDemo = function(k){
    window.rtOpen();
    var d = add(TODAY, 3); while (d.getDay() === 0 || d.getDay() === 6) d = add(d, 1);
    var go = function(flow, views){ st.flow = flow; views.forEach(function(v){ show(v); }); };
    if (k === 'date') go('all', ['date']);
    if (k === 'date-pick'){ go('all', ['date']); st.date = d; renderCal(); foot(); }
    if (k === 'detail' || k === 'detail-alert'){ st.date = d; st.days = k === 'detail' ? ['월','수'] : ['월','수','금']; st.block = '18-21'; st.slot = '19:00'; go('all', ['date', 'detail']); if (k === 'detail-alert') $('rtMain').click(); }
    if (k === 'tutor' || k === 'tutor-info' || k === 'style' || k === 'done'){ st.date = d; st.days = ['월','수']; st.block = '18-21'; st.slot = '19:00'; go('all', ['date', 'detail', 'tutor']);
      if (k === 'tutor-info') tutorInfo('a1'); if (k === 'style') show('style'); if (k === 'done') finishTutor('Michael Brown'); }
    if (k === 'level' || k === 'books' || k === 'unit' || k === 'book-done'){ st.date = d; go('book', ['date', 'level']); if (k !== 'level') { st.levels = ['전체']; show('books'); }
      if (k === 'unit' || k === 'book-done'){ st.book = ['초중급','Everyday English 2']; st.unit = 3; show('unit'); } if (k === 'book-done') $('rtMain').click(); }
    if (k === 'phone' || k === 'phone-done'){ go('phone', ['phone']); if (k === 'phone-done'){ $('rtPhone').value = '01098765432'; $('rtMain').click(); } }
  };
})();

/* 17p 출석현황 고도화 (add_attend) — 데모 값: 연속 5회, 최고 7회. 연속은 '수업한 날' 기준(연기·SKIP은 유지, 결석만 0) */
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var LOCK = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"square\" stroke-linejoin=\"miter\" aria-hidden=\"true\"><rect x=\"5\" y=\"11\" width=\"14\" height=\"9\" rx=\"0\"/><path d=\"M8 11V8a4 4 0 0 1 8 0v3\"/></svg>", CHECK = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 13l4 4L19 7\"/></svg>", FLAME = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"square\" stroke-linejoin=\"miter\" aria-hidden=\"true\"><path d=\"M12 3c.5 3.2 4.5 5 4.5 9.6A4.5 4.5 0 0 1 12 17a4.5 4.5 0 0 1-4.5-4.4c0-1.9 1-3.2 2-4 .2 1.5 1 2.4 2 2.7C11 9 11.2 6 12 3z\"/><path d=\"M8 20h8\"/></svg>";
  var STEPS = [[0,'시작이 반이에요!'],[3,'작심삼일 극복!'],[7,'루틴 자리잡기'],[14,'대단한 열정!'],[30,'습관의 완성']];
  var STREAK = 5, BEST = 7;
  var WD = ['일','월','화','수','목','금','토'];
  var LESSONS = ['Greetings & Introductions','Talking about Work','Making Plans','Ordering Food','Asking for Directions','Small Talk & Ice Breaking','Shopping','Travel Plans'];
  var body = $('attBody'), panel = body.querySelector('.attendance-cal-panel');
  /* 진행률·통계를 달력 패널 안(달력 아래)으로 */
  var prog = body.querySelector(':scope > .attendance-progress-card'), stats = body.querySelector(':scope > .attendance-stats-row');
  var legend = panel.querySelector('.attendance-legend');
  legend.outerHTML = '<div class="att-legend2"><span><i class="l-attend"></i>출석</span><span><i class="l-postpone"></i>연기 · SKIP</span><span><i class="l-absent"></i>결석</span><span><i class="l-plan"></i>수업 예정</span></div><div class="att-day" id="attDay" hidden></div>';
  if (prog) panel.appendChild(prog); if (stats) panel.appendChild(stats);

  function renderTop(){
    $('attStreakN').textContent = STREAK; $('attBest').textContent = BEST;
    var i = 0; while (i < STEPS.length - 1 && STREAK >= STEPS[i + 1][0]) i++;
    var next = STEPS[i + 1];
    $('attStreakSub').innerHTML = next ? '다음 배지 <b>‘' + next[1] + '’</b>까지 <b>' + (next[0] - STREAK) + '회</b> 남았어요' : '모든 배지를 모았어요. 꾸준함이 최고의 실력이에요!';
    var seg = 100 / (STEPS.length - 1), pos = next ? (i + (STREAK - STEPS[i][0]) / (next[0] - STEPS[i][0])) * seg : 100;
    var wrap = $('attSteps'); wrap.querySelectorAll('.att-step').forEach(function(x){ x.remove(); });
    STEPS.forEach(function(st, k){
      var on = STREAK >= st[0], isNext = next && k === i + 1;
      var el = document.createElement('div'); el.className = 'att-step' + (on ? ' on' : '') + (isNext ? ' next' : '');
      el.style.left = (k * seg) + '%';
      el.innerHTML = '<i>' + (on ? CHECK : LOCK) + '</i><span>' + (st[0] ? st[0] + '회' : '시작') + '</span>';
      wrap.appendChild(el);
    });
    var fill = $('attStepsFill'); fill.style.transition = 'none'; fill.style.transform = 'scaleX(0)';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ fill.style.transition = ''; fill.style.transform = 'scaleX(' + (pos / 100) + ')'; }); });
    $('attBadges').innerHTML = STEPS.map(function(st){
      var on = STREAK >= st[0];
      return '<div class="att-badge' + (on ? ' on' : '') + '"><span class="att-medal">' + (st[0] ? '<b>' + st[0] + '</b><small>회</small>' : FLAME.replace('<svg', '<svg style="width:24px;height:24px"')) + (on ? '' : '<span class="lk">' + LOCK + '</span>') + '</span><span>' + st[1] + '</span></div>';
    }).join('');
  }
  /* 달력 도장 : 지난 수업일 중 최근 STREAK회는 출석, 그 앞은 결석 1회·연기 1회 순으로 데모 */
  var info = {};
  function decorate(){
    var grid = $('attCalGrid'); if (!grid) return;
    var month = ($('attCalMonth').textContent.match(/(\d+)년 (\d+)월/) || []);
    var y = +month[1], m = +month[2] - 1, today = new Date(); today.setHours(0,0,0,0);
    var cells = [].slice.call(grid.children), past = [];
    cells.forEach(function(c){
      if (!c.classList.contains('class-day') || c.classList.contains('out-range')) return;
      var d = new Date(y, m, +c.textContent.trim()); c.dataset.d = +d;
      if (d < today) past.push(c); else c.classList.add('st-plan');
    });
    var n = past.length;
    past.forEach(function(c, k){
      var fromEnd = n - 1 - k, st = fromEnd === 2 ? 'postpone' : fromEnd <= STREAK ? 'attend' : fromEnd === STREAK + 1 ? 'absent' : 'attend';
      c.classList.add('st-' + st); c.dataset.st = st;
    });
    info = { y:y, m:m };
  }
  function showDay(c){
    var d = new Date(+c.dataset.d), st = c.dataset.st || 'plan', box = $('attDay');
    [].forEach.call(c.parentNode.children, function(x){ x.classList.toggle('sel', x === c); });
    var lab = { attend:'출석', postpone:'연기', absent:'결석', plan:'수업 예정' }[st];
    box.innerHTML = '<span class="tag ' + st + '">' + lab + '</span><b>' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일(' + WD[d.getDay()] + ')</b><em>Lesson.0' + (d.getDate() % 8 + 1) + ' ' + LESSONS[d.getDate() % 8] + '</em>';
    box.hidden = false;
  }
  $('attCalGrid').addEventListener('click', function(e){ var c = e.target.closest('.class-day'); if (c && c.dataset.d) showDay(c); });
  new MutationObserver(function(){ decorate(); $('attDay').hidden = true; renderTop(); }).observe($('attCalGrid'), { childList:true });
  renderTop();

  /* 클래스룸 강의 정보 줄에 연속 출석 칩 */
  function chip(){ var b = document.createElement('button'); b.type = 'button'; b.className = 'att-streak-chip'; b.innerHTML = FLAME + '연속 출석 ' + STREAK + '회'; b.setAttribute('aria-label', '연속 출석 ' + STREAK + '회 · 출석현황 보기'); return b; }
  var meta = document.querySelector('.classroom-cc-meta');
  if (meta) meta.appendChild(chip());
  var tut = document.querySelector('#courseSwiper .course-slide .tutor');
  if (tut) tut.appendChild(chip());
  document.addEventListener('click', function(e){
    if (!e.target.closest('.att-streak-chip')) return; e.preventDefault(); e.stopPropagation();
    if (window.attOpen) window.attOpen(); else { var b = $('attOpenBtn'); if (b) b.click(); }
  }, true);
})();

/* 인터랙션 레이어(add_motion) — 동작 설명은 add_motion.py 상단 참고 */
(function(){
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
})();

/* 내 강의 정보 : 지금 강좌의 이미지 */(function(){ var L = ["https://upsisa.ybmsisa.com/e4u/YBMIngang/ADMIN/files/product/info/D805A4EE-36C7-4F3A-A85C-9430EB0EBBAC.jpg", "https://upsisa.ybmsisa.com/e4u/YBMIngang/ADMIN/files/product/info/D58A3D2F-BCCE-435F-87D7-176C464817B0.jpg", "https://upsisa.ybmsisa.com/e4u/YBMIngang/ADMIN/files/product/info/6DECE5EA-380F-4C9A-B246-1C7E3F183199.jpg"]; document.addEventListener('coursechange', function(e){ var i = document.getElementById('infoImg'); if (i) i.src = L[(e.detail || 0) % L.length]; }); })();