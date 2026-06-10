/* FIGHT CAMP 식단 — vanilla JS, localStorage 단일 키 */
(function () {
  'use strict';

  var STORE_KEY = 'fightcamp-diet';
  var PROTEIN_GOAL = 190;
  var KCAL_GOAL = 2950;
  var DAYS_KEEP = 30;

  var MEALS = [
    { id: 'b',  slot: '아침',        name: '오트밀 100g + 계란 4개 + 우유',        protein: 38, kcal: 740 },
    { id: 'l',  slot: '점심 · 세션 전', name: '밥 1.5공기 + 닭다리살 300g + 채소',    protein: 58, kcal: 880 },
    { id: 'pw', slot: '운동 직후',     name: '웨이 2스쿱 + 우유 + 바나나',           protein: 52, kcal: 500 },
    { id: 'd',  slot: '저녁 · 회복식',  name: '밥/감자 + 로테이션 단백질',            protein: 38, kcal: 650 },
    { id: 'n',  slot: '자기 전',      name: '그릭요거트 200g',                    protein: 16, kcal: 180 }
  ];

  var SHOP_ITEMS = [
    { id: 'chicken', name: '닭다리살 2.5kg',            src: '할랄 정육점 (£3/kg)',       price: 7.50 },
    { id: 'beef',    name: '소고기 다짐육 500g (20%)',    src: 'Aldi·Lidl',               price: 3.00 },
    { id: 'tuna',    name: '캔참치 4캔',                src: '자체브랜드',                price: 3.60 },
    { id: 'eggs',    name: '계란 30구',                 src: '마켓이 더 쌈',              price: 5.50 },
    { id: 'oats',    name: '오트밀 1kg',                src: '자체브랜드',                price: 1.30 },
    { id: 'rice',    name: '쌀 2kg',                   src: '아시안 마트 벌크가 최저',      price: 3.00 },
    { id: 'milk',    name: '우유 4핀트 × 3',            src: '',                        price: 4.50 },
    { id: 'yogurt',  name: '그릭요거트 1.5kg',           src: '자체브랜드 (Fage 금지)',     price: 4.50 },
    { id: 'veg',     name: '냉동 야채믹스 2kg',           src: '',                        price: 3.50 },
    { id: 'potato',  name: '감자 2.5kg',                src: '마켓',                     price: 1.50 },
    { id: 'banana',  name: '바나나 한 다발',              src: '마켓',                     price: 1.00 },
    { id: 'whey',    name: '웨이 프로틴 (월 £20, 주 환산)', src: '벌크 1kg 단위 구매',        price: 5.00 },
    { id: 'sauce',   name: '소금·핫소스·간장 등',          src: '',                        price: 2.00 }
  ];

  /* ---------- state ---------- */

  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { /* corrupt → reset */ }
    if (!s || typeof s !== 'object') s = {};
    if (!s.days || typeof s.days !== 'object') s.days = {};
    if (!s.shop || typeof s.shop !== 'object') s.shop = {};
    if (!Array.isArray(s.weights)) s.weights = [];
    return s;
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (e) { toast('저장 실패 — 저장 공간을 확인해줘', true); }
  }

  function dateKey(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function todayKey() { return dateKey(new Date()); }

  function pruneOldDays() {
    var cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - DAYS_KEEP);
    var cutKey = dateKey(cutoff);
    var changed = false;
    Object.keys(state.days).forEach(function (k) {
      if (k < cutKey) { delete state.days[k]; changed = true; }
    });
    if (changed) save();
  }

  function todayRecord() {
    var k = todayKey();
    if (!state.days[k]) state.days[k] = { checked: [] };
    return state.days[k];
  }

  var state = load();
  pruneOldDays();

  /* ---------- helpers ---------- */

  function $(sel) { return document.querySelector(sel); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var toastTimer = null;
  function toast(msg, isError) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('is-error', !!isError);
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2200);
  }

  function gbp(n) { return '£' + n.toFixed(2); }

  /* ---------- 탭 ---------- */

  var TABS = ['today', 'plan', 'shop', 'weight'];

  function switchTab(name) {
    TABS.forEach(function (t) {
      var tab = $('#tab-' + t);
      var panel = $('#panel-' + t);
      var on = t === name;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
  }

  TABS.forEach(function (t) {
    $('#tab-' + t).addEventListener('click', function () { switchTab(t); });
  });

  /* ---------- 1. 오늘 ---------- */

  var renderedDay = null;

  function renderHeaderDate() {
    var d = new Date();
    var days = ['일', '월', '화', '수', '목', '금', '토'];
    $('#header-date').textContent =
      (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + days[d.getDay()] + ')';
  }

  function buildMealList() {
    var list = $('#meal-list');
    list.textContent = '';
    MEALS.forEach(function (m) {
      var btn = el('button', 'meal');
      btn.type = 'button';
      btn.dataset.id = m.id;
      btn.setAttribute('role', 'checkbox');
      btn.setAttribute('aria-checked', 'false');

      var check = el('span', 'meal-check', '✓');
      check.setAttribute('aria-hidden', 'true');

      var body = el('div', 'meal-body');
      body.appendChild(el('div', 'meal-slot', m.slot));
      body.appendChild(el('div', 'meal-name', m.name));

      var macros = el('div', 'meal-macros');
      var p = el('div', 'p', m.protein + 'g');
      macros.appendChild(p);
      macros.appendChild(el('div', null, m.kcal + 'kcal'));

      btn.appendChild(check);
      btn.appendChild(body);
      btn.appendChild(macros);
      btn.addEventListener('click', function () { toggleMeal(m.id); });
      list.appendChild(btn);
    });
  }

  function toggleMeal(id) {
    var rec = todayRecord();
    var i = rec.checked.indexOf(id);
    if (i >= 0) rec.checked.splice(i, 1);
    else rec.checked.push(id);
    save();
    renderToday();
  }

  function renderToday() {
    renderedDay = todayKey();
    renderHeaderDate();
    var rec = todayRecord();
    var protein = 0, kcal = 0;
    MEALS.forEach(function (m) {
      var on = rec.checked.indexOf(m.id) >= 0;
      $('#meal-list [data-id="' + m.id + '"]').setAttribute('aria-checked', String(on));
      if (on) { protein += m.protein; kcal += m.kcal; }
    });

    $('#protein-now').textContent = protein + 'g';
    $('#kcal-now').textContent = kcal.toLocaleString('ko-KR');

    var pBar = $('#protein-bar');
    pBar.style.width = Math.min(100, protein / PROTEIN_GOAL * 100) + '%';
    pBar.classList.toggle('tape-green', protein >= PROTEIN_GOAL);
    pBar.classList.toggle('tape-yellow', protein < PROTEIN_GOAL);
    $('#kcal-bar').style.width = Math.min(100, kcal / KCAL_GOAL * 100) + '%';

    var hint = $('#today-hint');
    hint.classList.remove('is-clear');
    if (rec.checked.length === 0) {
      hint.textContent = '먹은 끼니를 탭해서 체크';
    } else if (protein >= PROTEIN_GOAL) {
      hint.textContent = '단백질 클리어. 오늘 회복은 확보됐다.';
      hint.classList.add('is-clear');
    } else {
      var left = MEALS.length - rec.checked.length;
      hint.textContent = '단백질 ' + (PROTEIN_GOAL - protein) + 'g 남음 — ' + left + '끼 남았어';
    }
  }

  $('#btn-reset-today').addEventListener('click', function () {
    state.days[todayKey()] = { checked: [] };
    save();
    renderToday();
    toast('오늘 기록을 초기화했어');
  });

  /* 자정 넘으면 자동으로 새 날 시작 */
  function checkDayRollover() {
    if (renderedDay !== todayKey()) {
      renderToday();
      renderWeight(); /* 날짜 라벨 갱신 */
    }
  }
  setInterval(checkDayRollover, 30 * 1000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) checkDayRollover();
  });

  /* ---------- 3. 장보기 ---------- */

  function buildShopList() {
    var list = $('#shop-list');
    list.textContent = '';
    SHOP_ITEMS.forEach(function (item) {
      var btn = el('button', 'shop-item');
      btn.type = 'button';
      btn.dataset.id = item.id;
      btn.setAttribute('role', 'checkbox');
      btn.setAttribute('aria-checked', 'false');

      var check = el('span', 'meal-check', '✓');
      check.setAttribute('aria-hidden', 'true');

      var body = el('div', 'shop-body');
      body.appendChild(el('div', 'shop-name', item.name));
      if (item.src) body.appendChild(el('div', 'shop-src', item.src));

      btn.appendChild(check);
      btn.appendChild(body);
      btn.appendChild(el('span', 'shop-price', gbp(item.price)));
      btn.addEventListener('click', function () {
        if (state.shop[item.id]) delete state.shop[item.id];
        else state.shop[item.id] = true;
        save();
        renderShop();
      });
      list.appendChild(btn);
    });

    var total = SHOP_ITEMS.reduce(function (a, i) { return a + i.price; }, 0);
    $('#shop-total').textContent = gbp(total);
  }

  function renderShop() {
    var remaining = 0;
    SHOP_ITEMS.forEach(function (item) {
      var on = !!state.shop[item.id];
      $('#shop-list [data-id="' + item.id + '"]').setAttribute('aria-checked', String(on));
      if (!on) remaining += item.price;
    });
    $('#shop-remaining').textContent = gbp(remaining);
  }

  $('#btn-reset-shop').addEventListener('click', function () {
    state.shop = {};
    save();
    renderShop();
    toast('장보기 리스트를 리셋했어');
  });

  /* ---------- 4. 체중 ---------- */

  $('#weight-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var input = $('#weight-input');
    var v = parseFloat(input.value);
    if (isNaN(v)) {
      toast('숫자를 입력해줘 (예: 78.4)', true);
      input.focus();
      return;
    }
    if (v < 50 || v > 150) {
      toast('50–150kg 사이로 입력해줘', true);
      input.focus();
      return;
    }
    v = Math.round(v * 10) / 10;
    var k = todayKey();
    var existing = state.weights.find(function (w) { return w.date === k; });
    if (existing) {
      existing.kg = v;
      toast('오늘 체중을 ' + v + 'kg로 덮어썼어');
    } else {
      state.weights.push({ date: k, kg: v });
      toast(v + 'kg 기록 완료');
    }
    state.weights.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    save();
    input.value = '';
    renderWeight();
  });

  function deleteWeight(date) {
    state.weights = state.weights.filter(function (w) { return w.date !== date; });
    save();
    renderWeight();
    toast('기록을 삭제했어');
  }

  function renderChart() {
    var box = $('#weight-chart');
    box.textContent = '';
    var data = state.weights.slice(-30);
    if (data.length < 2) {
      box.appendChild(el('p', 'chart-empty', '기록이 2개 이상 쌓이면 차트가 그려져'));
      return;
    }

    var W = 520, H = 200, PAD = { t: 22, r: 14, b: 14, l: 14 };
    var kgs = data.map(function (w) { return w.kg; });
    var min = Math.min.apply(null, kgs);
    var max = Math.max.apply(null, kgs);
    var span = Math.max(max - min, 0.5);
    var n = data.length;

    function x(i) { return PAD.l + (W - PAD.l - PAD.r) * (n === 1 ? 0.5 : i / (n - 1)); }
    function y(kg) { return PAD.t + (H - PAD.t - PAD.b) * (1 - (kg - min) / span); }

    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    var pts = data.map(function (w, i) { return x(i) + ',' + y(w.kg); }).join(' ');
    var line = document.createElementNS(NS, 'polyline');
    line.setAttribute('points', pts);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#E84B3C');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('stroke-linejoin', 'round');
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);

    data.forEach(function (w, i) {
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', x(i));
      dot.setAttribute('cy', y(w.kg));
      dot.setAttribute('r', '4');
      dot.setAttribute('fill', '#F2C94C');
      svg.appendChild(dot);
    });

    /* 최소/최대 라벨 */
    [{ v: max, anchor: 'min-side' }, { v: min }].forEach(function (m) {
      var idx = kgs.indexOf(m.v);
      var label = document.createElementNS(NS, 'text');
      var lx = Math.min(Math.max(x(idx), 30), W - 30);
      label.setAttribute('x', lx);
      label.setAttribute('y', m.v === max ? Math.max(y(m.v) - 10, 12) : Math.min(y(m.v) + 18, H - 2));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', '#8A9099');
      label.setAttribute('font-size', '12');
      label.setAttribute('font-family', 'IBM Plex Sans KR, sans-serif');
      label.textContent = m.v.toFixed(1);
      svg.appendChild(label);
    });

    box.appendChild(svg);
  }

  function renderPace() {
    var msg = $('#pace-msg');
    if (state.weights.length < 2) {
      msg.textContent = '목표 페이스: 주당 −0.3 ~ −0.5kg. 주 3회 아침 공복 측정.';
      return;
    }
    var first = state.weights[0];
    var last = state.weights[state.weights.length - 1];
    var days = (new Date(last.date) - new Date(first.date)) / 86400000;
    if (days < 1) {
      msg.textContent = '목표 페이스: 주당 −0.3 ~ −0.5kg. 주 3회 아침 공복 측정.';
      return;
    }
    var pace = (last.kg - first.kg) / days * 7;
    var paceTxt = (pace > 0 ? '+' : '−') + Math.abs(pace).toFixed(2) + 'kg/주';
    var advice;
    if (pace < -0.6) advice = '너무 빨라. 점심 밥 0.5공기 추가.';
    else if (pace > -0.1) advice = '정체. 일요일 저탄수 패턴을 주 2회로.';
    else advice = '적정 페이스. 유지.';
    msg.textContent = '페이스 ' + paceTxt + ' — ' + advice;
  }

  function renderWeightList() {
    var ul = $('#weight-list');
    ul.textContent = '';
    if (state.weights.length === 0) {
      ul.appendChild(el('li', 'chart-empty', '아직 기록이 없어. 첫 체중을 기록해봐.'));
      return;
    }
    state.weights.slice().reverse().forEach(function (w) {
      var li = el('li');
      li.appendChild(el('span', 'w-date', w.date));
      li.appendChild(el('span', 'w-kg', w.kg.toFixed(1) + 'kg'));
      var del = el('button', 'w-del', '삭제');
      del.type = 'button';
      del.setAttribute('aria-label', w.date + ' ' + w.kg + 'kg 기록 삭제');
      del.addEventListener('click', function () { deleteWeight(w.date); });
      li.appendChild(del);
      ul.appendChild(li);
    });
  }

  function renderWeight() {
    renderChart();
    renderPace();
    renderWeightList();
  }

  /* ---------- init ---------- */

  buildMealList();
  buildShopList();
  renderToday();
  renderShop();
  renderWeight();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () { /* 오프라인 등록 실패 무시 */ });
    });
  }
})();
