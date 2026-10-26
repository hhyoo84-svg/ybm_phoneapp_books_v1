/* ======================================================================
   화면 목록(screens-list.html)용 상태 재현 — 실서비스에는 포함하지 않음
   classroom.html?screen=05 처럼 열면 해당 번호의 화면 상태로 이동한 뒤 부모 창에 준비 완료를 알린다
   ====================================================================== */
/* 화면 목록용 39~40p 상태 재현 (add_flow) */
(function(){
  var V = 2;
  function api(){ return V === 1 ? window.__sc1 : window.__scApi; }
  function course(){ return V === 1 ? (api().list()[0] || {}).subject : api().course(); }
  function all(){ return V === 1 ? api().all() : api().list(); }
  function today(){ var t = new Date(); t.setHours(0,0,0,0); return t; }
  function target(){
    var t = today(), wk = new Date(t); wk.setDate(t.getDate() - t.getDay() + 6);
    var L = all().filter(function(c){ return c.subject === course() && !c.makeupOf && c.status === 'upcoming' && c.d >= t; }).sort(function(a, b){ return a.d - b.d; });
    return L.filter(function(c){ return c.d <= wk; })[0] || L[0];
  }
  function flow(act, c){ if (V === 1) window.scFlow1(act, c); else window.scFlow(act, c); }
  function ok(){ var b = V === 1 ? document.getElementById('scConfirmOkBtn') : document.querySelector('#scDlgBtns .btn:last-child'); if (b) b.click(); }
  function refresh(){ api().refresh(); }
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  function cardOf(c){
    var cards = document.querySelectorAll('#scAgendaList .schedule-class-card');
    return Array.prototype.filter.call(cards, function(x){ return x.textContent.indexOf(c.time) >= 0 && x.querySelector('.btn'); });
  }
  window.flowDemo = async function(k){
    var c = target(); if (!c) return;
    if (V === 1 && api().select) api().select(c.d);
    if (k === 'postpone-ask'){ flow('연기신청', c); return; }
    if (k === 'makeup-guide'){ flow('연기신청', c); await wait(350); ok(); return; }
    if (k === 'postponed-card'){ c.status = 'postponed'; refresh(); await wait(100); var el = document.querySelector('.class-card-ctas'); if (el) el.closest('.schedule-class-card').scrollIntoView({ block:'center' }); return; }
    if (k === 'cancel-occupied'){ c.status = 'postponed'; var dup = { d:c.d, time:c.time, subject:c.subject, status:'upcoming', key:c.key }; all().push(dup); refresh(); await wait(100); flow('연기 취소', c); return; }
    if (k === 'cancel-postpone'){ c.status = 'postponed'; refresh(); await wait(100); flow('연기 취소', c); return; }
    if (k === 'makeup-done'){
      c.status = 'postponed'; refresh(); window.mkOpenForClass(c); await wait(450);
      var cells = document.querySelectorAll('#mkCalGrid button:not([disabled]), #mkCalGrid .makeup-cal-cell:not(.out-range)'); if (cells[2]) cells[2].click();
      document.getElementById('mkSubmitBtn').click(); await wait(450);
      var bl = document.querySelectorAll('#mkBlockGrid button'); if (bl[4]) bl[4].click(); await wait(250);
      var sl = document.querySelector('#mkSlotGrid button:not([disabled])'); if (sl) sl.click(); await wait(150);
      document.getElementById('mkSubmitBtn').click(); return;
    }
    if (k === 'makeup-cancel'){
      var m = all().filter(function(x){ return x.subject === course() && x.makeupOf; })[0];
      if (m){ if (V === 1 && api().select) api().select(m.d); flow('보강 취소', m); } return;
    }
  };
})();

(function(){
  var NO = new URLSearchParams(location.search).get('screen'); if (!NO) return;
  var w = function(t){ return new Promise(function(r){ setTimeout(r, t); }); };
      var $ = function(s){ return document.querySelector(s); };
      var click = function(s){ var e = typeof s === 'string' ? $(s) : s; if (e) e.click(); };
      var pin = function(css){ var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); };
      async function review(){ click('#tileReview'); await w(500); }
      async function sched(){ click('[data-nav=schedule]'); await w(500); }
      async function qa(){ click('#ctaAskQuestion'); await w(500); }
      async function sat(){ click('#ctaSatisfaction'); await w(500); }
      async function mic(){ await review(); click('#revMicTestTrigger'); await w(500); }
      function stars(qs, idx){ qs.forEach(function(q){ var st = document.querySelectorAll('#satItem' + q + ' .satisfaction-star'); if (st[idx]) st[idx].click(); }); }
      var S = {
        '01': async function(){},
        '02': async function(){ click('[data-rc-tabs] button[data-i="1"]'); },
        '03': async function(){ click('[data-rc-tabs] button[data-i="2"]'); },
        '04': sched,
        '05': async function(){ await sched(); click('.segment[data-mode=month]'); },
        '06': async function(){ window.openLessonSheet(document.querySelector('.classroom-step[data-step-id="lesson"]')); },
        '07': qa,
        '08': async function(){ await qa(); click('[data-qa-tab=history]'); },
        '09': sat,
        '10': review,
        '11': mic,
        '12': async function(){ await review(); window.veOpen('taste', false); },
        '13': async function(){ window.crOpen(); },
        '14': async function(){ window.attOpen(); },
        '15': async function(){ window.aihOpen(); },
        '16': async function(){ window.aihSheetOpen(); },
        '17': async function(){ click('#envTestLink'); },
        '18': async function(){ $('#popupOverlay').classList.add('open'); },
        '19': async function(){ await sched(); click('#scMonthTrigger'); },
        '20': async function(){ await sched(); click('#scQuicklinks .schedule-quicklink-item'); },
        '21': async function(){ await sched(); await window.flowDemo('postpone-ask'); },
        '22': async function(){ await sched(); window.mkOpenForClass({ subject:'비즈니스 실전 회화' }); },
        '23': async function(){ await S['22'](); await w(500); var c = document.querySelectorAll('.makeup-cal-cell:not(.out-range)'); if (c[2]) c[2].click(); click('#mkSubmitBtn'); await w(500); var b = document.querySelectorAll('.makeup-block-btn'); if (b[4]) b[4].click(); },
        '24': async function(){ await qa(); click('#qaSubmitBtn'); },
        '25': async function(){ await qa(); var f = $('#qaOverlay').querySelectorAll('input, textarea'); var v = ['리스닝 학습법 문의', '리스닝 파트를 더 효율적으로 연습하는 방법이 궁금합니다.', 'chloe@abc.co.kr']; f.forEach(function(x, i){ x.value = v[i] || ''; x.dispatchEvent(new Event('input', { bubbles:true })); }); click('#qaSubmitBtn'); },
        '26': async function(){ await sat(); stars([0, 1], 3); click('#satSubmitBtn'); await w(400); var b = $('#satOverlay .modal-body'); if (b) b.scrollTop = 0; },
        '27': async function(){ await sat(); stars([0, 1, 2, 3, 4, 5], 4); click('#satSubmitBtn'); },
        '28': async function(){ await mic(); $('#revMicTestBtn').classList.add('recording'); },
        '29': async function(){ await mic(); Math.random = function(){ return 0.9; }; click('#revMicTestBtn'); await w(1500); pin('#revMicTestToast{opacity:1!important;transform:translate(-50%,0)!important}'); },
        '30': async function(){ await mic(); Math.random = function(){ return 0.1; }; click('#revMicTestBtn'); await w(1500); pin('#revMicTestToast{opacity:1!important;transform:translate(-50%,0)!important}'); },
        '31': async function(){ await review(); var a = [0.9, 0.3], i = 0; Math.random = function(){ return a[i++ % a.length]; }; window.veOpen('taste', false); await w(400); click('#veMicBtn'); },
        '32': async function(){ await review(); var a = [0.6, 0.1, 0.9, 0.3], i = 0; Math.random = function(){ return a[i++ % a.length]; }; window.veOpen("She doesn't have any hobbies these days.", true); await w(400); click('#veMicBtn'); }
        ,'33': async function(){ window.callOpen(); }
        ,'34': async function(){ window.callConnect(); }
        ,'35': async function(){ window.pushOpen('pre40'); }
        ,'36': async function(){ window.pushOpen('book20'); }
        ,'37': async function(){ window.pushOpen('cls10'); }
        ,'38': async function(){ window.pushOpen('cls5'); }
        ,'39': async function(){ window.splashOpen(true); }
        ,'40': async function(){ window.noticeOpen('update'); }
        ,'41': async function(){ window.noticeOpen('force'); }
        ,'42': async function(){ window.noticeOpen('notice'); }
        ,'43': async function(){ window.noticeOpen('maint'); }
        ,'44': async function(){ window.permOpen('aos'); }
        ,'45': async function(){ window.permOpen('ios'); }
        ,'46': async function(){ window.infoOpen(); }
        ,'47': async function(){ window.enterDemo(7200); }
        ,'48': async function(){ window.enterDemo(2530, true); }
        ,'49': async function(){ window.enterDemo(299); }
        ,'50': async function(){ await sched(); window.rtOpen(); }
        ,'51': async function(){ await sched(); window.rtDemo('date-pick'); }
        ,'52': async function(){ await sched(); window.rtDemo('detail'); }
        ,'53': async function(){ await sched(); window.rtDemo('detail-alert'); }
        ,'54': async function(){ await sched(); window.rtDemo('tutor'); }
        ,'55': async function(){ await sched(); window.rtDemo('tutor-info'); }
        ,'56': async function(){ await sched(); window.rtDemo('style'); }
        ,'57': async function(){ await sched(); window.rtDemo('done'); }
        ,'58': async function(){ await sched(); window.rtDemo('level'); }
        ,'59': async function(){ await sched(); window.rtDemo('books'); }
        ,'60': async function(){ await sched(); window.rtDemo('unit'); }
        ,'61': async function(){ await sched(); window.rtDemo('book-done'); }
        ,'62': async function(){ await sched(); window.rtDemo('phone'); }
        ,'63': async function(){ await sched(); window.rtDemo('phone-done'); }
        ,'64': async function(){ await sched(); await window.flowDemo('makeup-guide'); }
        ,'65': async function(){ await sched(); await window.flowDemo('postponed-card'); }
        ,'66': async function(){ await sched(); await window.flowDemo('cancel-postpone'); }
        ,'67': async function(){ await sched(); await window.flowDemo('cancel-occupied'); }
        ,'68': async function(){ await sched(); await window.flowDemo('makeup-done'); }
        ,'69': async function(){ await sched(); await window.flowDemo('makeup-cancel'); }
        ,'70': async function(){ window.setOpen({ osNoti:true, latest:false }); }
        ,'71': async function(){ window.setOpen({ osNoti:false, latest:true }); }
        ,'72': async function(){ window.setOpen(); await w(300); click('#setClassTime'); }
        ,'73': async function(){ window.setOpen(); await w(300); click('#setOverlay .set-switch[data-key=call]'); }
        ,'74': async function(){ window.setOpen({ osNoti:false, platform:'aos' }); await w(300); window.setAskOs(); }
        ,'75': async function(){ window.setOpen({ osNoti:false, platform:'ios' }); await w(300); window.setAskOs(); }
        ,'76': async function(){ window.setOpen(); await w(250); window.setWebOpen('terms'); }
        ,'77': async function(){ window.setOpen(); await w(250); window.setWebOpen('privacy'); }
        ,'78': async function(){ window.setOpen(); await w(250); window.setWebOpen('leave'); }
        ,'79': async function(){ window.setLoginOpen(); }
      };
  window.addEventListener('load', async function(){
    await w(700);
    try { if (S[NO]) await S[NO](); } catch (e) { console.error('state', NO, e); }
    await w(NO === '31' || NO === '32' || NO === '34' ? 2600 : 500);
    try { parent.postMessage({ protoReady: NO }, '*'); } catch (e) {}
  });
})();
