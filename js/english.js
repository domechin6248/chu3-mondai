(function () {
  'use strict';
  const { pick, make, fromList } = Q;

  const vocab = [
    ['experience', '経験'], ['environment', '環境'], ['future', '未来・将来'], ['important', '重要な'],
    ['different', '異なる・違った'], ['popular', '人気のある'], ['interesting', '興味深い・おもしろい'],
    ['necessary', '必要な'], ['decide', '決める'], ['remember', '覚えている・思い出す'], ['forget', '忘れる'],
    ['borrow', '借りる'], ['lend', '貸す'], ['protect', '守る・保護する'], ['understand', '理解する'],
    ['believe', '信じる'], ['explain', '説明する'], ['introduce', '紹介する'], ['solve', '解決する'],
    ['increase', '増える・増やす'], ['reduce', '減らす'], ['culture', '文化'], ['language', '言語'],
    ['information', '情報'], ['history', '歴史'], ['population', '人口'], ['communicate', '意思を伝え合う'],
    ['ability', '能力'], ['chance', '機会'], ['opinion', '意見'], ['problem', '問題'], ['purpose', '目的'],
    ['tradition', '伝統'], ['energy', 'エネルギー'], ['earth', '地球'], ['island', '島'],
    ['library', '図書館'], ['hospital', '病院'], ['museum', '博物館・美術館'], ['careful', '注意深い'],
    ['famous', '有名な'], ['difficult', '難しい'], ['already', 'すでに・もう'], ['still', 'まだ・今でも'],
    ['through', '〜を通り抜けて'], ['during', '〜の間に'], ['without', '〜なしで'], ['between', '（2つ）の間に'],
    ['though', '〜だけれども'], ['abroad', '外国へ・外国で'], ['message', '伝言・メッセージ'],
    ['volunteer', 'ボランティア'], ['quickly', 'すばやく'], ['answer', '答える・答え'], ['visitor', '訪問者'],
    ['science', '科学・理科'], ['society', '社会'], ['reason', '理由'], ['effort', '努力'], ['peace', '平和'],
    ['war', '戦争'], ['respect', '尊敬する'], ['grow', '育てる・成長する'], ['continue', '続ける'],
    ['practice', '練習する'], ['happen', '起こる'], ['arrive', '到着する'], ['agree', '賛成する'],
    ['worry', '心配する'], ['message', '伝言・メッセージ'], ['sightseeing', '観光'],
  ].filter((v, i, arr) => arr.findIndex((o) => o[0] === v[0]) === i);

  // [原形, 過去形, 過去分詞]
  const verbs = [
    ['go', 'went', 'gone'], ['come', 'came', 'come'], ['see', 'saw', 'seen'], ['eat', 'ate', 'eaten'],
    ['write', 'wrote', 'written'], ['speak', 'spoke', 'spoken'], ['take', 'took', 'taken'],
    ['give', 'gave', 'given'], ['know', 'knew', 'known'], ['make', 'made', 'made'],
    ['buy', 'bought', 'bought'], ['teach', 'taught', 'taught'], ['think', 'thought', 'thought'],
    ['find', 'found', 'found'], ['read', 'read', 'read'], ['begin', 'began', 'begun'],
    ['swim', 'swam', 'swum'], ['sing', 'sang', 'sung'], ['drink', 'drank', 'drunk'],
    ['break', 'broke', 'broken'], ['choose', 'chose', 'chosen'], ['build', 'built', 'built'],
    ['leave', 'left', 'left'], ['meet', 'met', 'met'], ['tell', 'told', 'told'],
    ['become', 'became', 'become'], ['run', 'ran', 'run'], ['do', 'did', 'done'], ['have', 'had', 'had'],
    ['catch', 'caught', 'caught'], ['bring', 'brought', 'brought'], ['hear', 'heard', 'heard'],
    ['sell', 'sold', 'sold'], ['send', 'sent', 'sent'], ['stand', 'stood', 'stood'], ['lose', 'lost', 'lost'],
    ['feel', 'felt', 'felt'], ['forget', 'forgot', 'forgotten'], ['fly', 'flew', 'flown'],
    ['draw', 'drew', 'drawn'], ['grow', 'grew', 'grown'], ['wear', 'wore', 'worn'], ['sleep', 'slept', 'slept'],
    ['keep', 'kept', 'kept'], ['put', 'put', 'put'], ['cut', 'cut', 'cut'], ['ride', 'rode', 'ridden'],
    ['throw', 'threw', 'thrown'], ['fall', 'fell', 'fallen'], ['understand', 'understood', 'understood'],
  ];
  Q.enVerbs = verbs;
  const regularize = (v) => (v.endsWith('e') ? v + 'd' : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + 'ied' : v + 'ed');
  const third = (v) => (v === 'have' ? 'has' : /(s|sh|ch|x|o)$/.test(v) ? v + 'es' : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + 'ies' : v + 's');

  function genVerb() {
    const [base, past, pp] = pick(verbs);
    const askPP = Math.random() < 0.55;
    const ans = askPP ? pp : past;
    return make({
      category: '不規則動詞',
      question: `${base} の${askPP ? '過去分詞' : '過去形'}は？`,
      answer: ans,
      distractors: [base, past, pp, regularize(base), third(base), base + 'en'],
      explanation: `${base} − ${past} − ${pp}（原形 − 過去形 − 過去分詞）`,
    });
  }

  // [英文, 正解, ダミー, 解説]
  const grammar = [
    ['I have ( ) in Osaka since I was ten.', 'lived', ['live', 'living', 'to live'], '現在完了（継続）：have + 過去分詞。since 〜「〜以来ずっと」。'],
    ['Have you ever ( ) to Kyoto?', 'been', ['be', 'being', 'was'], '現在完了（経験）：Have you ever been to 〜?「〜へ行ったことがありますか」。'],
    ['I have already ( ) my homework.', 'finished', ['finish', 'finishing', 'to finish'], '現在完了（完了）：have already + 過去分詞「もう〜してしまった」。'],
    ['I have ( ) seen a panda.', 'never', ['ever', 'yet', 'since'], '現在完了（経験）の否定：have never + 過去分詞「一度も〜したことがない」。'],
    ['I haven\'t finished my homework ( ).', 'yet', ['already', 'ever', 'since'], '否定文の yet「まだ（〜していない）」。'],
    ['Ken has been ( ) TV for two hours.', 'watching', ['watched', 'watch', 'watches'], '現在完了進行形：have been + 〜ing「ずっと〜し続けている」。'],
    ['This book was ( ) by Natsume Soseki.', 'written', ['wrote', 'write', 'writing'], '受け身：be動詞 + 過去分詞。write − wrote − written。'],
    ['English is ( ) in many countries.', 'spoken', ['speaking', 'spoke', 'speak'], '受け身：be動詞 + 過去分詞。speak − spoke − spoken。'],
    ['The boy ( ) is running over there is my brother.', 'who', ['which', 'whose', 'what'], '関係代名詞：先行詞が「人」で主格なので who（that も可）。'],
    ['This is the book ( ) I bought yesterday.', 'which', ['who', 'where', 'what'], '関係代名詞：先行詞が「もの」で目的格なので which（that も可）。'],
    ['I have a friend ( ) father is a doctor.', 'whose', ['who', 'which', 'what'], '関係代名詞の所有格 whose：「父親が医者である友達」。'],
    ['Kyoto is a city ( ) many people visit every year.', 'which', ['who', 'where', 'whose'], 'visit の目的語が欠けているので関係代名詞 which（that も可）。where は使えない。'],
    ['Look at the girl ( ) under the tree.', 'sitting', ['sits', 'sat', 'to sit'], '現在分詞の後置修飾：the girl sitting under the tree「木の下に座っている少女」。'],
    ['This is the picture ( ) by my sister.', 'taken', ['took', 'taking', 'take'], '過去分詞の後置修飾：the picture taken by 〜「〜によって撮られた写真」。'],
    ['I want something cold ( ) drink.', 'to', ['for', 'of', 'in'], '不定詞の形容詞的用法：something cold to drink「何か冷たい飲み物」。'],
    ['It is important for us ( ) English every day.', 'to study', ['study', 'studied', 'studying'], 'It is 〜 for 人 to …「（人）にとって…することは〜だ」。'],
    ['It is kind ( ) you to help me.', 'of', ['for', 'to', 'with'], '人の性質を表す形容詞（kind など）のときは It is 〜 of 人 to …。'],
    ['My father told me ( ) my room.', 'to clean', ['clean', 'cleaning', 'cleaned'], 'tell 人 to 〜「（人）に〜するように言う」。'],
    ['I don\'t know what ( ) next.', 'to do', ['doing', 'do', 'did'], '疑問詞 + to 〜：what to do「何をすべきか」。'],
    ['Do you know ( ) to use this machine?', 'how', ['what', 'where', 'which'], 'how to 〜「〜のしかた」。'],
    ['I don\'t know ( ) he lives.', 'where', ['what', 'who', 'which'], '間接疑問文：疑問詞 + 主語 + 動詞の語順。where he lives「彼がどこに住んでいるか」。'],
    ['He was too tired ( ) walk.', 'to', ['so', 'that', 'for'], 'too 〜 to …「あまりに〜なので…できない」。'],
    ['Tom is ( ) than Ken.', 'taller', ['tall', 'tallest', 'more tall'], '比較級：〜er than …「…より〜」。'],
    ['This flower is the ( ) beautiful of all.', 'most', ['more', 'very', 'much'], '長い形容詞の最上級：the most + 形容詞。'],
    ['Mt. Fuji is the ( ) mountain in Japan.', 'highest', ['higher', 'high', 'most high'], '最上級：the 〜est in …「…の中で最も〜」。'],
    ['She can play the piano as ( ) as her mother.', 'well', ['better', 'best', 'good'], 'as 〜 as …「…と同じくらい〜」。play を修飾するので副詞 well。'],
    ['Which do you like ( ), summer or winter?', 'better', ['more good', 'best', 'well'], 'Which do you like better, A or B?「AとBではどちらが好きですか」。'],
    ['I\'m looking forward to ( ) you.', 'seeing', ['see', 'saw', 'seen'], 'look forward to 〜ing「〜するのを楽しみにする」。to の後は動名詞。'],
    ['She is good at ( ) pictures.', 'drawing', ['draw', 'drew', 'to draw'], '前置詞 at の後は動名詞：be good at 〜ing「〜するのが得意だ」。'],
    ['If I ( ) a bird, I could fly to you.', 'were', ['am', 'be', 'is'], '仮定法過去：If 主語 + 過去形（be動詞は were）, 主語 + could …。'],
    ['I wish I ( ) speak French.', 'could', ['can', 'will', 'may'], '仮定法：I wish + 主語 + 過去形「〜ならいいのに」。'],
    ['Let me ( ) you my picture.', 'show', ['to show', 'showing', 'showed'], 'let 人 + 動詞の原形「（人）に〜させる」。'],
    ['My mother made me ( ) my homework first.', 'do', ['to do', 'doing', 'did'], '使役動詞 make 人 + 動詞の原形「（人）に〜させる」。'],
    ['The news made us ( ).', 'happy', ['happily', 'happiness', 'to happy'], 'make A B「AをBにする」。B には形容詞。'],
    ['There ( ) many students in the gym.', 'are', ['is', 'be', 'was'], 'There are + 複数名詞「〜がいる」。'],
    ['I\'ll call you when I ( ) home.', 'get', ['will get', 'got', 'getting'], '時を表す when の中では、未来のことも現在形で表す。'],
  ];

  Q.register({
    id: 'en',
    name: '英語',
    mark: '英',
    topics: '重要単語・不規則動詞・現在完了・受け身・関係代名詞・仮定法',
    generators: [
      { w: 3, gen: fromList('英単語（英→日）', vocab, {
        q: (it) => `次の英単語の意味は？\n${it[0]}`,
        a: (it) => it[1],
        e: (it) => `${it[0]}：${it[1]}`,
      }) },
      { w: 3, gen: fromList('英単語（日→英）', vocab, {
        q: (it) => `「${it[1]}」を表す英単語は？`,
        a: (it) => it[0],
        e: (it) => `${it[1]}：${it[0]}`,
      }) },
      { w: 3, gen: genVerb },
      { w: 5, gen: fromList('英文法', grammar, {
        q: (it) => `( ) に入る最も適切な語（句）は？\n${it[0]}`,
        a: (it) => it[1], d: (it) => it[2],
        e: (it) => `${it[0].replace('( )', it[1])}\n${it[3]}`,
      }) },
    ],
  });
})();
