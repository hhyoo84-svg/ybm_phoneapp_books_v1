/* ======================================================================
   shell.js — 앱 셸(앱 전용) — 수업 콜 · 푸시 · 스플래시 · 공지 · 권한 안내
   YBMP.add 의 순번은 v1 실행 순서 — 바꾸지 말 것
   ====================================================================== */

/* 33·34 수업 콜(VoIP) : 수신 → [통화하기] 강의실 연결 / [거절하기] 통화 종료(강사가 최대 3회까지 다시 걸어요) */
YBMP.add(160, '수업 콜(VoIP)', function(){
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
});

/* 35~38 수업 전 알림 푸시 : 40분 전 사전 학습 / 20분 전 교재 미리보기 / 10분 전 · 5·3·1분 전 수업 시간
   알림 터치 → 앱 실행 후 사전 학습·교재(오늘 단계) 또는 클래스룸으로 이동 */
YBMP.add(170, '수업 전 알림 푸시', function(){
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
});

/* 39 스플래시 : 앱 실행 → 1.8초 노출(세션·자동 로그인·버전 체크) → 클래스룸. hold=true면 닫지 않음(화면 목록용) */
YBMP.add(180, '스플래시', function(){
  var sp = document.getElementById('splash');
  window.splashOpen = function(hold){
    sp.classList.remove('out'); sp.hidden = false;
    if (!hold) setTimeout(function(){ sp.classList.add('out'); setTimeout(function(){ sp.hidden = true; }, 350); }, 1800);
  };
});

/* 40~43 업데이트 · 시스템 공지
   업데이트(선택): [나중에 하기] 닫고 홈 / [업데이트 하기] 스토어 — 업데이트 없이 돌아오면 다시 노출
   업데이트(강제): [업데이트 하기]만 / 공지: [확인] 닫힘, 오늘 하루·일주일 보지 않기 / 점검·긴급: [확인] 앱 종료 */
YBMP.add(190, '업데이트 · 시스템 공지', function(){
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
});

/* 44·45 접근 권한 안내 : AOS(필수 마이크 / 선택 카메라·알림) · iOS(선택 알림·마이크·카메라)
   [확인] → OS 권한 팝업(AOS 오디오 → 알림 / iOS 알림 → 마이크 → 카메라) → 로그인 */
YBMP.add(200, '접근 권한 안내', function(){
  var ps = document.getElementById('permScreen');
  var G = { aos:'<div class="perm-group"><span class="perm-label">필수 접근 권한</span><ul class="perm-list"><li class="perm-item"><span class="perm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M9 3h6v10H9z"/><path d="M5 11v1a7 7 0 0 0 14 0v-1"/><path d="M12 19v2"/></svg></span><span><span class="perm-name">마이크</span><span class="perm-desc">수업 음성 연결, AI 튜터 학습</span></span></li></ul></div><div class="perm-group"><span class="perm-label">선택 접근 권한</span><ul class="perm-list"><li class="perm-item"><span class="perm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M3 6h12v12H3z"/><path d="M15 10l6-3v10l-6-3"/></svg></span><span><span class="perm-name">카메라</span><span class="perm-desc">화상 수업</span></span></li><li class="perm-item"><span class="perm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M6 17v-6a6 6 0 0 1 12 0v6"/><path d="M4 17h16"/><path d="M10 21h4"/></svg></span><span><span class="perm-name">알림</span><span class="perm-desc">수업 시간 알림, 수업 콜</span></span></li></ul></div>', ios:'<div class="perm-group"><span class="perm-label">선택 접근 권한</span><ul class="perm-list"><li class="perm-item"><span class="perm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M6 17v-6a6 6 0 0 1 12 0v6"/><path d="M4 17h16"/><path d="M10 21h4"/></svg></span><span><span class="perm-name">알림</span><span class="perm-desc">수업 시간 알림, 수업 콜</span></span></li><li class="perm-item"><span class="perm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M9 3h6v10H9z"/><path d="M5 11v1a7 7 0 0 0 14 0v-1"/><path d="M12 19v2"/></svg></span><span><span class="perm-name">마이크</span><span class="perm-desc">전화 · 화상 수업</span></span></li><li class="perm-item"><span class="perm-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"><path d="M3 6h12v12H3z"/><path d="M15 10l6-3v10l-6-3"/></svg></span><span><span class="perm-name">카메라</span><span class="perm-desc">화상 수업</span></span></li></ul></div>' };
  var PATH = { aos:'휴대폰 설정 > 애플리케이션 > YBM 전화화상', ios:'설정 > YBM 전화화상' };
  window.permOpen = function(os){
    document.getElementById('permGroups').innerHTML = G[os] || G.aos;
    document.getElementById('permPath').textContent = PATH[os] || PATH.aos;
    ps.querySelector('.perm-body').scrollTop = 0; ps.hidden = false;
  };
  document.getElementById('permOk').addEventListener('click', function(){ ps.hidden = true; });
});
