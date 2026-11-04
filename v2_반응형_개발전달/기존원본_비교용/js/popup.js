/* ======================================================================
   popup.js — 팝업 — 레슨 시트 · 학습 질문 · 만족도 · 리뷰 · 리포트 · AI 히스토리 · 보강 · 출석 · 스케줄 다이얼로그 · 루틴 변경 등
   YBMP.add 의 순번은 v1 실행 순서 — 바꾸지 말 것
   ====================================================================== */

YBMP.add(20, '레슨별 전체보기 바텀시트', function(){
  "use strict";
  /* ---------- 레슨별 전체 보기 바텀시트 (DS 팝업 그대로) ----------
     시안2에서는 사전 예습 리스트의 각 단계를 누르면 열린다. 오늘 레슨(Lesson.01)의 버튼을 누르면
     해당 단계가 '완료'로 바뀌고 시트가 닫힌다 — DS 말풍선의 '바로가기 = 완료' 규칙과 동일 */
  var LESSON_SHEET_DATA = YBMP.demo.lessonSheet;
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
});

YBMP.add(40, '학습 질문', function(){
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
  var qaHistory = YBMP.demo.qaHistory;

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
});

YBMP.add(50, '강사 만족도 평가', function(){
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
  var SAT_QUESTIONS = YBMP.demo.satisfactionQuestions;

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
});

YBMP.add(60, '수업 리뷰', function(){
  "use strict";
  var revOverlay = document.getElementById('revOverlay');
  if (!revOverlay) return;

  /* 발음 확인 2건(단어) / 교정 문장 1건 — 클래스룸 홈 카드의 칩 숫자("발음 확인 2", "교정 문장 1")와 맞춘다.
     발음 확인은 기획안 근거로 문장이 아닌 단어 단위 리스트로 구성(각 단어마다 듣기/재평가 아이콘) */
  var REV_PRON = YBMP.demo.reviewPronunciation;
  var REV_GRAM = YBMP.demo.reviewGrammar;

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
});

YBMP.add(70, 'Class Report', function(){
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
});

YBMP.add(100, 'AI 히스토리', function(){
  "use strict";
  var aihOverlay = document.getElementById('aihOverlay');
  if (!aihOverlay) return;

  var aihListBody = document.getElementById('aihListBody');

  /* 2026-10-01: AI 히스토리 데모 데이터 — 날짜 내림차순. "대화결과"는 완료/진행중 두 상태만 둔다 */
  var aihHistory = YBMP.demo.aiHistory;

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
});

YBMP.add(110, '보강 신청', function(){
  "use strict";
  var mkOverlay = document.getElementById('mkOverlay');
  if (!mkOverlay) return;

  function mkStripTime(d){ var x = new Date(d); x.setHours(0,0,0,0); return x; }
  function mkAddDays(d,n){ var x = new Date(d); x.setDate(x.getDate()+n); return x; }
  function mkSameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
  function mkPad2(n){ return n < 10 ? '0'+n : ''+n; }
  var MK_TODAY = mkStripTime(new Date());
  var MK_WD = ['일','월','화','수','목','금','토'];

  var MK_BLOCKS = YBMP.demo.makeupBlocks;
  var MK_TUTORS = YBMP.demo.makeupTutors;

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
});

/* ===== 스케줄 플로우 : 연기 신청 → 보강 신청 / 연기 취소 / 보강 취소 / 연기·보강 현황 / 안내사항 ===== */
YBMP.add(140, '스케줄 플로우 다이얼로그 · 연기/보강 현황', function(){
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
});

/* ===== 발음·문장 다시 평가 / 듣기 재생 / 수업환경 테스트 ===== */
YBMP.add(150, '다시 평가 · 수업환경 테스트', function(){
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
});

/* 46 내 강의 정보 : 과정명 옆 ⓘ → 지금 강좌의 수강기간 · 수업 일정 · 수업 방식(전화/화상 · 주 N회 · N분) · 강사 */
YBMP.add(210, '내 강의 정보', function(){
  var $ = function(id){ return document.getElementById(id); };
  var ov = $('infoOverlay');
  function read(){ 
    var slides = [].slice.call(document.querySelectorAll('#courseSwiper .course-slide'));
    var sw = $('courseSwiper'), i = sw ? Math.round(sw.scrollLeft / (slides[0] ? slides[0].offsetWidth : 1)) : 0;
    var sl = slides[Math.max(0, Math.min(i, slides.length - 1))];
    var co = sl.querySelector('.course'), chip = co.querySelector('.chip');
    var title = co.firstChild.textContent.trim(), when = sl.querySelector('.when').textContent.trim();
    var tt = sl.querySelector('.tutor').cloneNode(true); [].forEach.call(tt.querySelectorAll('.when, .att-streak-chip, .slide-count'), function(x){ x.remove(); }); var tutor = tt.textContent.trim();
    var PERIOD = YBMP.demo.coursePeriods;
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
});

/* 50~63 수업 루틴 변경 : 메뉴 → (전체) 시작일 → 요일·시간 → 강사 → 완료 / (강사) 시작일 → 강사 → 완료
   (교재) 시작일 → 레벨 → 교재 → 유닛 → 완료 / (전화번호) 번호 → 완료. 뒤로가기는 화면 단위 스택 */
YBMP.add(220, '수업 루틴 변경 · 교재 변경 · 전화번호 변경', function(){
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
  var TUTORS = YBMP.demo.routineTutors;
  var PAST = YBMP.demo.routinePastTutors;
  var STYLE = YBMP.demo.routineStyles;
  var LEVELS = YBMP.demo.bookLevels;
  var BOOKS = YBMP.demo.books;
  var UNITS = YBMP.demo.bookUnits;

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
});

/* 17p 출석현황 고도화 (add_attend) — 데모 값: 연속 5회, 최고 7회. 연속은 '수업한 날' 기준(연기·SKIP은 유지, 결석만 0) */
YBMP.add(230, '출석현황 고도화(연속 출석 · 배지 · 도장)', function(){
  var $ = function(id){ return document.getElementById(id); };
  var LOCK = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"square\" stroke-linejoin=\"miter\" aria-hidden=\"true\"><rect x=\"5\" y=\"11\" width=\"14\" height=\"9\" rx=\"0\"/><path d=\"M8 11V8a4 4 0 0 1 8 0v3\"/></svg>", CHECK = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 13l4 4L19 7\"/></svg>", FLAME = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"square\" stroke-linejoin=\"miter\" aria-hidden=\"true\"><path d=\"M12 3c.5 3.2 4.5 5 4.5 9.6A4.5 4.5 0 0 1 12 17a4.5 4.5 0 0 1-4.5-4.4c0-1.9 1-3.2 2-4 .2 1.5 1 2.4 2 2.7C11 9 11.2 6 12 3z\"/><path d=\"M8 20h8\"/></svg>";
  var STEPS = YBMP.demo.attendanceSteps;
  var STREAK = 5, BEST = 7;
  var WD = ['일','월','화','수','목','금','토'];
  var LESSONS = YBMP.demo.attendanceLessons;
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
    box.innerHTML = '<span class="tag ' + st + '">' + lab + '</span><span class="att-day-txt"><b>' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + WD[d.getDay()] + ')</b><em>Lesson.0' + (d.getDate() % 8 + 1) + ' ' + LESSONS[d.getDate() % 8] + '</em></span>';
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
  if (tut) tut.insertBefore(chip(), tut.querySelector('.slide-count'));
  document.addEventListener('click', function(e){
    if (!e.target.closest('.att-streak-chip')) return; e.preventDefault(); e.stopPropagation();
    if (window.attOpen) window.attOpen(); else { var b = $('attOpenBtn'); if (b) b.click(); }
  }, true);
});

/* 내 강의 정보 : 지금 강좌의 이미지 */
YBMP.add(250, '내 강의 정보 : 강좌 이미지 전환', function(){ var L = ["https://upsisa.ybmsisa.com/e4u/YBMIngang/ADMIN/files/product/info/D805A4EE-36C7-4F3A-A85C-9430EB0EBBAC.jpg", "https://upsisa.ybmsisa.com/e4u/YBMIngang/ADMIN/files/product/info/D58A3D2F-BCCE-435F-87D7-176C464817B0.jpg", "https://upsisa.ybmsisa.com/e4u/YBMIngang/ADMIN/files/product/info/6DECE5EA-380F-4C9A-B246-1C7E3F183199.jpg"]; document.addEventListener('coursechange', function(e){ var i = document.getElementById('infoImg'); if (i) i.src = L[(e.detail || 0) % L.length]; }); });
