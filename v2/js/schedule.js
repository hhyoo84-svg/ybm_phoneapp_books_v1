/* ======================================================================
   schedule.js — 스케줄 — 달력(주간/월간) · 년월 피커 · 일별 목록 · 화면 전환
   YBMP.add 의 순번은 v1 실행 순서 — 바꾸지 말 것
   ====================================================================== */

YBMP.add(30, '스케줄 달력 · 년월 피커 · 주간/월간 · 화면 전환(하단 내비)', function(){
  "use strict";
  /* ---------- 스케줄 : 시안1 v2 캘린더 구조(년월 피커 · TODAY · 주간/월간 전환 · 공휴일 · 주간 리스트) ---------- */
  var courses = YBMP.demo.scheduleCourses;
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
  var SC_HOLIDAYS = YBMP.demo.holidays;
  function scHolidayName(d){ return SC_HOLIDAYS[ymd(d)] || ''; }

  /* 데모용 수업 일정 — 클래스룸 화면의 강좌명을 그대로 재사용.
     월간 달력에서 기본 선택 강좌(Speaking Practice with YBM 초급)만으로도 출석/연기/결석/예정 4가지 칩이 골고루 보이도록 분산 배치 */
  var SC_CLASSES = YBMP.demo.scheduleClasses.map(function(c){ var o = {}; for (var k in c) o[k] = c[k]; o.d = addDays(SC_TODAY, c.day); delete o.day; if (c.makeupOf) o.makeupOf = { d: addDays(SC_TODAY, c.makeupOf.day), time: c.makeupOf.time }; return o; }).map(function(c){ c.key = ymd(c.d); return c; });

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
      html+='<div class="schedule-day-group'+(sameDay(d,SC_TODAY)?' is-today':'')+'" data-key="'+ymd(d)+'">'+
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

  /* 월간 → 주간 복귀 : 기본은 맨 위(상단 카드 전체가 보이게).
     선택한 날에 수업이 있으면 그 날짜 묶음(날짜 + 첫 카드)이 화면에 들어올 만큼만 내린다 */
  function scScrollWeekToSelected(){
    var area = document.getElementById('scheduleArea'); if (!area) return;
    area.scrollTop = 0;
    requestAnimationFrame(function(){
      var g = area.querySelector('.schedule-day-group[data-key="' + ymd(scSelectedDate) + '"]');
      if (!g) return;
      var ar = area.getBoundingClientRect(), gr = g.getBoundingClientRect();
      var need = (gr.top - ar.top) + Math.min(gr.height, 140) - area.clientHeight + 12;
      if (need > 0) area.scrollTop = need;
    });
  }
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
    if (isWeek){ scRenderWeek(); scScrollWeekToSelected(); }
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
});

/* 회의 반영(10/14) — 스케줄 : 월간이면 좌우 화살표·메뉴 숨김, 클래스명 드롭다운 힌트 */
YBMP.add(280, '스케줄 월간 TODAY · 안내 · 드롭다운', function(){
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
});
