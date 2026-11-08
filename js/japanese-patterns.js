(function () {
  'use strict';
  // 文節の部品を組み合わせて例文を作り、文法（文節・主語・述語・修飾・品詞）を問う
  const { rand, pick, make } = Q;

  // [名詞, 助詞]
  const SUBJECTS = [
    ['私', 'は'], ['兄', 'は'], ['姉', 'は'], ['弟', 'は'], ['妹', 'は'], ['父', 'は'], ['母', 'は'],
    ['祖父', 'は'], ['祖母', 'は'], ['友達', 'は'], ['先生', 'は'], ['彼', 'は'], ['彼女', 'は'], ['ぼく', 'は'],
    ['田中さん', 'は'], ['健太', 'が'], ['由美', 'が'], ['兄', 'が'], ['妹', 'が'],
  ];
  const TIMES = ['昨日', '今日', '毎朝', '日曜日に', '夕方', '夕食後に', '先週', '休日に', '夏休みに', '午後'];
  // [語, 品詞]  品詞が null のものは品詞問題に使わない
  const ADVERBS = [
    ['楽しく', '形容詞'], ['初めて', '副詞'], ['一生懸命', null], ['友達と', null], ['家族と', null],
    ['二時間', null], ['久しぶりに', null], ['じっくり', '副詞'], ['すぐに', '副詞'],
  ];
  const MOD_POS = {
    新しい: '形容詞', 古い: '形容詞', おもしろい: '形容詞', 難しい: '形容詞', 分厚い: '形容詞', 長い: '形容詞',
    短い: '形容詞', 美しい: '形容詞', こわい: '形容詞', おいしい: '形容詞', 温かい: '形容詞', 明るい: '形容詞',
    白い: '形容詞', かわいい: '形容詞', 赤い: '形容詞', 珍しい: '形容詞', 甘い: '形容詞', 高い: '形容詞',
    青い: '形容詞', 広い: '形容詞', 親しい: '形容詞', 大きい: '形容詞', 小さい: '形容詞',
    好きな: '形容動詞', 有名な: '形容動詞', 大切な: '形容動詞', きれいな: '形容動詞', 簡単な: '形容動詞',
    静かな: '形容動詞', 立派な: '形容動詞', 不思議な: '形容動詞', 特別な: '形容動詞',
    大きな: '連体詞', 小さな: '連体詞', あの: '連体詞', その: '連体詞', この: '連体詞',
  };
  // 目的語（名詞＋助詞）・述語・使える修飾語・場所・副詞と相性が悪いもの
  const ACTIVITIES = [
    { n: '本', p: 'を', v: '読んだ', mods: ['新しい', '古い', 'おもしろい', '難しい', '分厚い', '好きな', '有名な', 'あの', 'その', 'この'], places: ['公園で', '図書館で', '家で', '電車で'] },
    { n: 'サッカー', p: 'を', v: 'した', mods: [], places: ['公園で', '校庭で', '川原で'], noAdv: ['じっくり'] },
    { n: '手紙', p: 'を', v: '書いた', mods: ['長い', '短い', '大切な', '不思議な'], places: ['家で', '部屋で', '図書館で'] },
    { n: '絵', p: 'を', v: 'かいた', mods: ['大きな', '小さな', 'きれいな', '美しい', '不思議な', '大きい', '小さい'], places: ['公園で', '家で', '美術室で', '川原で'] },
    { n: '写真', p: 'を', v: '撮った', mods: ['きれいな', '美しい', '珍しい', '特別な', 'その'], places: ['公園で', '駅前で', '川原で'] },
    { n: '映画', p: 'を', v: '見た', mods: ['おもしろい', '古い', '有名な', '新しい', 'こわい', '不思議な'], places: ['家で', '映画館で'] },
    { n: '料理', p: 'を', v: '作った', mods: ['おいしい', '簡単な', '温かい', '特別な'], places: ['家で', '台所で'] },
    { n: '宿題', p: 'を', v: '終えた', mods: ['難しい', '簡単な', 'その'], places: ['家で', '図書館で', '部屋で'] },
    { n: '音楽', p: 'を', v: '聞いた', mods: ['静かな', '好きな', '明るい', '古い', '特別な'], places: ['家で', '部屋で', '電車で'] },
    { n: '犬', p: 'と', v: '遊んだ', mods: ['小さな', '白い', 'かわいい', '大きな', 'あの', 'その'], places: ['公園で', '庭で', '川原で'], noAdv: ['友達と', '家族と', 'じっくり'] },
    { n: '花', p: 'を', v: '育てた', mods: ['赤い', '美しい', '珍しい', '白い', 'きれいな'], places: ['庭で', '学校で', 'ベランダで'] },
    { n: 'ケーキ', p: 'を', v: '食べた', mods: ['甘い', '大きな', 'おいしい', '特別な', '小さな'], places: ['家で', '店で', '公園で'] },
    { n: 'ピアノ', p: 'を', v: 'ひいた', mods: ['古い', '新しい', '大きな', '立派な'], places: ['家で', '音楽室で', 'ホールで'] },
    { n: '問題', p: 'を', v: '解いた', mods: ['難しい', '簡単な', '新しい', '不思議な', 'その'], places: ['家で', '図書館で', '教室で'] },
    { n: '歌', p: 'を', v: '歌った', mods: ['好きな', '明るい', '有名な', '古い', '静かな'], places: ['教室で', '家で', '音楽室で'] },
    { n: '山', p: 'に', v: '登った', mods: ['高い', '有名な', '美しい', '大きな', 'あの'], places: [] },
    { n: '友達', p: 'に', v: '会った', mods: ['古い', '親しい', '大切な'], places: ['駅前で', '公園で', '図書館で'], noAdv: ['友達と', 'じっくり'] },
    { n: '自転車', p: 'に', v: '乗った', mods: ['新しい', '赤い', '古い', '白い'], places: ['公園で', '川原で'], noAdv: ['じっくり'] },
    { n: '部屋', p: 'を', v: 'そうじした', mods: ['広い', '小さな', '古い', 'きれいな'], places: [] },
    { n: '海', p: 'で', v: '泳いだ', mods: ['青い', 'きれいな', '広い', '美しい'], places: [], noAdv: ['じっくり'] },
  ];

  // 1文を文節の配列として作る
  function buildSentence() {
    const act = pick(ACTIVITIES);
    let sn, sp;
    do { [sn, sp] = pick(SUBJECTS); } while (sn === act.n);
    const parts = [];
    const subj = { text: sn + sp, role: 'subj', noun: sn, particle: sp };
    const time = Math.random() < 0.8 ? { text: pick(TIMES), role: 'time' } : null;
    const place = act.places.length && Math.random() < 0.7 ? { text: pick(act.places), role: 'place' } : null;
    const advList = ADVERBS.filter((a) => !(act.noAdv || []).includes(a[0]));
    const advPick = Math.random() < 0.6 ? pick(advList) : null;
    const adv = advPick ? { text: advPick[0], role: 'adv', pos: advPick[1] } : null;
    const modWord = act.mods.length && Math.random() < 0.7 ? pick(act.mods) : null;
    const mod = modWord ? { text: modWord, role: 'mod', pos: MOD_POS[modWord] } : null;
    const obj = { text: act.n + act.p, role: 'obj', noun: act.n, particle: act.p };
    const pred = { text: act.v, role: 'pred' };
    // 時を表す語は「昨日、兄は〜」のように文頭に出すこともある
    const timeFirst = time && Math.random() < 0.35;
    if (timeFirst) parts.push(time);
    parts.push(subj);
    if (time && !timeFirst) parts.push(time);
    if (place) parts.push(place);
    if (adv) parts.push(adv);
    if (mod) parts.push(mod);
    parts.push(obj, pred);
    const text = parts.map((p, i) => p.text + (timeFirst && i === 0 ? '、' : '')).join('') + '。';
    return { parts, text, act };
  }

  const countLabel = (n) => `${n}文節`;

  function genBunsetsuCount() {
    const s = buildSentence();
    const n = s.parts.length;
    return make({
      category: '文法（文節）',
      question: `次の文はいくつの文節に分けられるか。\n${s.text}`,
      answer: countLabel(n),
      distractors: [countLabel(n + 1), countLabel(n - 1), countLabel(n + 2), n > 3 ? countLabel(n - 2) : null],
      explanation: `${s.parts.map((p) => p.text).join('／')}\n「ネ」を入れて自然に区切れるところが文節の切れ目。全部で${n}文節。`,
    });
  }

  function otherChoices(s, exclude) {
    return s.parts.filter((p) => p !== exclude).map((p) => p.text);
  }

  function genSubjectPredicate() {
    let s;
    do { s = buildSentence(); } while (s.parts.length < 4);
    const subj = s.parts.find((p) => p.role === 'subj');
    const pred = s.parts.find((p) => p.role === 'pred');
    if (Math.random() < 0.5) {
      return make({
        category: '文法（主語・述語）',
        question: `次の文の主語（主部の中心となる文節）はどれか。\n${s.text}`,
        answer: subj.text,
        distractors: otherChoices(s, subj),
        explanation: `述語「${pred.text}」に対して「だれが（は）」にあたる文節が主語。\n主語：${subj.text}　述語：${pred.text}`,
      });
    }
    return make({
      category: '文法（主語・述語）',
      question: `次の文の述語はどれか。\n${s.text}`,
      answer: pred.text,
      distractors: otherChoices(s, pred),
      explanation: `「どうした」にあたる文節が述語。日本語の述語はふつう文末にある。\n主語：${subj.text}　述語：${pred.text}`,
    });
  }

  function genModifier() {
    let s;
    do { s = buildSentence(); } while (!s.parts.some((p) => ['time', 'place', 'adv', 'mod'].includes(p.role)) || s.parts.length < 5);
    const target = pick(s.parts.filter((p) => ['time', 'place', 'adv', 'mod'].includes(p.role)));
    const answerPart = target.role === 'mod' ? s.parts.find((p) => p.role === 'obj') : s.parts.find((p) => p.role === 'pred');
    return make({
      category: '文法（修飾・被修飾）',
      question: `次の文で「${target.text}」が修飾している文節はどれか。\n${s.text}`,
      answer: answerPart.text,
      distractors: otherChoices(s, answerPart).filter((t) => t !== target.text),
      explanation: target.role === 'mod'
        ? `「${target.text}」は名詞をふくむ文節「${answerPart.text}」をくわしくしている（連体修飾語）。\n「${target.text}${answerPart.text}」とつなげると意味が通る。`
        : `「${target.text}」は「どうした」にあたる「${answerPart.text}」をくわしくしている（連用修飾語）。\n「${target.text}${answerPart.text}」とつなげると意味が通る。`,
    });
  }

  const POS_ALL = ['名詞', '動詞', '形容詞', '形容動詞', '連体詞', '副詞', '助詞', '助動詞'];
  const POS_NEAR = {
    形容詞: ['形容動詞', '連体詞', '副詞', '動詞'],
    形容動詞: ['形容詞', '連体詞', '副詞', '名詞'],
    連体詞: ['形容詞', '形容動詞', '副詞', '名詞'],
    副詞: ['連体詞', '形容詞', '形容動詞', '接続詞'],
    名詞: ['動詞', '副詞', '連体詞', '助詞'],
    助詞: ['助動詞', '副詞', '接続詞', '名詞'],
    助動詞: ['助詞', '動詞', '形容詞', '副詞'],
  };

  function genPartOfSpeech() {
    let s, target, word, pos, note;
    for (;;) {
      s = buildSentence();
      const kind = rand(0, 4);
      if (kind === 0) {
        target = s.parts.find((p) => p.role === 'mod');
        if (!target) continue;
        word = target.text; pos = target.pos;
        note = pos === '連体詞'
          ? '活用がなく、名詞だけを修飾する語は連体詞。「大きな・小さな・この・その・あの」などに注意。'
          : pos === '形容動詞' ? '言い切りの形が「〜だ」になる（例：好きだ）ので形容動詞。' : '言い切りの形が「〜い」になるので形容詞。';
      } else if (kind === 1) {
        target = s.parts.find((p) => p.role === 'adv' && p.pos);
        if (!target) continue;
        word = target.text; pos = target.pos;
        note = pos === '形容詞' ? '「楽しく」は形容詞「楽しい」の連用形。' : '活用がなく、主に用言（動詞など）を修飾する語は副詞。';
      } else if (kind === 2) {
        target = s.parts.find((p) => p.role === 'subj');
        if (target.noun === '田中さん') continue;
        word = target.noun; pos = '名詞';
        note = '「が・は」をつけて主語になれる語は名詞（代名詞も名詞の一種）。';
      } else if (kind === 3) {
        const role = Math.random() < 0.5 ? 'subj' : 'obj';
        target = s.parts.find((p) => p.role === role);
        word = target.particle; pos = '助詞';
        note = '活用がなく、ほかの語について関係を示す付属語は助詞。';
      } else {
        target = s.parts.find((p) => p.role === 'pred');
        word = target.text.slice(-1); pos = '助動詞';
        note = `「${target.text}」の「${word}」は過去を表す助動詞「た」（「だ」は「た」がにごったもの）。`;
      }
      break;
    }
    const idx = s.parts.indexOf(target);
    const marked = s.parts.map((p, i) => {
      if (i !== idx) return p.text;
      if (word === p.text) return `【${word}】`;
      if (p.text.startsWith(word)) return `【${word}】${p.text.slice(word.length)}`;
      return `${p.text.slice(0, p.text.length - word.length)}【${word}】`;
    });
    const timeFirst = s.parts[0].role === 'time';
    const text = marked.map((m, i) => m + (timeFirst && i === 0 ? '、' : '')).join('') + '。';
    return make({
      category: '文法（品詞）',
      question: `【 】の単語の品詞は？\n${text}`,
      answer: pos,
      distractors: POS_NEAR[pos] || POS_ALL,
      explanation: `【${word}】は${pos}。${note}`,
    });
  }

  Q.extend('jp', [
    { w: 6, gen: genBunsetsuCount },
    { w: 5, gen: genSubjectPredicate },
    { w: 6, gen: genModifier },
    { w: 6, gen: genPartOfSpeech },
  ]);
})();
