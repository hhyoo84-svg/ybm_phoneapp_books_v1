/* ======================================================================
   js/settings.js — 설정 · 약관/탈퇴 웹뷰 · 로그인 웹뷰  (앱 전용)
   마크업 : inc/settings.html   스타일 : css/settings.css
   다이얼로그는 popup.js 의 window.scDlgOpen 을 쓴다 (와옹이 캐릭터는 core.js DLG 맵에서 제목으로 지정)
   실서비스 : 설정은 네이티브. 토글 값 저장 · OS 권한 이동 · 스토어 이동 · 웹뷰 URL 은 앱에서 처리
   ====================================================================== */
YBMP.add(300, '설정 · 약관 · 로그인', function(){
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var page = $('#setOverlay'); if (!page) return;
  var web = $('#setWeb'), sheet = $('#setTimeSheet'), login = $('#setLogin');

  function open(el){ el.hidden = false; requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('on'); }); }); }
  function close(el){ el.classList.remove('on'); setTimeout(function(){ el.hidden = true; }, 220); }
  function dlg(o){ if (window.scDlgOpen) window.scDlgOpen(o); }

  /* ---------- 상태 : 기기 알림 · 버전 · 플랫폼 (실서비스는 앱이 넘겨줌) ---------- */
  var S = { osNoti:true, latest:false, platform:'aos', cur:'2.1.1', last:'2.1.2' };
  function paint(){
    $('#setOsNoti').hidden = S.osNoti;
    $('#setUpdate').hidden = S.latest;
    $('#setVerOk').hidden = !S.latest;
    $('#setVerTxt').textContent = S.latest ? '현재 ' + S.last : '현재 ' + S.cur + ' · 최신 ' + S.last;
  }

  /* ---------- 진입 · 뒤로가기 : 들어온 화면(클래스룸/스케줄) 그대로 ---------- */
  document.addEventListener('click', function(e){ if (e.target.closest('.classroom-topbar-gear')) window.setOpen(); });
  $('#setBack').addEventListener('click', function(){ close(page); });
  window.setOpen = function(o){
    if (o) Object.keys(o).forEach(function(k){ S[k] = o[k]; });
    paint(); page.querySelector('.modal-body').scrollTop = 0; open(page);
  };

  /* ---------- 토글 ---------- */
  function setSw(btn, on){ btn.classList.toggle('on', on); btn.setAttribute('aria-checked', String(on)); if (btn.dataset.key === 'class') $('#setClassTimeRow').hidden = !on; }
  [].forEach.call(page.querySelectorAll('.set-switch'), function(btn){
    btn.addEventListener('click', function(){
      var on = !btn.classList.contains('on');
      /* 수업 콜을 끌 때만 한 번 더 확인 — [알림 끄기]를 눌러야 꺼지고, 닫기·[계속 받기]는 켜 둔 그대로 */
      if (btn.dataset.key === 'call' && !on){
        dlg({ title:'수업 콜 수신', msg:'수업 콜 수신을 끄면 중요한 수업 안내나\n알림을 받지 못할 수 있어요.',
          buttons:[{ text:'알림 끄기', ghost:true, fn:function(){ setSw(btn, false); } }, { text:'계속 받기' }] });
        return;
      }
      setSw(btn, on);
    });
  });

  /* ---------- 수업 시간 알림 · 시간 선택 (바텀시트) ---------- */
  var opts = [].slice.call(sheet.querySelectorAll('[data-min]'));
  $('#setClassTime').addEventListener('click', function(){ open(sheet); });
  $('#setTimeClose').addEventListener('click', function(){ close(sheet); });
  sheet.addEventListener('click', function(e){ if (e.target === sheet) close(sheet); });
  opts.forEach(function(b){
    b.addEventListener('click', function(){
      opts.forEach(function(x){ x.setAttribute('aria-checked', String(x === b)); });
      $('#setClassTimeVal').textContent = b.textContent;
      setTimeout(function(){ close(sheet); }, 160);
    });
  });

  /* ---------- 기기 알림 꺼짐 → [변경하기] : AOS 는 설정 앱으로, iOS 는 알림 허용 요청 ---------- */
  function askOs(){
    var done = function(){ S.osNoti = true; paint(); };
    if (S.platform === 'ios') dlg({ title:'알림 허용', msg:'정확한 시간에 수업 알림을 받으려면\n알림을 허용해 주세요.',
      buttons:[{ text:'취소', ghost:true }, { text:'허용', fn:done }] });
    else dlg({ title:'알림 및 리마인더 권한 필요', msg:'정확한 시간에 알림을 보내려면\n‘알람 및 리마인더’ 권한이 필요해요.\n설정으로 이동해 권한을 허용해 주세요.',
      buttons:[{ text:'취소', ghost:true }, { text:'설정으로 이동', fn:done }] });
  }
  $('#setOsNotiBtn').addEventListener('click', askOs);
  window.setAskOs = askOs;

  /* ---------- 버전 : [업데이트] → 스토어 (시안에서는 최신 상태로만 바꿈) ---------- */
  $('#setUpdate').addEventListener('click', function(){ S.latest = true; paint(); });

  /* ---------- 약관 · 개인정보 · 탈퇴 : 기존 웹페이지 웹뷰, 뒤로가기 → 설정 ---------- */
  var WEB = { terms:'이용약관', privacy:'개인정보처리방침', leave:'회원탈퇴' };
  window.setWebOpen = function(k){ $('#setWebTitle').textContent = $('#setWebName').textContent = WEB[k] || ''; web.querySelector('.set-webview').scrollTop = 0; open(web); };
  [].forEach.call(page.querySelectorAll('[data-web]'), function(b){ b.addEventListener('click', function(){ window.setWebOpen(b.dataset.web); }); });
  $('#setWebBack').addEventListener('click', function(){ close(web); });

  /* ---------- 로그아웃 → 로그인(웹뷰). 기획안대로 확인 없이 바로 ---------- */
  window.setLoginOpen = function(){ login.hidden = false; };
  $('#setLogout').addEventListener('click', function(){ window.setLoginOpen(); page.hidden = true; page.classList.remove('on'); web.hidden = true; web.classList.remove('on'); });
  $('#setLoginDemo').addEventListener('click', function(){ login.hidden = true; });

  paint();
});
