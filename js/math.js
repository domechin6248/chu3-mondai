(function () {
  'use strict';
  const { rand, nz, pick, num, frac, make, gcd } = Q;

  // [[係数, 文字], ...] を「3x² − 2x + 1」の形にする
  function poly(terms) {
    let s = '';
    for (const [c, v] of terms) {
      if (c === 0) continue;
      const abs = Math.abs(c);
      const body = abs === 1 && v ? v : abs + v;
      if (!s) s = (c < 0 ? '−' : '') + body;
      else s += (c < 0 ? ' − ' : ' + ') + body;
    }
    return s || '0';
  }
  const paren = (n) => (n < 0 ? `(${num(n)})` : num(n));
  const quad = (b, c) => poly([[1, 'x²'], [b, 'x'], [c, '']]);
  const lin = (a) => (a === 0 ? 'x' : `x ${a < 0 ? '−' : '+'} ${Math.abs(a)}`);

  // (x + a)(x + b) の表記を一意に決める
  function factored(a, b) {
    if (a === b) return a === 0 ? 'x²' : `(${lin(a)})²`;
    if (a === 0 || b === 0) return `x(${lin(a === 0 ? b : a)})`;
    const [p, q] = a > b ? [a, b] : [b, a];
    return `(${lin(p)})(${lin(q)})`;
  }

  function simp(n) {
    for (let i = Math.floor(Math.sqrt(n)); i >= 2; i--) {
      if (n % (i * i) === 0) return [i, n / (i * i)];
    }
    return [1, n];
  }
  // c√m の表記
  function rootTerm(c, m) {
    if (m === 1) return num(c);
    if (c === 1) return `√${m}`;
    if (c === -1) return `−√${m}`;
    return `${num(c)}√${m}`;
  }
  // √n を簡単にした表記
  function sqrtStr(n, coef = 1) {
    const [k, m] = simp(n);
    return rootTerm(k * coef, m);
  }
  const isSquare = (n) => Number.isInteger(Math.sqrt(n));

  function roots(r1, r2) {
    const [lo, hi] = r1 < r2 ? [r1, r2] : [r2, r1];
    return lo === hi ? `x = ${num(lo)}` : `x = ${num(lo)}, ${num(hi)}`;
  }

  function genExpand() {
    const a = nz(-9, 9);
    const r = Math.random();
    const b = r < 0.2 ? a : r < 0.35 ? -a : nz(-9, 9);
    const expr = a === b ? `(${lin(a)})²` : `(${lin(a)})(${lin(b)})`;
    const answer = quad(a + b, a * b);
    return make({
      category: '式の展開',
      question: `次の式を展開しなさい。\n${expr}`,
      answer,
      distractors: [
        quad(a * b, a + b),
        quad(-(a + b), a * b),
        quad(a + b, -(a * b)),
        quad(-(a + b), -(a * b)),
        a === b ? quad(0, a * a) : null,
      ],
      fallback: () => quad(a + b + nz(-3, 3), a * b),
      explanation: `(x + a)(x + b) = x² + (a + b)x + ab を使う。\na + b = ${num(a + b)}、ab = ${num(a * b)} より、${answer}`,
    });
  }

  function genFactor() {
    const a = nz(-9, 9);
    const r = Math.random();
    const b = r < 0.15 ? a : r < 0.3 ? -a : nz(-9, 9);
    const s = a + b;
    const p = a * b;
    const answer = factored(a, b);
    const sameProduct = () => {
      const x = nz(-12, 12);
      if (p % x !== 0) return null;
      const y = p / x;
      return x + y === s ? null : factored(x, y);
    };
    return make({
      category: '因数分解',
      question: `次の式を因数分解しなさい。\n${quad(s, p)}`,
      answer,
      distractors: [factored(-a, -b), factored(a, -b), factored(-a, b)],
      fallback: () => (Math.random() < 0.6 ? sameProduct() : factored(nz(-9, 9), nz(-9, 9))),
      explanation: `たして ${num(s)}、かけて ${num(p)} になる2数は ${num(a)} と ${num(b)}。\nよって ${answer}`,
    });
  }

  function genQuadEq() {
    if (Math.random() < 0.35) {
      const p = nz(-5, 5);
      let q, D;
      do {
        q = rand(-10, 10);
        D = p * p - q;
      } while (D <= 0 || isSquare(D));
      const answer = `x = ${num(-p)} ± ${sqrtStr(D)}`;
      return make({
        category: '二次方程式',
        question: `次の二次方程式を解きなさい。\n${quad(2 * p, q)} = 0`,
        answer,
        distractors: [
          `x = ${num(p)} ± ${sqrtStr(D)}`,
          `x = ${num(-2 * p)} ± ${sqrtStr(D)}`,
          `x = ${num(-p)} ± ${sqrtStr(4 * D)}`,
          p * p + q > 0 && !isSquare(p * p + q) ? `x = ${num(-p)} ± ${sqrtStr(p * p + q)}` : null,
        ],
        fallback: () => {
          const D2 = D + nz(-3, 3);
          return D2 > 0 && !isSquare(D2) ? `x = ${num(-p)} ± ${sqrtStr(D2)}` : null;
        },
        explanation: `解の公式 x = {−b ± √(b² − 4ac)} / 2a に a = 1, b = ${num(2 * p)}, c = ${num(q)} を代入する。\nx = {${num(-2 * p)} ± √${4 * D}} / 2 = ${num(-p)} ± ${sqrtStr(D)}`,
      });
    }
    let r1 = rand(-9, 9);
    const r2 = nz(-9, 9);
    if (r1 === 0 && Math.random() < 0.5) r1 = nz(-9, 9);
    const answer = roots(r1, r2);
    return make({
      category: '二次方程式',
      question: `次の二次方程式を解きなさい。\n${quad(-(r1 + r2), r1 * r2)} = 0`,
      answer,
      distractors: [roots(-r1, -r2), roots(r1, -r2), roots(-r1, r2)],
      fallback: () => roots(r1 + nz(-2, 2), r2),
      explanation: `左辺を因数分解すると ${factored(-r1, -r2)} = 0\nよって ${answer}`,
    });
  }

  function genSqrt() {
    const m = pick([2, 3, 5, 6, 7]);
    const mode = rand(0, 2);
    if (mode === 0) {
      const k = rand(2, 6);
      const n = k * k * m;
      const answer = rootTerm(k, m);
      return make({
        category: '平方根',
        question: `√${n} を a√b の形に変形しなさい。`,
        answer,
        distractors: [rootTerm(k * k, m), rootTerm(k + 1, m), rootTerm(k - 1, m), `${m}√${k}`],
        explanation: `${n} = ${k * k} × ${m} = ${k}² × ${m} なので、√${n} = ${answer}`,
      });
    }
    if (mode === 1) {
      const k1 = rand(1, 5);
      let k2 = rand(1, 5);
      while (k2 === k1) k2 = rand(1, 5);
      const plus = Math.random() < 0.6;
      const n1 = k1 * k1 * m;
      const n2 = k2 * k2 * m;
      const c = plus ? k1 + k2 : k1 - k2;
      const answer = rootTerm(c, m);
      return make({
        category: '平方根',
        question: `次の計算をしなさい。\n√${n1} ${plus ? '+' : '−'} √${n2}`,
        answer,
        distractors: [
          plus ? `√${n1 + n2}` : rootTerm(k2 - k1, m),
          rootTerm(c + 1, m),
          rootTerm(k1 * k2, m),
          rootTerm(c, 2 * m),
        ],
        fallback: () => rootTerm(c + nz(-3, 3), m),
        explanation: `√${n1} = ${rootTerm(k1, m)}、√${n2} = ${rootTerm(k2, m)} と変形してから計算する。\n${rootTerm(k1, m)} ${plus ? '+' : '−'} ${rootTerm(k2, m)} = ${answer}`,
      });
    }
    const t = rand(1, 4);
    const a = m * t;
    const answer = rootTerm(t, m);
    return make({
      category: '平方根',
      question: `次の数の分母を有理化しなさい。\n${a}/√${m}`,
      answer,
      distractors: [rootTerm(a, m), String(a), `√${m}/${a}`, rootTerm(t + 1, m)],
      explanation: `分母と分子に √${m} をかける。\n${a}√${m} / ${m} = ${answer}`,
    });
  }

  function genExpandGeneral() {
    const a = rand(1, 6);
    const c = rand(1, 6);
    const b = nz(-12, 12);
    const d = nz(-12, 12);
    const lin2 = (p, q) => `(${poly([[p, 'x'], [q, '']])})`;
    const expr = a === c && b === d ? `${lin2(a, b)}²` : `${lin2(a, b)}${lin2(c, d)}`;
    const ex = (p, q, r) => poly([[p, 'x²'], [q, 'x'], [r, '']]);
    const mid = a * d + b * c;
    const answer = ex(a * c, mid, b * d);
    return make({
      category: '式の展開',
      question: `次の式を展開しなさい。\n${expr}`,
      answer,
      distractors: [ex(a * c, a * d - b * c, b * d), ex(a * c, mid, -b * d), ex(a + c, mid, b * d), ex(a * c, b + d, b * d)],
      fallback: () => ex(a * c, mid + nz(-5, 5), b * d),
      explanation: `分配法則で1つずつかける。\n${a}x × ${c}x = ${poly([[a * c, 'x²']])}、外側と内側の積の和 = ${poly([[mid, 'x']])}、${num(b)} × ${num(d)} = ${num(b * d)}\nよって ${answer}`,
    });
  }

  function genExprValue() {
    const x = nz(-9, 9);
    const b = rand(-9, 9);
    const c = rand(-20, 20);
    const v = x * x + b * x + c;
    return make({
      category: '式の値',
      question: `x = ${num(x)} のとき、次の式の値を求めなさい。\n${quad(b, c)}`,
      answer: num(v),
      distractors: [num(-x * x + b * x + c), num(x * x - b * x + c), num(2 * x + b * x + c), num(v + 2)],
      fallback: () => num(v + nz(-10, 10)),
      explanation: `x に ${paren(x)} を代入する。\n${paren(x)}² + ${paren(b)} × ${paren(x)} + ${paren(c)} = ${x * x} + ${paren(b * x)} + ${paren(c)} = ${num(v)}`,
    });
  }

  function genLinearEq() {
    const x = rand(-15, 15);
    const a = nz(-9, 9);
    let c = nz(-9, 9);
    while (c === a) c = nz(-9, 9);
    const b = rand(-20, 20);
    const d = a * x + b - c * x;
    return make({
      category: '一次方程式',
      question: `次の方程式を解きなさい。\n${poly([[a, 'x'], [b, '']])} = ${poly([[c, 'x'], [d, '']])}`,
      answer: `x = ${num(x)}`,
      distractors: [`x = ${num(-x)}`, `x = ${num(x + 1)}`, `x = ${num(x - 1)}`, `x = ${num(x + 2)}`],
      fallback: () => `x = ${num(x + nz(-5, 5))}`,
      explanation: `x の項を左辺、数の項を右辺に移項すると ${poly([[a - c, 'x']])} = ${num(d - b)}\nよって x = ${num(x)}`,
    });
  }

  function genSimultaneous() {
    const x = nz(-9, 9);
    const y = nz(-9, 9);
    let a1, b1, a2, b2;
    do {
      a1 = nz(-7, 7); b1 = nz(-7, 7); a2 = nz(-7, 7); b2 = nz(-7, 7);
    } while (a1 * b2 - a2 * b1 === 0);
    const c1 = a1 * x + b1 * y;
    const c2 = a2 * x + b2 * y;
    const fmt = (p, q) => `x = ${num(p)}, y = ${num(q)}`;
    return make({
      category: '連立方程式',
      question: `次の連立方程式を解きなさい。\n${poly([[a1, 'x'], [b1, 'y']])} = ${num(c1)}\n${poly([[a2, 'x'], [b2, 'y']])} = ${num(c2)}`,
      answer: fmt(x, y),
      distractors: [fmt(y, x), fmt(-x, y), fmt(x, -y), fmt(-x, -y)],
      fallback: () => fmt(x + nz(-2, 2), y + rand(-2, 2)),
      explanation: `加減法または代入法で一方の文字を消去する。\n求めた解を元の式に代入して確かめると、x = ${num(x)}, y = ${num(y)} で両方の式が成り立つ。`,
    });
  }

  function genLinearFunc() {
    const a = nz(-4, 4);
    const b = rand(-8, 8);
    const x1 = rand(-4, 4);
    let x2 = rand(-4, 4);
    while (x2 === x1) x2 = rand(-4, 4);
    const y1 = a * x1 + b;
    const y2 = a * x2 + b;
    const f = (p, q) => `y = ${poly([[p, 'x'], [q, '']])}`;
    return make({
      category: '一次関数',
      question: `2点 (${num(x1)}, ${num(y1)})、(${num(x2)}, ${num(y2)}) を通る直線の式を求めなさい。`,
      answer: f(a, b),
      distractors: [f(-a, b), f(a, -b), b !== 0 ? f(b, a) : null, f(a, b + 2)],
      fallback: () => f(a, b + nz(-4, 4)),
      explanation: `傾き = {${num(y2)} − ${paren(y1)}} ÷ {${num(x2)} − ${paren(x1)}} = ${num(a)}\ny = ${num(a)}x + b に (${num(x1)}, ${num(y1)}) を代入すると b = ${num(b)}`,
    });
  }

  function genQuadFunc() {
    const a = nz(-3, 3);
    const p = rand(-4, 4);
    const q = p + rand(1, 4);
    const ans = a * (p + q);
    return make({
      category: '関数 y = ax²',
      question: `関数 y = ${poly([[a, 'x²']])} について、x の値が ${num(p)} から ${num(q)} まで増加するときの変化の割合を求めなさい。`,
      answer: num(ans),
      distractors: [num(a * (q - p)), num(a * (q * q - p * p)), num(-ans), num(ans + a)],
      fallback: () => num(ans + nz(-6, 6)),
      explanation: `y の値は ${num(a * p * p)} から ${num(a * q * q)} まで変化する。\n変化の割合 = (yの増加量) ÷ (xの増加量) = ${num(a * q * q - a * p * p)} ÷ ${q - p} = ${num(ans)}`,
    });
  }

  function genPythagoras() {
    const mode = rand(0, 3);
    const cm = (s) => `${s} cm`;
    if (mode === 0) {
      const base = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
      const k = base[0] === 3 ? rand(1, 3) : 1;
      const [a, b, c] = base.map((v) => v * k);
      if (Math.random() < 0.5) {
        return make({
          category: '三平方の定理',
          question: `直角をはさむ2辺の長さが ${a}cm と ${b}cm の直角三角形の斜辺の長さは？`,
          answer: cm(c),
          distractors: [cm(a + b), cm(c + 1), cm(c - 1), cm(sqrtStr(b * b - a * a))],
          explanation: `斜辺² = ${a}² + ${b}² = ${a * a + b * b} = ${c}²\nよって斜辺は ${c}cm`,
        });
      }
      return make({
        category: '三平方の定理',
        question: `斜辺が ${c}cm、他の1辺が ${a}cm の直角三角形の、残りの辺の長さは？`,
        answer: cm(b),
        distractors: [cm(sqrtStr(c * c + a * a)), cm(c - a), cm(b + 1), cm(b - 1)],
        explanation: `残りの辺² = ${c}² − ${a}² = ${c * c - a * a} = ${b}²\nよって ${b}cm`,
      });
    }
    if (mode === 1) {
      let a, b;
      do { a = rand(1, 8); b = rand(1, 8); } while (isSquare(a * a + b * b));
      const n = a * a + b * b;
      return make({
        category: '三平方の定理',
        question: `直角をはさむ2辺の長さが ${a}cm と ${b}cm の直角三角形の斜辺の長さは？`,
        answer: cm(sqrtStr(n)),
        distractors: [cm(a + b), a !== b ? cm(sqrtStr(Math.abs(a * a - b * b))) : null, cm(sqrtStr(n + 1)), cm(sqrtStr(2 * n))],
        fallback: () => {
          const v = n + nz(-4, 4);
          return v > 1 ? cm(sqrtStr(v)) : null;
        },
        explanation: `斜辺² = ${a}² + ${b}² = ${n}\n斜辺 = √${n} = ${sqrtStr(n)}cm`,
      });
    }
    if (mode === 2) {
      const a = rand(2, 9);
      return make({
        category: '三平方の定理',
        question: `1辺が ${a}cm の立方体の対角線の長さは？`,
        answer: cm(rootTerm(a, 3)),
        distractors: [cm(rootTerm(a, 2)), cm(3 * a), cm(rootTerm(a, 5)), cm(rootTerm(3 * a, 3))],
        explanation: `立方体の対角線² = ${a}² + ${a}² + ${a}² = 3 × ${a * a}\nよって対角線 = ${rootTerm(a, 3)}cm`,
      });
    }
    const t = rand(1, 6);
    return make({
      category: '三平方の定理',
      question: `1辺が ${2 * t}cm の正三角形の高さは？`,
      answer: cm(rootTerm(t, 3)),
      distractors: [cm(rootTerm(2 * t, 3)), cm(rootTerm(t, 2)), cm(2 * t), cm(rootTerm(t, 5))],
      explanation: `高さで2つに分けると、辺の比 1 : 2 : √3 の直角三角形になる。\n高さ = ${t} × √3 = ${rootTerm(t, 3)}cm`,
    });
  }

  const diceConds = [
    () => { const s = rand(3, 11); return [`出た目の和が ${s} になる`, (a, b) => a + b === s]; },
    () => { const k = pick([3, 4, 5]); return [`出た目の和が ${k} の倍数になる`, (a, b) => (a + b) % k === 0]; },
    () => ['出た目の積が奇数になる', (a, b) => (a * b) % 2 === 1],
    () => ['出た目の積が偶数になる', (a, b) => (a * b) % 2 === 0],
    () => ['少なくとも1つは 1 の目が出る', (a, b) => a === 1 || b === 1],
    () => ['2つとも同じ目が出る', (a, b) => a === b],
    () => { const s = rand(4, 7); return [`出た目の和が ${s} 以下になる`, (a, b) => a + b <= s]; },
    () => ['大きいさいころの目が小さいさいころの目より大きくなる', (a, b) => a > b],
  ];
  const comb2 = (n) => (n * (n - 1)) / 2;

  function genProbability() {
    const mode = rand(0, 2);
    if (mode === 0) {
      const [label, f] = pick(diceConds)();
      let count = 0;
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (f(a, b)) count++;
      return make({
        category: '確率',
        question: `大小2つのさいころを同時に投げるとき、${label}確率を求めなさい。`,
        answer: frac(count, 36),
        distractors: [frac(count + 1, 36), count > 1 ? frac(count - 1, 36) : null, frac(36 - count, 36), count <= 6 ? frac(count, 6) : frac(count, 72)],
        fallback: () => frac(rand(1, 35), 36),
        explanation: `目の出方は全部で 6 × 6 = 36 通り。\n条件を満たすのは ${count} 通りなので、確率は ${count}/36 = ${frac(count, 36)}`,
      });
    }
    if (mode === 1) {
      const n = pick([3, 4]);
      const total = 2 ** n;
      const atLeast = Math.random() < 0.35;
      const k = rand(1, n - 1);
      const C = (m, r) => { let v = 1; for (let i = 0; i < r; i++) v = (v * (m - i)) / (i + 1); return v; };
      const count = atLeast ? total - 1 : C(n, k);
      const label = atLeast ? '少なくとも1枚は表になる' : `${k}枚が表、${n - k}枚が裏になる`;
      return make({
        category: '確率',
        question: `${n}枚の硬貨を同時に投げるとき、${label}確率を求めなさい。`,
        answer: frac(count, total),
        distractors: [frac(1, total), frac(k, n), frac(count + 1, total), frac(count, total * 2), frac(total - count, total)],
        fallback: () => frac(rand(1, total - 1), total),
        explanation: `表裏の出方は全部で 2^${n} = ${total} 通り。\n${atLeast ? '「すべて裏」の1通り以外なので ' + (total - 1) : '条件を満たすのは ' + count} 通り。\nよって ${frac(count, total)}`,
      });
    }
    const r = rand(2, 4);
    const w = rand(2, 3);
    const n = r + w;
    const total = comb2(n);
    const kind = rand(0, 2);
    const [label, count] = [
      ['2個とも赤玉である', comb2(r)],
      ['赤玉と白玉が1個ずつである', r * w],
      ['2個とも白玉である', comb2(w)],
    ][kind];
    return make({
      category: '確率',
      question: `赤玉 ${r} 個、白玉 ${w} 個が入った袋から、同時に2個の玉を取り出すとき、${label}確率を求めなさい。`,
      answer: frac(count, total),
      distractors: [frac(count, n), frac(count + 1, total), frac(total - count, total), frac(count, n * n)],
      fallback: () => frac(rand(1, total - 1), total),
      explanation: `玉の取り出し方は全部で ${n}個から2個を選ぶ ${total} 通り。\n条件を満たすのは ${count} 通りなので、確率は ${frac(count, total)}`,
    });
  }

  function genSimilar() {
    let m, n;
    do { m = rand(1, 5); n = rand(2, 6); } while (m >= n || gcd(m, n) !== 1);
    if (Math.random() < 0.5) [m, n] = [n, m];
    const vol = Math.random() < 0.4;
    const ans = vol ? `${m ** 3}:${n ** 3}` : `${m * m}:${n * n}`;
    return make({
      category: '相似',
      question: vol
        ? `相似比が ${m}:${n} の2つの相似な立体がある。体積比を求めなさい。`
        : `相似比が ${m}:${n} の2つの相似な図形がある。面積比を求めなさい。`,
      answer: ans,
      distractors: [`${m}:${n}`, vol ? `${m * m}:${n * n}` : `${m ** 3}:${n ** 3}`, `${2 * m}:${2 * n}`, `${n}:${m}`],
      explanation: vol
        ? `相似比が m:n のとき、体積比は m³:n³。\n${m}³:${n}³ = ${ans}`
        : `相似比が m:n のとき、面積比は m²:n²。\n${m}²:${n}² = ${ans}`,
    });
  }

  function genCircle() {
    const mode = rand(0, 2);
    const deg = (v) => `${v}°`;
    if (mode === 0) {
      const c = 2 * rand(20, 80);
      return make({
        category: '円周角',
        question: `円Oで、弧ABに対する中心角∠AOBが ${c}° のとき、弧ABに対する円周角∠APBの大きさは？`,
        answer: deg(c / 2),
        distractors: [deg(c), c * 2 < 360 ? deg(c * 2) : null, deg(180 - c / 2), deg(180 - c)],
        fallback: () => deg(c / 2 + 10 * nz(-3, 3)),
        explanation: `円周角は、同じ弧に対する中心角の半分。\n${c}° ÷ 2 = ${c / 2}°`,
      });
    }
    if (mode === 1) {
      const x = rand(20, 85);
      return make({
        category: '円周角',
        question: `円Oで、弧ABに対する円周角∠APBが ${x}° のとき、中心角∠AOBの大きさは？`,
        answer: deg(2 * x),
        distractors: [deg(x), x % 2 === 0 ? deg(x / 2) : null, deg(180 - x), deg(180 - 2 * x)],
        fallback: () => deg(2 * x + 10 * nz(-3, 3)),
        explanation: `中心角は、同じ弧に対する円周角の2倍。\n${x}° × 2 = ${2 * x}°`,
      });
    }
    const x = rand(20, 70);
    return make({
      category: '円周角',
      question: `線分ABは円Oの直径で、点Cは円周上の点である。∠ABC = ${x}° のとき、∠BACの大きさは？`,
      answer: deg(90 - x),
      distractors: [deg(x), deg(180 - x), deg(90 + x), deg(180 - 2 * x)],
      fallback: () => {
        const v = 90 - x + 5 * nz(-4, 4);
        return v > 0 ? deg(v) : null;
      },
      explanation: `半円の弧に対する円周角なので ∠ACB = 90°。\n∠BAC = 180° − 90° − ${x}° = ${90 - x}°`,
    });
  }

  function genPolygon() {
    if (Math.random() < 0.5) {
      const n = rand(5, 12);
      return make({
        category: '多角形の角',
        question: `${n}角形の内角の和は何度か。`,
        answer: `${180 * (n - 2)}°`,
        distractors: [`${180 * n}°`, `${180 * (n - 1)}°`, `${180 * (n - 3)}°`, '360°'],
        explanation: `n角形の内角の和は 180° × (n − 2)。\n180° × ${n - 2} = ${180 * (n - 2)}°`,
      });
    }
    const n = pick([5, 6, 8, 9, 10, 12]);
    const ext = 360 / n;
    if (Math.random() < 0.5) {
      return make({
        category: '多角形の角',
        question: `正${n}角形の1つの外角の大きさは？`,
        answer: `${ext}°`,
        distractors: [`${180 - ext}°`, `${ext * 2}°`, `${ext + 10}°`, `${ext - 6}°`],
        explanation: `多角形の外角の和は常に 360°。\n360° ÷ ${n} = ${ext}°`,
      });
    }
    return make({
      category: '多角形の角',
      question: `正${n}角形の1つの内角の大きさは？`,
      answer: `${180 - ext}°`,
      distractors: [`${ext}°`, `${180 - ext + 10}°`, `${180 - ext - 10}°`, `${180 * (n - 2)}°`],
      explanation: `1つの外角は 360° ÷ ${n} = ${ext}°。\n内角 = 180° − ${ext}° = ${180 - ext}°`,
    });
  }

  function genInverse() {
    const k = pick([12, 18, 24, 36, 48, 60]);
    const divs = [];
    for (let i = 1; i <= k; i++) if (k % i === 0) divs.push(i);
    const x1 = pick(divs.filter((d) => d < k));
    let x2 = pick(divs);
    while (x2 === x1) x2 = pick(divs);
    const sx1 = Math.random() < 0.3 ? -x1 : x1;
    const y1 = k / sx1;
    const y2 = k / x2;
    return make({
      category: '比例・反比例',
      question: `y は x に反比例し、x = ${num(sx1)} のとき y = ${num(y1)} である。x = ${x2} のときの y の値を求めなさい。`,
      answer: num(y2),
      distractors: [frac(y1 * x2, sx1), num(-y2), num(k * x2), num(y2 + 1)],
      fallback: () => num(y2 + nz(-4, 4)),
      explanation: `反比例の式 y = a/x に代入すると a = ${num(sx1)} × ${num(y1)} = ${k}。\ny = ${k}/x に x = ${x2} を代入して y = ${num(y2)}`,
    });
  }

  function genSampling() {
    const r = pick([2, 4, 5, 8, 10]);
    const k = rand(4, 10);
    const n = r * k;
    const R = pick([20, 30, 50, 100]);
    const white = R * (k - 1);
    return make({
      category: '標本調査',
      question: `箱の中に白玉がたくさん入っている。そこに赤玉 ${R} 個を入れてよくかき混ぜ、${n} 個を取り出すと赤玉が ${r} 個ふくまれていた。箱の中の白玉はおよそ何個と推定できるか。`,
      answer: `およそ ${white} 個`,
      distractors: [`およそ ${R * k} 個`, `およそ ${white + R} 個`, `およそ ${(n - r) * r} 個`, `およそ ${Math.round(white / 2)} 個`],
      fallback: () => `およそ ${white + 10 * nz(-5, 8)} 個`,
      explanation: `取り出した玉では 赤:白 = ${r}:${n - r}。\n箱全体でも同じ比と考えると ${R}:x = ${r}:${n - r} より x = ${white}`,
    });
  }

  Q.register({
    id: 'math',
    name: '数学',
    mark: '数',
    topics: '展開・因数分解・平方根・二次方程式・関数・図形・確率',
    generators: [
      { w: 3, gen: genExpand },
      { w: 2, gen: genExpandGeneral },
      { w: 1, gen: genExprValue },
      { w: 3, gen: genFactor },
      { w: 3, gen: genQuadEq },
      { w: 3, gen: genSqrt },
      { w: 1, gen: genLinearEq },
      { w: 2, gen: genSimultaneous },
      { w: 2, gen: genLinearFunc },
      { w: 2, gen: genQuadFunc },
      { w: 3, gen: genPythagoras },
      { w: 2, gen: genProbability },
      { w: 2, gen: genSimilar },
      { w: 2, gen: genCircle },
      { w: 1, gen: genPolygon },
      { w: 1, gen: genInverse },
      { w: 1, gen: genSampling },
    ],
  });
})();
