// 問題ジェネレーターの品質チェックと問題数の計測
//   node tools/check.js          品質チェック + 科目ごとの異なる問題数を計測
//   node tools/check.js --quick  品質チェックのみ
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map((m) => m[1]).filter((f) => !f.endsWith('app.js'));

const ctx = { console, Math, Date, Number, String, Object, Array, Set, JSON };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });

const quick = process.argv.includes('--quick');
const BAD = /undefined|NaN|Infinity|null|\[object/;
let problems = 0;

for (const s of ctx.Q.subjects) {
  s.generators.forEach((g, gi) => {
    for (let i = 0; i < 3000; i++) {
      const q = g.gen();
      const issues = [];
      if (q.choices.length !== 4) issues.push(`選択肢${q.choices.length}個`);
      if (new Set(q.choices).size !== q.choices.length) issues.push('選択肢重複');
      if (!q.choices.includes(q.answer)) issues.push('正解なし');
      if (BAD.test(JSON.stringify(q)) || /√-|√0|−0(?!\.)/.test(JSON.stringify(q))) issues.push('不正な値');
      if (issues.length) {
        problems++;
        if (problems <= 20) console.log(`NG ${s.name}#${gi} ${issues.join(',')}: ${q.question.replace(/\n/g, ' / ')} | ${q.choices.join(' ; ')}`);
      }
    }
  });
}
console.log(problems ? `品質チェック: ${problems}件の問題あり` : '品質チェック: OK');

if (!quick) {
  // ランダムに大量生成して、問題文が異なるものを数える（実際の総数はこれ以上）
  const DRAWS = 600000;
  let grand = 0;
  for (const s of ctx.Q.subjects) {
    const seen = new Set();
    for (const g of s.generators) for (let i = 0; i < DRAWS; i++) seen.add(g.gen().question);
    grand += seen.size;
    console.log(`${s.name}: ${seen.size.toLocaleString()} 問以上`);
  }
  console.log(`合計: ${grand.toLocaleString()} 問以上`);
}
process.exit(problems ? 1 : 0);
