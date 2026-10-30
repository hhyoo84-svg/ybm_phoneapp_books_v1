/* ======================================================================
   js/schedule-wide.js — 스케줄 가로 UI (가로 폭 1024px 이상) · Schedule_011/012_W1_FULL (기획안 14~15p)
   마크업 : inc/schedule.html 의 .schedule-wide-* (모바일에서는 CSS로 숨김)
   스타일 : css/schedule-wide.css
   - 왼쪽 : 기존 주간 스트립 · 바로가기 · 일별 수업 목록 그대로 (카드 디자인은 모바일과 동일)
   - 오른쪽 : 한 달 단위 월간 달력. 날짜를 누르면 왼쪽 주간·목록이 그 날짜로 이동
   데이터 · 선택일은 schedule.js 의 window.__scApi 를 쓴다
   ====================================================================== */
YBMP.add(290, '스케줄 가로 UI (≥1024)', function(){
  "use strict";
  var api = window.__scApi, panel = document.getElementById('scWideMonth');
  if (!api || !panel) return;
  var $ = function(id){ return document.getElementById(id); };
  var mq = window.matchMedia('(min-width:1024px)');
  var WD = api.wd;
  var LABEL = { upcoming:'예정', attended:'출석', postponed:'연기', absent:'결석', cancelled:'취소', skip:'SKIP' };
  var cursor = new Date(api.today.getFullYear(), api.today.getMonth(), 1);

  /* 날짜 묶음에 수업이 2개 이상이면 "총 N회 수업" */
  function paintDayCount(){
    [].forEach.call(document.querySelectorAll('#scAgendaList .schedule-day-group'), function(g){
      var n = g.querySelectorAll('.schedule-class-card').length, head = g.querySelector('.schedule-day-head');
      if (n > 1 && head && !head.querySelector('.schedule-wide-count')) head.insertAdjacentHTML('beforeend', '<span class="schedule-wide-count">총 ' + n + '회 수업</span>');
    });
  }

  /* 오른쪽 월간 달력 : 하루에 수업이 여러 개면 칩을 모두 표시 */
  function renderMonth(){
    var grid = $('scWideMonthGrid'), sel = api.selected(), y = cursor.getFullYear(), m = cursor.getMonth();
    $('scWideMonthText').textContent = y + '년 ' + (m + 1) + '월';
    var first = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate(), html = '';
    for (var b = 0; b < first; b++) html += '<span class="schedule-month-cell is-blank" aria-hidden="true"></span>';
    for (var dn = 1; dn <= dim; dn++){
      var day = new Date(y, m, dn), dow = day.getDay(), hol = api.holiday(day), cls = api.classesOn(day);
      var chips = cls.map(function(c){
        var st = c.makeupOf ? 'makeup' : c.status;
        return '<span class="chip month-cell-chip status-' + st + '" data-size="small">' + c.time + ' ' + (c.makeupOf ? '보강' : (LABEL[c.status] || '예정')) + '</span>';
      }).join('');
      html += '<button type="button" class="schedule-month-cell' + (api.sameDay(day, api.today) ? ' today' : '') + (api.sameDay(day, sel) ? ' selected' : '') +
        (dow === 0 ? ' sun' : '') + (hol ? ' holiday' : '') + '" data-day="' + dn + '" aria-label="' + (m + 1) + '월 ' + dn + '일 ' + WD[dow] + '요일' + (cls.length ? ', 수업 ' + cls.length + '개' : '') + '">' +
        '<span class="month-cell-num">' + dn + '</span>' + (hol ? '<span class="month-cell-holiday-name">' + hol + '</span>' : '') +
        (chips ? '<span class="schedule-wide-chips">' + chips + '</span>' : '') + '</button>';
    }
    grid.innerHTML = html;
  }

  $('scWideMonthGrid').addEventListener('click', function(e){
    var c = e.target.closest('.schedule-month-cell[data-day]'); if (!c) return;
    api.select(new Date(cursor.getFullYear(), cursor.getMonth(), +c.getAttribute('data-day')));
    /* 왼쪽 목록에서 그 날짜 묶음이 보이게 */
    var g = document.querySelector('#scAgendaList .schedule-day-group[data-key="' + api.selected().getFullYear() + '-' + ('0' + (api.selected().getMonth() + 1)).slice(-2) + '-' + ('0' + api.selected().getDate()).slice(-2) + '"]');
    if (g) g.scrollIntoView({ block:'nearest', behavior:'smooth' });
  });
  $('scWidePrev').addEventListener('click', function(){ cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1); renderMonth(); });
  $('scWideNext').addEventListener('click', function(){ cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1); renderMonth(); });
  $('scWideToday').addEventListener('click', function(){ api.select(api.today); });
  /* 년월 선택 : 기존 년월 피커를 그대로 연다 (확인하면 선택일이 그 달로 이동) */
  $('scWideMonthLabel').addEventListener('click', function(){ var t = $('scMonthTrigger'); if (t) t.click(); });

  /* 주간이 다시 그려질 때마다(주 이동 · 날짜 선택 · 강좌 변경) 월간을 선택일의 달로 맞춤 */
  document.addEventListener('scweekrender', function(e){
    var sel = e.detail.selected;
    if (!mq.matches) return;
    paintDayCount();
    cursor = new Date(sel.getFullYear(), sel.getMonth(), 1);
    renderMonth();
  });

  /* 가로 UI에서는 주간 보기 고정 (월간은 오른쪽 패널) */
  function apply(){
    if (!mq.matches) return;
    api.weekMode();
    api.refresh();
  }
  if (mq.addEventListener) mq.addEventListener('change', apply); else mq.addListener(apply);
  /* 가로 UI에서 월간 보기로 바뀌면(세로 화면에서 월간을 보다가 돌린 경우 등) 바로 주간으로 */
  var mcal = $('scMonthCalendar');
  if (mcal) new MutationObserver(function(){ if (mq.matches && !mcal.hidden) api.weekMode(); }).observe(mcal, { attributes:true, attributeFilter:['hidden'] });
  apply();
});
