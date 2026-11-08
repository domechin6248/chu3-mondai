(function () {
  'use strict';
  // 主語・動詞句・時を表す語句を組み合わせて文法問題を作る
  const { rand, pick, make } = Q;

  // [英語, 日本語, 人称] 1 = I, 2 = 複数・you, 3 = 三人称単数
  const SUBJECTS = [
    ['I', '私', 1], ['You', 'あなた', 2], ['We', '私たち', 2], ['They', '彼ら', 2], ['He', '彼', 3], ['She', '彼女', 3],
    ['Ken', 'ケン', 3], ['Yumi', 'ユミ', 3], ['Tom', 'トム', 3], ['Emi', 'エミ', 3], ['Mike', 'マイク', 3],
    ['Aya', 'アヤ', 3], ['Kenta', 'ケンタ', 3], ['Lisa', 'リサ', 3], ['Taro', 'タロウ', 3], ['Mary', 'メアリー', 3],
    ['Saki', 'サキ', 3], ['John', 'ジョン', 3], ['Nancy', 'ナンシー', 3], ['Bob', 'ボブ', 3], ['Riko', 'リコ', 3],
    ['Shota', 'ショウタ', 3], ['Mai', 'マイ', 3], ['Daiki', 'ダイキ', 3], ['Lucy', 'ルーシー', 3], ['Yuki', 'ユキ', 3],
    ['Kate', 'ケイト', 3], ['David', 'デイビッド', 3], ['Haruto', 'ハルト', 3], ['Sakura', 'サクラ', 3],
    ['My brother', '私の兄', 3], ['My sister', '私の姉', 3], ['My father', '私の父', 3], ['My mother', '私の母', 3],
    ['My grandfather', '私の祖父', 3], ['My grandmother', '私の祖母', 3], ['My friend', '私の友達', 3],
    ['Our teacher', '私たちの先生', 3], ['Mr. Tanaka', '田中先生', 3], ['Ms. Brown', 'ブラウン先生', 3],
    ['Ken and Tom', 'ケンとトム', 2], ['Yumi and Emi', 'ユミとエミ', 2], ['My parents', '私の両親', 2],
    ['The students', '生徒たち', 2], ['My friends', '私の友人たち', 2], ['Mike and I', 'マイクと私', 2],
  ];
  const sub = (s) => ({ en: s[0], jp: s[1], p: s[2] });
  const mid = (s) => (s.en === 'I' || !/^(You|We|They|He|She|My|Our|The)\b/.test(s.en) ? s.en : s.en[0].toLowerCase() + s.en.slice(1));
  const be = (s) => (s.p === 1 ? 'am' : s.p === 2 ? 'are' : 'is');
  const was = (s) => (s.p === 2 ? 'were' : 'was');
  const has = (s) => (s.p === 3 ? 'has' : 'have');
  const does = (s) => (s.p === 3 ? 'does' : 'do');

  // [原形, 目的語など, 日本語の目的語, ます形の語幹, て形, オプション]
  const VPS = [
    ['play', 'tennis', 'テニスを', 'し', 'して'],
    ['play', 'soccer', 'サッカーを', 'し', 'して'],
    ['play', 'baseball', '野球を', 'し', 'して'],
    ['play', 'basketball', 'バスケットボールを', 'し', 'して'],
    ['play', 'the piano', 'ピアノを', 'ひき', 'ひいて'],
    ['play', 'the guitar', 'ギターを', 'ひき', 'ひいて'],
    ['play', 'video games', 'テレビゲームを', 'し', 'して'],
    ['study', 'English', '英語を', '勉強し', '勉強して'],
    ['study', 'math', '数学を', '勉強し', '勉強して'],
    ['study', 'science', '理科を', '勉強し', '勉強して'],
    ['study', 'history', '歴史を', '勉強し', '勉強して'],
    ['read', 'a book', '本を', '読み', '読んで'],
    ['read', 'the newspaper', '新聞を', '読み', '読んで'],
    ['read', 'comic books', 'マンガを', '読み', '読んで'],
    ['write', 'a letter', '手紙を', '書き', '書いて'],
    ['write', 'an email', 'メールを', '書き', '書いて'],
    ['write', 'a story', '物語を', '書き', '書いて'],
    ['watch', 'TV', 'テレビを', '見', '見て'],
    ['watch', 'a movie', '映画を', '見', '見て'],
    ['watch', 'a baseball game', '野球の試合を', '見', '見て'],
    ['clean', 'the room', '部屋を', 'そうじし', 'そうじして'],
    ['clean', 'the kitchen', '台所を', 'そうじし', 'そうじして'],
    ['cook', 'curry', 'カレーを', '作り', '作って'],
    ['make', 'sandwiches', 'サンドイッチを', '作り', '作って'],
    ['make', 'a cake', 'ケーキを', '作り', '作って'],
    ['eat', 'fruit', '果物を', '食べ', '食べて'],
    ['eat', 'rice', 'ご飯を', '食べ', '食べて'],
    ['drink', 'coffee', 'コーヒーを', '飲み', '飲んで'],
    ['drink', 'milk', '牛乳を', '飲み', '飲んで'],
    ['drink', 'green tea', '緑茶を', '飲み', '飲んで'],
    ['use', 'a computer', 'コンピューターを', '使い', '使って'],
    ['use', 'a dictionary', '辞書を', '使い', '使って'],
    ['visit', 'Kyoto', '京都を', '訪れ', '訪れて', { hab: false }],
    ['visit', 'the museum', '博物館を', '訪れ', '訪れて'],
    ['help', 'the teacher', '先生を', '手伝い', '手伝って'],
    ['wash', 'the dishes', '皿を', '洗い', '洗って'],
    ['wash', 'the car', '車を', '洗い', '洗って'],
    ['practice', 'the piano', 'ピアノを', '練習し', '練習して'],
    ['practice', 'judo', '柔道を', '練習し', '練習して'],
    ['practice', 'kendo', '剣道を', '練習し', '練習して'],
    ['speak', 'English', '英語を', '話し', '話して'],
    ['speak', 'Chinese', '中国語を', '話し', '話して'],
    ['teach', 'math', '数学を', '教え', '教えて'],
    ['teach', 'English', '英語を', '教え', '教えて'],
    ['take', 'pictures', '写真を', '撮り', '撮って'],
    ['buy', 'a new bag', '新しいかばんを', '買い', '買って', { hab: false }],
    ['buy', 'some bread', 'パンを', '買い', '買って'],
    ['sing', 'songs', '歌を', '歌い', '歌って'],
    ['draw', 'pictures', '絵を', 'かき', 'かいて'],
    ['open', 'the window', '窓を', '開け', '開けて'],
    ['close', 'the door', 'ドアを', '閉め', '閉めて'],
    ['carry', 'the boxes', '箱を', '運び', '運んで'],
    ['walk', 'the dog', '犬を', '散歩させ', '散歩させて'],
    ['listen', 'to music', '音楽を', '聞き', '聞いて'],
    ['listen', 'to the radio', 'ラジオを', '聞き', '聞いて'],
    ['run', 'in the park', '公園で', '走り', '走って'],
    ['swim', 'in the sea', '海で', '泳ぎ', '泳いで'],
    ['swim', 'in the pool', 'プールで', '泳ぎ', '泳いで'],
    ['go', 'to the library', '図書館に', '行き', '行って', { perf: false }],
    ['go', 'shopping', '買い物に', '行き', '行って', { perf: false }],
    ['grow', 'tomatoes', 'トマトを', '育て', '育てて'],
    ['catch', 'fish', '魚を', 'とり', 'とって'],
    ['ride', 'a bike', '自転車に', '乗り', '乗って'],
    ['drive', 'a car', '車を', '運転し', '運転して'],
    ['send', 'emails', 'メールを', '送り', '送って'],
    ['sell', 'vegetables', '野菜を', '売り', '売って'],
    ['dance', 'with friends', '友達と', '踊り', '踊って'],
    ['fix', 'the bike', '自転車を', '修理し', '修理して'],
    ['learn', 'Japanese', '日本語を', '学び', '学んで'],
    ['climb', 'the mountain', '山に', '登り', '登って', { hab: false }],
  ];

  const IRR = Object.fromEntries(Q.enVerbs.map(([b, p, pp]) => [b, [p, pp]]));
  IRR.drive = ['drove', 'driven'];
  const DOUBLE = new Set(['run', 'swim', 'get', 'stop', 'shop', 'put', 'cut', 'begin', 'plan', 'sit']);
  const third = (v) => (v === 'have' ? 'has' : /(s|sh|ch|x|o)$/.test(v) ? v + 'es' : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + 'ies' : v + 's');
  const regPast = (v) => (DOUBLE.has(v) ? v + v.slice(-1) + 'ed' : v.endsWith('e') ? v + 'd' : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + 'ied' : v + 'ed');
  const ingOf = (v) => (DOUBLE.has(v) ? v + v.slice(-1) + 'ing' : v.endsWith('ie') ? v.slice(0, -2) + 'ying' : v.endsWith('e') && !v.endsWith('ee') ? v.slice(0, -1) + 'ing' : v + 'ing');

  function vp(row) {
    const [base, obj, o, m, te, opt = {}] = row;
    const [past, pp] = IRR[base] || [regPast(base), regPast(base)];
    return { base, obj, o, m, te, s: third(base), ing: ingOf(base), past, pp, hab: opt.hab !== false, perf: opt.perf !== false };
  }
  const ALL_VPS = VPS.map(vp);

  // [英語, 日本語]
  const HAB_TIMES = [
    ['every day', '毎日'], ['every morning', '毎朝'], ['every evening', '毎晩'], ['every Sunday', '毎週日曜日に'],
    ['every Saturday', '毎週土曜日に'], ['on weekends', '週末に'], ['after school', '放課後に'], ['every week', '毎週'],
  ];
  const PAST_TIMES = [
    ['yesterday', '昨日'], ['last Sunday', 'この前の日曜日に'], ['last Saturday', 'この前の土曜日に'], ['last night', '昨夜'],
    ['two days ago', '2日前に'], ['three days ago', '3日前に'], ['last week', '先週'], ['last month', '先月'], ['this morning', '今朝'],
  ];
  const FUT_TIMES = [
    ['tomorrow', '明日'], ['next Sunday', '次の日曜日に'], ['next Saturday', '次の土曜日に'], ['this weekend', '今週末に'],
    ['next week', '来週'], ['next month', '来月'], ['tomorrow morning', '明日の朝'],
  ];
  const EXP_TIMES = ['before', 'many times', 'twice', 'once', 'three times', 'several times'];
  const DUR_TIMES = ['for two hours', 'for three hours', 'for an hour', 'for thirty minutes', 'since this morning', 'since two o\'clock'];
  const PROG_PAST_TIMES = ['at that time', 'at eight last night', 'at ten yesterday morning', 'at three yesterday afternoon'];

  function pickPair(filter) {
    let s, v;
    do {
      s = sub(pick(SUBJECTS));
      v = pick(ALL_VPS);
    } while ((filter && !filter(v)) || (s.en.includes('teacher') && v.obj.includes('teacher')));
    return [s, v];
  }
  const cap = (str) => str[0].toUpperCase() + str.slice(1);
  // read / put のように形が重なる動詞でも4択になるよう、誤った規則変化形も候補に入れる
  const formsOf = (v) => [v.base, v.s, v.ing, v.past, v.pp, IRR[v.base] ? regPast(v.base) : null];
  const sentence = (...parts) => parts.filter(Boolean).join(' ');

  function genPresent() {
    const [s, v] = pickPair((x) => x.hab);
    const [t] = pick(HAB_TIMES);
    const ans = s.p === 3 ? v.s : v.base;
    return make({
      category: '英文法（現在形）',
      question: `( ) に入る最も適切な語は？\n${sentence(s.en, '( )', v.obj, t)}.`,
      answer: ans,
      distractors: formsOf(v),
      explanation: `${sentence(s.en, ans, v.obj, t)}.\n${t} は習慣を表すので現在形。主語が${s.p === 3 ? '三人称単数なので動詞に s(es) をつける' : '三人称単数ではないので動詞は原形のまま'}。`,
    });
  }

  function genPast() {
    const [s, v] = pickPair();
    const [t] = pick(PAST_TIMES);
    return make({
      category: '英文法（過去形）',
      question: `( ) に入る最も適切な語は？\n${sentence(s.en, '( )', v.obj, t)}.`,
      answer: v.past,
      distractors: formsOf(v),
      explanation: `${sentence(s.en, v.past, v.obj, t)}.\n${t} は過去を表すので過去形。${v.base} − ${v.past}`,
    });
  }

  function genDoQuestion() {
    const [s, v] = pickPair((x) => x.hab);
    const [t] = pick(HAB_TIMES);
    const ans = cap(does(s));
    return make({
      category: '英文法（疑問文）',
      question: `( ) に入る最も適切な語は？\n${sentence('( )', mid(s), v.base, v.obj, t)}?`,
      answer: ans,
      distractors: ['Do', 'Does', 'Is', 'Are', 'Am'],
      explanation: `${sentence(ans, mid(s), v.base, v.obj, t)}?\n一般動詞の現在の疑問文は、主語が${s.p === 3 ? '三人称単数なら Does' : '三人称単数以外なら Do'} を文頭に置き、動詞は原形。`,
    });
  }

  function genNegative() {
    const [s, v] = pickPair((x) => x.hab);
    const [t] = pick(HAB_TIMES);
    const ans = s.p === 3 ? "doesn't" : "don't";
    return make({
      category: '英文法（否定文）',
      question: `( ) に入る最も適切な語は？\n${sentence(s.en, '( )', v.base, v.obj, t)}.`,
      answer: ans,
      distractors: ["don't", "doesn't", "isn't", "aren't", "not"],
      explanation: `${sentence(s.en, ans, v.base, v.obj, t)}.\n一般動詞の現在の否定文は don't / doesn't + 動詞の原形。主語が${s.p === 3 ? '三人称単数なので doesn\'t' : '三人称単数ではないので don\'t'}。`,
    });
  }

  function genProgressive() {
    const [s, v] = pickPair();
    const t = pick(['now', 'right now']);
    if (Math.random() < 0.5) {
      return make({
        category: '英文法（進行形）',
        question: `( ) に入る最も適切な語は？\n${sentence(s.en, '( )', v.ing, v.obj, t)}.`,
        answer: be(s),
        distractors: ['am', 'is', 'are', does(s), 'be'],
        explanation: `${sentence(s.en, be(s), v.ing, v.obj, t)}.\n現在進行形は be動詞（am / is / are）+ 〜ing。主語に合わせて ${be(s)} を使う。`,
      });
    }
    return make({
      category: '英文法（進行形）',
      question: `( ) に入る最も適切な語は？\n${sentence(s.en, be(s), '( )', v.obj, t)}.`,
      answer: v.ing,
      distractors: formsOf(v),
      explanation: `${sentence(s.en, be(s), v.ing, v.obj, t)}.\n現在進行形は be動詞 + 〜ing。${v.base} → ${v.ing}`,
    });
  }

  function genPastProgressive() {
    const [s, v] = pickPair();
    const t = pick(PROG_PAST_TIMES);
    return make({
      category: '英文法（進行形）',
      question: `( ) に入る最も適切な語は？\n${sentence(s.en, '( )', v.ing, v.obj, t)}.`,
      answer: was(s),
      distractors: ['was', 'were', be(s), 'did'],
      explanation: `${sentence(s.en, was(s), v.ing, v.obj, t)}.\n過去進行形は was / were + 〜ing。主語が${s.p === 2 ? '複数（または you）なので were' : '単数なので was'}。`,
    });
  }

  function genFuture() {
    const [s, v] = pickPair();
    const [t] = pick(FUT_TIMES);
    if (Math.random() < 0.4) {
      return make({
        category: '英文法（未来）',
        question: `( ) に入る最も適切な語は？\n${sentence(s.en, 'will', '( )', v.obj, t)}.`,
        answer: v.base,
        distractors: formsOf(v),
        explanation: `${sentence(s.en, 'will', v.base, v.obj, t)}.\nwill の後ろは動詞の原形。`,
      });
    }
    if (Math.random() < 0.5) {
      return make({
        category: '英文法（未来）',
        question: `( ) に入る最も適切な語は？\n${sentence(s.en, be(s), 'going to', '( )', v.obj, t)}.`,
        answer: v.base,
        distractors: formsOf(v),
        explanation: `${sentence(s.en, be(s), 'going to', v.base, v.obj, t)}.\nbe going to の後ろは動詞の原形。`,
      });
    }
    return make({
      category: '英文法（未来）',
      question: `( ) に入る最も適切な語は？\n${sentence(s.en, '( )', 'going to', v.base, v.obj, t)}.`,
      answer: be(s),
      distractors: ['am', 'is', 'are', 'will', does(s)],
      explanation: `${sentence(s.en, be(s), 'going to', v.base, v.obj, t)}.\nbe going to の be動詞は主語に合わせる（${be(s)}）。`,
    });
  }

  function genModal() {
    const [s, v] = pickPair();
    const [modal, jp] = pick([['can', '〜できる'], ['must', '〜しなければならない'], ['should', '〜すべきだ'], ['may', '〜してもよい・〜かもしれない']]);
    return make({
      category: '英文法（助動詞）',
      question: `( ) に入る最も適切な語は？\n${sentence(s.en, modal, '( )', v.obj)}.`,
      answer: v.base,
      distractors: formsOf(v).concat(['to ' + v.base]),
      explanation: `${sentence(s.en, modal, v.base, v.obj)}.\n${modal}（${jp}）などの助動詞の後ろは、主語に関係なく動詞の原形。`,
    });
  }

  function genPerfect() {
    const [s, v] = pickPair((x) => x.perf);
    const mode = rand(0, 3);
    if (mode === 0) {
      const t = pick(EXP_TIMES);
      return make({
        category: '英文法（現在完了）',
        question: `( ) に入る最も適切な語は？\n${sentence(s.en, has(s), '( )', v.obj, t)}.`,
        answer: v.pp,
        distractors: formsOf(v),
        explanation: `${sentence(s.en, has(s), v.pp, v.obj, t)}.\n現在完了（経験）は have / has + 過去分詞。${v.base} − ${v.past} − ${v.pp}`,
      });
    }
    if (mode === 1) {
      const t = pick(EXP_TIMES);
      return make({
        category: '英文法（現在完了）',
        question: `( ) に入る最も適切な語は？\n${sentence(s.en, '( )', v.pp, v.obj, t)}.`,
        answer: has(s),
        distractors: ['have', 'has', be(s), 'did'],
        explanation: `${sentence(s.en, has(s), v.pp, v.obj, t)}.\n現在完了は have / has + 過去分詞。主語が${s.p === 3 ? '三人称単数なので has' : '三人称単数ではないので have'}。`,
      });
    }
    if (mode === 2) {
      const ans = cap(has(s));
      return make({
        category: '英文法（現在完了）',
        question: `( ) に入る最も適切な語は？\n${sentence('( )', mid(s), 'ever', v.pp, v.obj)}?`,
        answer: ans,
        distractors: ['Have', 'Has', 'Do', 'Does', 'Is', 'Are'],
        explanation: `${sentence(ans, mid(s), 'ever', v.pp, v.obj)}?\n「今までに〜したことがありますか」は Have / Has + 主語 + ever + 過去分詞 〜?`,
      });
    }
    const [s2, v2] = pickPair((x) => x.hab);
    const t = pick(DUR_TIMES);
    return make({
      category: '英文法（現在完了）',
      question: `( ) に入る最も適切な語は？\n${sentence(s2.en, has(s2), 'been', '( )', v2.obj, t)}.`,
      answer: v2.ing,
      distractors: formsOf(v2),
      explanation: `${sentence(s2.en, has(s2), 'been', v2.ing, v2.obj, t)}.\n現在完了進行形は have / has been + 〜ing で「ずっと〜し続けている」。`,
    });
  }

  // 後ろに動名詞だけをとる動詞・不定詞だけをとる動詞
  const GERUND_VERBS = [['enjoyed', '楽しんだ'], ['finished', '終えた'], ['kept', '続けた']];
  const INF_VERBS = [['wanted', 'したかった'], ['hoped', '望んだ'], ['decided', '決めた'], ['planned', '計画した']];

  function genGerundInf() {
    const [s, v] = pickPair();
    const gerund = Math.random() < 0.45;
    const [verb] = pick(gerund ? GERUND_VERBS : INF_VERBS);
    const ans = gerund ? v.ing : 'to ' + v.base;
    return make({
      category: '英文法（不定詞・動名詞）',
      question: `( ) に入る最も適切な語（句）は？\n${sentence(s.en, verb, '( )', v.obj)}.`,
      answer: ans,
      distractors: [v.ing, 'to ' + v.base, v.base, v.past, 'to ' + v.ing],
      explanation: gerund
        ? `${sentence(s.en, verb, ans, v.obj)}.\nenjoy / finish / keep などの後ろには動名詞（〜ing）が続く。`
        : `${sentence(s.en, verb, ans, v.obj)}.\nwant / hope / decide / plan などの後ろには不定詞（to + 動詞の原形）が続く。`,
    });
  }

  function genTranslate() {
    const kind = rand(0, 3);
    const [s, v] = pickPair(kind === 0 ? (x) => x.hab : null);
    let jp, correct, wrong, note;
    if (kind === 0) {
      const [t, tj] = pick(HAB_TIMES);
      const verb = s.p === 3 ? v.s : v.base;
      jp = `${s.jp}は${tj}${v.o}${v.m}ます。`;
      correct = sentence(s.en, verb, v.obj, t);
      wrong = [s.p === 3 ? v.base : v.s, v.ing, `${be(s)} ${v.base}`, `${be(s)} ${v.ing}`].map((w) => sentence(s.en, w, v.obj, t));
      note = '習慣を表すので現在形。';
    } else if (kind === 1) {
      const [t, tj] = pick(PAST_TIMES);
      jp = `${s.jp}は${tj}${v.o}${v.m}ました。`;
      correct = sentence(s.en, v.past, v.obj, t);
      wrong = [s.p === 3 ? v.s : v.base, v.ing, `${was(s)} ${v.base}`, `will ${v.base}`].map((w) => sentence(s.en, w, v.obj, t));
      note = '過去のことなので過去形。';
    } else if (kind === 2) {
      jp = `${s.jp}は今${v.o}${v.te}います。`;
      correct = sentence(s.en, be(s), v.ing, v.obj, 'now');
      wrong = [`${be(s)} ${v.base}`, v.ing, s.p === 3 ? v.s : v.base, `${has(s)} ${v.ing}`].map((w) => sentence(s.en, w, v.obj, 'now'));
      note = '「今〜している」は現在進行形（be動詞 + 〜ing）。';
    } else {
      const [t, tj] = pick(FUT_TIMES);
      jp = `${s.jp}は${tj}${v.o}${v.m}ます。`;
      correct = sentence(s.en, 'will', v.base, v.obj, t);
      wrong = [`will ${v.s}`, `will ${v.ing}`, v.past, `${be(s)} ${v.base}`].map((w) => sentence(s.en, w, v.obj, t));
      note = '未来のことなので will + 動詞の原形。';
    }
    return make({
      category: '和文英訳',
      question: `次の日本文を英語にしたものとして正しいものは？\n${jp}`,
      answer: correct + '.',
      distractors: wrong.map((w) => w + '.'),
      explanation: `${correct}.\n${note}`,
    });
  }

  const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function words(n) {
    const parts = [];
    if (n >= 1000) { parts.push(ONES[Math.floor(n / 1000)] + ' thousand'); n %= 1000; }
    if (n >= 100) { parts.push(ONES[Math.floor(n / 100)] + ' hundred'); n %= 100; }
    if (n >= 20) parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''));
    else if (n > 0) parts.push(ONES[n]);
    return parts.join(' ');
  }
  const misspell = (w) => w.replace('forty', 'fourty').replace('ninety', 'ninty').replace('twelve', 'twelf').replace('eight', 'eigt');

  function genNumber() {
    const n = rand(1, 9999);
    const rev = Number(String(n).split('').reverse().join(''));
    return make({
      category: '数の英語',
      question: `次の数を英語で書くと？\n${n.toLocaleString('en-US')}`,
      answer: words(n),
      distractors: [misspell(words(n)), rev !== n && rev > 0 ? words(rev) : null, words(n + 1), n > 1 ? words(n - 1) : null, words(n + 10)],
      fallback: () => words(n + rand(2, 20)),
      explanation: `${n.toLocaleString('en-US')} = ${words(n)}\n21〜99 の2けたの部分はハイフンでつなぐ（例：forty-seven）。forty のつづりに注意（fourty ではない）。`,
    });
  }

  const PEOPLE = SUBJECTS.filter((s) => s[2] === 3 && /^[A-Z][a-z]+$/.test(s[0]) && !['He', 'She'].includes(s[0])).map((s) => s[0]);
  // [原級, 比較級, 最上級]
  const ADJS = [
    ['tall', 'taller', 'tallest'], ['short', 'shorter', 'shortest'], ['young', 'younger', 'youngest'],
    ['old', 'older', 'oldest'], ['busy', 'busier', 'busiest'], ['strong', 'stronger', 'strongest'],
    ['kind', 'kinder', 'kindest'], ['famous', 'more famous', 'most famous'], ['popular', 'more popular', 'most popular'],
    ['careful', 'more careful', 'most careful'], ['big', 'bigger', 'biggest'], ['happy', 'happier', 'happiest'],
  ];
  const adjChoices = (a) => {
    const [base, comp, sup] = a;
    const wrongComp = comp.startsWith('more') ? base + 'er' : 'more ' + base;
    return [base, comp, sup, wrongComp];
  };

  function genCompare() {
    const a = pick(ADJS);
    const A = pick(PEOPLE);
    let B = pick(PEOPLE);
    while (B === A) B = pick(PEOPLE);
    const mode = rand(0, 2);
    if (mode === 0) {
      return make({
        category: '英文法（比較）',
        question: `( ) に入る最も適切な語（句）は？\n${A} is ( ) than ${B}.`,
        answer: a[1],
        distractors: adjChoices(a),
        explanation: `${A} is ${a[1]} than ${B}.\n「…より〜」は比較級 + than。${a[1].startsWith('more') ? '長い語は more をつける。' : '短い語は -er をつける。'}`,
      });
    }
    if (mode === 1) {
      const range = pick(['in our class', 'in the team', 'of the four', 'of all the students']);
      return make({
        category: '英文法（比較）',
        question: `( ) に入る最も適切な語（句）は？\n${A} is the ( ) ${range}.`,
        answer: a[2],
        distractors: adjChoices(a),
        explanation: `${A} is the ${a[2]} ${range}.\n「…の中で最も〜」は the + 最上級。in は範囲・場所、of は複数を表す語句の前に使う。`,
      });
    }
    return make({
      category: '英文法（比較）',
      question: `( ) に入る最も適切な語（句）は？\n${A} is as ( ) as ${B}.`,
      answer: a[0],
      distractors: adjChoices(a),
      explanation: `${A} is as ${a[0]} as ${B}.\nas 〜 as … の間は原級（もとの形）。`,
    });
  }

  Q.extend('en', [
    { w: 2, gen: genPresent },
    { w: 2, gen: genPast },
    { w: 1, gen: genDoQuestion },
    { w: 1, gen: genNegative },
    { w: 2, gen: genProgressive },
    { w: 1, gen: genPastProgressive },
    { w: 2, gen: genFuture },
    { w: 1, gen: genModal },
    { w: 3, gen: genPerfect },
    { w: 2, gen: genGerundInf },
    { w: 4, gen: genTranslate },
    { w: 1, gen: genNumber },
    { w: 2, gen: genCompare },
  ]);
})();
