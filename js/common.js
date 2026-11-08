(function () {
  'use strict';

  const Q = {};

  Q.rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  Q.nz = (min, max) => {
    let v;
    do { v = Q.rand(min, max); } while (v === 0);
    return v;
  };
  Q.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  Q.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  Q.gcd = (a, b) => {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a;
  };
  Q.round = (x, digits = 3) => {
    const p = 10 ** digits;
    return Math.round(x * p) / p;
  };
  // 負の数は全角マイナス記号で表示する
  Q.num = (n) => (n < 0 ? '−' + Math.abs(n) : String(n));
  Q.dec = (x, digits = 3) => Q.num(Q.round(x, digits));
  Q.frac = (n, d) => {
    if (d < 0) { n = -n; d = -d; }
    const g = Q.gcd(n, d) || 1;
    n /= g; d /= g;
    if (d === 1) return Q.num(n);
    return (n < 0 ? '−' : '') + Math.abs(n) + '/' + d;
  };

  // 正解1つ + ダミー3つの4択を組み立てる
  Q.make = ({ category, question, answer, distractors = [], fallback, explanation = '' }) => {
    answer = String(answer);
    const seen = new Set([answer]);
    const pool = [];
    for (const raw of Q.shuffle(distractors)) {
      if (raw == null) continue;
      const d = String(raw);
      if (!d || seen.has(d)) continue;
      seen.add(d);
      pool.push(d);
      if (pool.length >= 3) break;
    }
    let guard = 0;
    while (pool.length < 3 && fallback && guard++ < 300) {
      const raw = fallback();
      if (raw == null) continue;
      const d = String(raw);
      if (!d || seen.has(d)) continue;
      seen.add(d);
      pool.push(d);
    }
    return {
      category,
      question,
      answer,
      choices: Q.shuffle([answer, ...pool]),
      explanation,
    };
  };

  // 知識リストから問題を作るジェネレーターを返す
  Q.fromList = (category, list, { q, a, d, e, same }) => () => {
    const it = Q.pick(list);
    const answer = a(it);
    const distractors = d
      ? d(it)
      : list.filter((o) => o !== it && !(same && same(o, it))).map(a);
    return Q.make({
      category,
      question: q(it),
      answer,
      distractors,
      explanation: e ? e(it) : '',
    });
  };

  Q.weightedPick = (items) => {
    const total = items.reduce((s, it) => s + (it.w || 1), 0);
    let r = Math.random() * total;
    for (const it of items) {
      r -= it.w || 1;
      if (r <= 0) return it;
    }
    return items[items.length - 1];
  };

  Q.subjects = [];
  Q.register = (subject) => Q.subjects.push(subject);
  Q.extend = (id, generators) => {
    Q.subjects.find((s) => s.id === id).generators.push(...generators);
  };

  window.Q = Q;
})();
