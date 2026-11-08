(function () {
  'use strict';

  const STORAGE_KEY = 'chu3-ichimon-v1';
  const LABELS = ['ア', 'イ', 'ウ', 'エ'];
  const COLORS = { jp: '#e0315a', math: '#2563eb', sci: '#0f9d6c', soc: '#d97706', en: '#7c3aed' };

  const subjects = Q.subjects;
  const byId = Object.fromEntries(subjects.map((s) => [s.id, s]));
  const $ = (id) => document.getElementById(id);

  const store = loadStore();
  const recent = {};
  const history = {};
  let currentSubject = null;
  let current = null;
  let answered = false;
  let questionNo = 0;

  function loadStore() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (raw && typeof raw === 'object') return { last: raw.last || null, stats: raw.stats || {} };
    } catch (_) { /* 破損データは無視 */ }
    return { last: null, stats: {} };
  }
  function saveStore() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch (_) { /* 容量超過など */ }
  }
  function statsOf(id) {
    if (!store.stats[id]) store.stats[id] = { total: 0, correct: 0, streak: 0, best: 0 };
    return store.stats[id];
  }

  function renderTabs() {
    const tabs = $('tabs');
    tabs.innerHTML = '';
    for (const s of subjects) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tab';
      b.setAttribute('role', 'tab');
      b.dataset.id = s.id;
      b.style.setProperty('--c', COLORS[s.id]);
      b.innerHTML = `<span class="mark"></span><span class="tab-name"></span>`;
      b.querySelector('.mark').textContent = s.mark;
      b.querySelector('.tab-name').textContent = s.name;
      b.addEventListener('click', () => selectSubject(s.id));
      tabs.appendChild(b);
    }
  }

  function renderHome() {
    const grid = $('subjectGrid');
    grid.innerHTML = '';
    for (const s of subjects) {
      const st = statsOf(s.id);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'subject-card';
      b.style.setProperty('--c', COLORS[s.id]);
      b.innerHTML = `
        <span class="mark"></span>
        <span class="subject-body">
          <span class="subject-name"></span>
          <span class="subject-topics"></span>
          <span class="subject-stat"></span>
        </span>`;
      b.querySelector('.mark').textContent = s.mark;
      b.querySelector('.subject-name').textContent = s.name;
      b.querySelector('.subject-topics').textContent = s.topics;
      b.querySelector('.subject-stat').textContent = st.total
        ? `これまで ${st.total}問・正解率 ${Math.round((st.correct / st.total) * 100)}%`
        : 'まだ解いていません';
      if (store.last === s.id) b.classList.add('last');
      b.addEventListener('click', () => selectSubject(s.id));
      grid.appendChild(b);
    }
  }

  function updateTabs() {
    for (const b of $('tabs').children) {
      const on = b.dataset.id === currentSubject;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    }
  }

  function showHome() {
    currentSubject = null;
    document.body.removeAttribute('data-subject');
    document.body.style.removeProperty('--accent');
    updateTabs();
    renderHome();
    $('home').hidden = false;
    $('quiz').hidden = true;
    $('miniStats').hidden = true;
    window.scrollTo({ top: 0 });
  }

  function selectSubject(id) {
    if (id === currentSubject) return;
    currentSubject = id;
    store.last = id;
    saveStore();
    document.body.dataset.subject = id;
    document.body.style.setProperty('--accent', COLORS[id]);
    updateTabs();
    $('home').hidden = true;
    $('quiz').hidden = false;
    $('miniStats').hidden = false;
    questionNo = 0;
    renderStats();
    renderHistory();
    nextQuestion();
  }

  function generate(subject) {
    const seen = recent[subject.id] || (recent[subject.id] = []);
    let q = null;
    for (let i = 0; i < 40; i++) {
      const g = Q.weightedPick(subject.generators);
      let cand;
      try { cand = g.gen(); } catch (err) { console.error(err); continue; }
      if (!cand || cand.choices.length !== 4) continue;
      q = cand;
      if (!seen.includes(cand.question)) break;
    }
    seen.push(q.question);
    if (seen.length > 60) seen.shift();
    return q;
  }

  function nextQuestion() {
    const subject = byId[currentSubject];
    current = generate(subject);
    answered = false;
    questionNo += 1;

    $('category').textContent = current.category;
    $('qno').textContent = `第${questionNo}問`;
    $('question').textContent = current.question;
    $('feedback').hidden = true;
    $('idkBtn').hidden = false;
    $('nextBtn').hidden = true;
    $('card').classList.remove('is-correct', 'is-wrong');

    const box = $('choices');
    box.innerHTML = '';
    current.choices.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.innerHTML = '<span class="label"></span><span class="text"></span>';
      b.querySelector('.label').textContent = LABELS[i];
      b.querySelector('.text').textContent = c;
      b.addEventListener('click', () => answer(i));
      box.appendChild(b);
    });

    const top = $('card').getBoundingClientRect().top;
    const headerH = document.querySelector('.topbar').offsetHeight;
    if (top < headerH) window.scrollTo({ top: window.scrollY + top - headerH - 12, behavior: 'smooth' });
  }

  function answer(index) {
    if (answered) return;
    answered = true;
    const chosen = index == null ? null : current.choices[index];
    const correct = chosen === current.answer;

    [...$('choices').children].forEach((b, i) => {
      b.disabled = true;
      const c = current.choices[i];
      if (c === current.answer) b.classList.add('correct');
      else if (i === index) b.classList.add('wrong');
      else b.classList.add('dim');
    });

    const st = statsOf(currentSubject);
    st.total += 1;
    if (correct) {
      st.correct += 1;
      st.streak += 1;
      st.best = Math.max(st.best, st.streak);
    } else {
      st.streak = 0;
    }
    saveStore();

    const h = history[currentSubject] || (history[currentSubject] = []);
    h.unshift({ ok: correct, category: current.category, answer: current.answer, q: current.question.split('\n')[0] });
    if (h.length > 20) h.pop();

    const ansIdx = current.choices.indexOf(current.answer);
    $('result').textContent = correct ? '○ 正解！' : index == null ? '答えを確認しよう' : '× 不正解';
    $('result').className = 'result ' + (correct ? 'ok' : 'ng');
    $('answerText').textContent = `${LABELS[ansIdx]}　${current.answer}`;
    $('explanation').textContent = current.explanation || '';
    $('feedback').hidden = false;
    $('card').classList.add(correct ? 'is-correct' : 'is-wrong');
    $('idkBtn').hidden = true;
    $('nextBtn').hidden = false;

    renderStats();
    renderHistory();

    requestAnimationFrame(() => {
      const fb = $('feedback').getBoundingClientRect();
      const actionsH = window.innerWidth < 700 ? 84 : 0;
      if (fb.bottom > window.innerHeight - actionsH) {
        window.scrollBy({ top: fb.bottom - window.innerHeight + actionsH + 16, behavior: 'smooth' });
      }
    });
  }

  function renderStats() {
    const s = byId[currentSubject];
    const st = statsOf(currentSubject);
    const rate = st.total ? Math.round((st.correct / st.total) * 100) : null;
    $('statsSubject').textContent = s.name;
    $('rate').textContent = rate == null ? '--%' : `${rate}%`;
    $('statTotal').textContent = st.total;
    $('statCorrect').textContent = st.correct;
    $('statStreak').textContent = st.streak;
    $('statBest').textContent = st.best;
    $('miniStats').textContent = st.total ? `正解率 ${rate}%（${st.correct}/${st.total}）` : '';
  }

  function renderHistory() {
    const list = $('historyList');
    const h = history[currentSubject] || [];
    list.innerHTML = '';
    for (const it of h.slice(0, 10)) {
      const li = document.createElement('li');
      li.className = it.ok ? 'ok' : 'ng';
      li.innerHTML = '<span class="mk"></span><span class="hc"></span><span class="ha"></span>';
      li.querySelector('.mk').textContent = it.ok ? '○' : '×';
      li.querySelector('.hc').textContent = it.category;
      li.querySelector('.ha').textContent = it.answer;
      list.appendChild(li);
    }
    $('historyEmpty').hidden = h.length > 0;
  }

  $('idkBtn').addEventListener('click', () => answer(null));
  $('nextBtn').addEventListener('click', nextQuestion);
  $('brand').addEventListener('click', showHome);
  $('resetBtn').addEventListener('click', () => {
    const s = byId[currentSubject];
    if (!confirm(`${s.name}の成績をリセットしますか？`)) return;
    store.stats[currentSubject] = { total: 0, correct: 0, streak: 0, best: 0 };
    history[currentSubject] = [];
    saveStore();
    renderStats();
    renderHistory();
  });

  document.addEventListener('keydown', (e) => {
    if (!currentSubject || e.metaKey || e.ctrlKey || e.altKey) return;
    // フォーカス中のボタン自身の Enter / Space と二重に反応させない
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('button')) return;
    if (!answered && /^[1-4]$/.test(e.key)) {
      answer(Number(e.key) - 1);
    } else if (answered && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')) {
      e.preventDefault();
      nextQuestion();
    }
  });

  renderTabs();
  showHome();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Service Worker の登録に失敗', err));
  }
})();
